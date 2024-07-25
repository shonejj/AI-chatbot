document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const suggestionBox = document.getElementById('suggestionBox');
    const suggestionBox1 = document.getElementById('suggestionBox1');
    const suggestionBox2 = document.getElementById('suggestionBox2');
    const suggestionBox3 = document.getElementById('suggestionBox3');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chatContainer');
    const modelDropdown = document.getElementById('modelDropdown');
    const modelList = document.getElementById('modelList');
    const contextSwitch = document.getElementById('flexSwitchCheckChecked');
    const clearChatButton = document.getElementById('clearChatButton');
    const restartButton = document.getElementById('restartButton');
    const refreshbutton = document.getElementById('refreshbutton');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const LLM = document.getElementById('LLM');
    const Productivity = document.getElementById('Productivity');
    const salespitch = document.getElementById('salespitch');
    const historylist = document.getElementById('historylist');
    const closebutton = document.getElementById('closebutton');
    const apiKey = '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';
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    let selectedModel = 'Llama3-70b-8192';
    let pageContent = '';

    // Function to capture page content excluding the specified div
    // function capturePageContent() {
    //     const excludedDiv = document.querySelector('.overall-chat-container');
    //     let tempContent = '';

    //     function traverseAndCollect(node) {
    //         if (node !== excludedDiv && !excludedDiv.contains(node)) {
    //             if (node.nodeType === Node.TEXT_NODE) {
    //                 tempContent += node.textContent + ' ';
    //             } else if (node.nodeType === Node.ELEMENT_NODE) {
    //                 node.childNodes.forEach(traverseAndCollect);
    //             }
    //         }
    //     }

    //     document.body.childNodes.forEach(traverseAndCollect);
    //     return tempContent.trim();
    // }

    // Capture page content when the checkbox is enabled
    // contextSwitch.addEventListener('change', function() {
    //     if (this.checked) {
    //         pageContent = capturePageContent();
    //         console.log(pageContent);
    //     } else {
    //         pageContent = '';
    //     }
    // });

    // Enter button for input
    chatInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendButton.click();
        }
    });


    
    window.addEventListener('message', function(event) {
        console.log(event.data)
        togglebuttonEnabled =1;
        pagecontent = event.data;
    }, false);

    function fetchContent() {
        // Request content from the parent page
        window.parent.postMessage('requestContent', '*'); // Replace '*' with specific origin if needed
    }

    function toggleContent(checkbox) {
        if (checkbox.checked) {
            fetchContent();
        } else {
            // document.getElementById("dummyContent").innerText = "";
        }
    }


 
 
const suggestions = [
    { keyword: '/chart', box: document.getElementById('suggestionBox') },
    { keyword: '/doc', box: document.getElementById('suggestionBox1') },
    { keyword: '/analysis', box: document.getElementById('suggestionBox2') },
    { keyword: '/page', box: document.getElementById('suggestionBox3') },
];

chatInput.addEventListener('input', function() {
    const inputValue = this.value.toLowerCase();

    if (inputValue.includes('/')) {
        let anySuggestionVisible = false;

        suggestions.forEach(suggestion => {
            if (inputValue === suggestion.keyword || inputValue.startsWith(suggestion.keyword + ' ')) {
                suggestion.box.classList.remove('show');
                suggestion.box.style.display = 'none';
            } else if (inputValue.startsWith(suggestion.keyword.substring(0, inputValue.length))) {
                suggestion.box.style.display = 'block'; // Ensure box is visible before transition
                requestAnimationFrame(() => {
                    suggestion.box.classList.add('show'); // Trigger transition
                });
                anySuggestionVisible = true;
            } else {
                suggestion.box.classList.remove('show'); // Remove transition class
                setTimeout(() => {
                    suggestion.box.style.display = 'none'; // Hide after transition
                }, 300); // Match the transition duration
            }
        });

        if (!anySuggestionVisible) {
            suggestions.forEach(suggestion => {
                suggestion.box.classList.remove('show');
                setTimeout(() => {
                    suggestion.box.style.display = 'none';
                }, 300);
            });
        }
    } else {
        suggestions.forEach(suggestion => {
            suggestion.box.classList.remove('show');
            setTimeout(() => {
                suggestion.box.style.display = 'none';
            }, 300);
        });
    }
});

    modelList.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            selectedModel = e.target.getAttribute('data-model');
            modelDropdown.textContent = e.target.textContent;
        }
    });

    const defaultQuestions = document.querySelectorAll('.default-question');

    function hideDefaultQuestions() {
        defaultQuestions.forEach(question => {
            question.style.display = 'none';
        });
    }

    defaultQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const userMessage = this.textContent.trim();
            if (userMessage) {
                chatInput.value = userMessage;  // Set the input value to the clicked question
                hideDefaultQuestions();  // Hide default questions
                sendButton.click();  // Simulate the click on the send button
            }
        });
    });

    sendButton.addEventListener('click', function() {
        const userMessage = chatInput.value;
        if (userMessage.trim()) {
            chatInput.value = '';
            appendMessage('user', userMessage);
            hideDefaultQuestions();  // Hide default questions
            if (userMessage.startsWith('/chart')) {
                const message = userMessage.replace('/chart', '');
                generateGraphFromData([], message); // Use empty array for data, actual data to be processed later
            } 
            else if (userMessage.startsWith('/doc')) {
                const message = userMessage.replace('/doc', '');
                sendMessageToGroqAPIForFile(message);
            }
            else if((togglebuttonEnabled == 1 )&& (userMessage.startsWith('/page'))){
                const message = userMessage.replace('/page', '');
                sendMessageToGroqAPI(message+ pagecontent);
            } 
            else if((togglebuttonEnabled == 1 )&& (userMessage.startsWith('/analysis'))){
                const message = userMessage.replace('/analysis', '');
                generateGraphFromData([pagecontent], message);
            } 
            else if(userMessage.startsWith('/filedraw')){
                const message = userMessage.replace('/filedraw', '');
                generateGraphFromData(fileContent,message);
            }
            else {
                sendMessageToGroqAPI(userMessage);
            }
        }
    });

    function appendMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.innerHTML = `<div class="${role}-bubble">${content}</div>`;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessageToGroqAPI(message) {
        const requestBody = {
            messages: [{ role: 'user', content: `${pageContent}\n\n${message}` }],
            model: selectedModel
        };

        console.log("usermessage:" , requestBody.messages);

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            const botMessage = data.choices[0].message.content;
            appendMessage('bot', botMessage);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    clearChatButton.addEventListener('click', function() {
        chatContainer.innerHTML = '';
    });

    // restartButton.addEventListener('click', function() {
    //     chatContainer.innerHTML = '';
    //     console.log("reserted")
    // });

 

    uploadButton.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                processFileContent(e.target.result, file.type);
            };
            reader.readAsText(file);
        }
    });

    function processFileContent(content, fileType) {
        let parsedData;
        if (fileType === 'text/csv') {
            parsedData = parseCSV(content);
        } else if (fileType === 'text/plain') {
            parsedData = content.split('\n').filter(line => line.trim() !== '').join('\n');
        } else {
            alert('Unsupported file type. Please upload a CSV or text file.');
            return;
        }
        const userMessage = chatInput.value;
        if (userMessage.trim()) {
            generateGraphFromData(parsedData, userMessage);
            console.log(parsedData)
        } else {
            appendMessage('bot', 'Please enter a query to generate a relevant chart.');   
        }
    }

    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j];
            }
            result.push(obj);
        }
        return result;
    }

    function generateGraphFromData(data, userMessage) {
        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: `
                        Generate Only JSON data in the specified format as the response. Do not include any text or explanation, also use this below jsonData format as a reference to generate the chart json data based on the user query.
                        jsonData = {
                            "chartType": "bar", // or "line", "pie"
                            "data": {
                                "labels": ["January", "February", "March", "April", "May"],
                                "datasets": [{
                                    "label": "My First Dataset",
                                    "data": [65, 59, 80, 81, 56],
                                    "backgroundColor": [
                                        "rgba(255, 99, 132, 0.2)",
                                        "rgba(54, 162, 235, 0.2)",
                                        "rgba(255, 206, 86, 0.2)",
                                        "rgba(75, 192, 192, 0.2)",
                                        "rgba(153, 102, 255, 0.2)"
                                    ],
                                    "borderColor": [
                                        "rgba(255, 99, 132, 1)",
                                        "rgba(54, 162, 235, 1)",
                                        "rgba(255, 206, 86, 1)",
                                        "rgba(75, 192, 192, 1)",
                                        "rgba(153, 102, 255, 1)"
                                    ],
                                    "borderWidth": 1
                                }]
                            },
                            "options": {
                                "scales": {
                                    "y": {
                                        "beginAtZero": true
                                    }
                                }
                            }
                        }
                    `
                },
                {
                    role: 'user',
                    content: `${userMessage}\n\n${data}`
                }
            ],
            model: selectedModel
        };
        console.log(data)

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            try {
                const botMessage = data.choices[0].message.content;
                const jsonResponse = JSON.parse(botMessage);
                generateChart(jsonResponse);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                appendMessage('bot', 'Please ask a simple query');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('bot', 'Error occurred while processing the request.');
        });
        appendMessage('bot', 'Graph generated from the uploaded data.');        
    }

    function generateChart(jsonData) {
        const ctx = document.createElement('canvas');
        document.getElementById('chatContainer').appendChild(ctx);

        const chartType = jsonData.chartType || 'bar'; // Default to bar chart if not specified
        const data = jsonData.data || {};
        const options = jsonData.options || {};

        new Chart(ctx, {
            type: chartType,
            data: data,
            options: options
        });
    }
});


//file upload 

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Display the file name in the document section
        document.getElementById('documentSection').innerHTML = `<img src="icons8-file-100.png" style="
        height: 35px;">${file.name}`;
        document.getElementById('documentSection1').style.display = 'block';

        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            window.fileContent = fileContent;
            console.log(fileContent); 
        };
        reader.readAsText(file); // Reads the file as text
    } else {
        document.getElementById('documentSection1').style.display = 'none';
    }
});

document.getElementById('uploadclearButton').addEventListener('click', function() { 
    document.getElementById('documentSection1').style.display = 'none';
    window.fileContent = null; // Clear the global variable
    document.getElementById('fileInput').value = ''; // Clear the file input
    console.log("File content cleared");
});

document.getElementById('chartclearButton').addEventListener('click', function() { 
    document.getElementById('suggestionBox').style.display = 'none';
});

document.getElementById('textclearButton').addEventListener('click', function() { 
    document.getElementById('suggestionBox1').style.display = 'none';
});

document.getElementById('sendButton').addEventListener('click', function() {
    if (window.fileContent) {
        console.log("File content to be sent:", window.fileContent);
    } else {
        console.log("No file content available");
    }
});




function sendMessageToGroqAPIForFile(message) {
    const requestBody = {
        messages: [  {role: 'system',content: `You are a Helpful Ai Assistant , you will summarize the answer in a short and simpler way based on the input user query `},{ role: 'user', content: `${fileContent}\n\n${message}` }],
        model:  'llama3-8b-8192'
    };

    fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = data.choices[0].message.content;
        appendMessage('bot', botMessage);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
  }

  window.addEventListener('message', function(event) {
    console.log(event.data)
    togglebuttonEnabled =1;
    pagecontent = event.data;
}, false);

function fetchContent() {
    // Request content from the parent page
    window.parent.postMessage('requestContent', '*'); // Replace '*' with specific origin if needed
}

function toggleContent(checkbox) {
    if (checkbox.checked) {
        fetchContent();
    } else {
        // document.getElementById("dummyContent").innerText = "";
    }
}