document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatContainer = document.getElementById('chatContainer');
    const modelDropdown = document.getElementById('modelDropdown');
    const modelList = document.getElementById('modelList');
    const contextSwitch = document.getElementById('flexSwitchCheckChecked');

    let selectedModel = 'llama3-8b-8192';
    let pageContent = '';

    // Capture page content when the checkbox is enabled
    contextSwitch.addEventListener('change', function() {
        if (this.checked) {
            pageContent = document.body.innerText;
            console.log(pageContent)
        } else {
            pageContent = '';
        }
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
    }

    function sendMessageToGroqAPI(message) {
        const apiKey = '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';
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

        const requestBody = {
            messages: [{ role: 'user', content: `${pageContent}\n\n${message}` }],
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
});
