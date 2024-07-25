document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chatContainer');
    const modelDropdown = document.getElementById('modelDropdown');
    const modelList = document.getElementById('modelList');
    const contextSwitch = document.getElementById('flexSwitchCheckChecked');
    const clearChatButton = document.getElementById('clearChatButton');
    const restartButton = document.getElementById('restartButton');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const apiKey = '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';
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';


    let selectedModel = 'llama3-8b-8192';
    let pageContent = '';
    let conversationMemory = [];

    // Function to capture page content excluding the specified div
    function capturePageContent() {
        const excludedDiv = document.querySelector('.overall-chat-container');
        let tempContent = '';

        function traverseAndCollect(node) {
            if (node !== excludedDiv && !excludedDiv.contains(node)) {
                if (node.nodeType === Node.TEXT_NODE) {
                    tempContent += node.textContent + ' ';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.childNodes.forEach(traverseAndCollect);
                }
            }
        }

        document.body.childNodes.forEach(traverseAndCollect);
        return tempContent.trim();
    }

    // Capture page content when the checkbox is enabled
    contextSwitch.addEventListener('change', function() {
        if (this.checked) {
            pageContent = capturePageContent();
            console.log(pageContent);
        } else {
            pageContent = '';
        }
    });

    // Enter button for input
    chatInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendButton.click();
        }
    });
    });

    modelList.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            selectedModel = e.target.getAttribute('data-model');
            modelDropdown.textContent = e.target.textContent;
        }
    });

    sendButton.addEventListener('click', function() {
        const userMessage = chatInput.value;
        if (userMessage.trim()) {
            chatInput.value = '';
            appendMessage('user', userMessage);
            sendMessageToGroqAPI(userMessage);
        }
    });

    function appendMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.innerHTML = `<div class="${role}-bubble">${content}</div>`;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Add message to conversation memory
        conversationMemory.push({ role, content });
    }

    function sendMessageToGroqAPI(message) {
        const requestBody = {
            messages: conversationMemory.concat({ role: 'user', content: `${pageContent}\n\n${message}` }),
            model: selectedModel
        };

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
        conversationMemory = [];
    });

    restartButton.addEventListener('click', function() {
        chatContainer.innerHTML = '';
        conversationMemory = [];
        // Add initial prompt or action if needed
    });

    // uploadButton.addEventListener('click', function() {
    //     console.log('upload');
    // });

    function processFileContent(content, fileType) {
        if (fileType === 'text/csv') {
            const parsedData = parseCSV(content);
            generateGraphFromData(parsedData);
        } else if (fileType === 'text/plain') {
            const trimmedContent = content.split('\n')
                                    .filter(line => line.trim() !== '')
                                    .join('\n');

            generateGraphFromData(trimmedContent);
        } else {
            alert('Unsupported file type. Please upload a CSV or text file.');
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




    

    function generateGraphFromData(data) {
        const requestBody = {
            messages: conversationMemory.concat({ role: 'user', content: `${data}\n\n${message}` }),
            model: selectedModel
        };

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
        appendMessage('bot', 'Graph generated from the uploaded data.');
        console.log('Data:', data);
    }







// chart function
jsonDataFormat = {
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

generateChart(jsonDataFormat)

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
