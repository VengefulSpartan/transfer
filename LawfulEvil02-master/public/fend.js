const id = "User__427054";
const message_container = document.getElementById("chat-messages");
const userInp = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

const typingSpeed = 30;
let typingProcess = true; 
function stopTyping() {
    typingProcess = false;
    sendButton.textContent = "Send";
    sendButton.id = "send-button";
}


document.addEventListener("click", (event) => {
    if (event.target.id === "stop-button") {
        stopTyping();
    }
});

function typeMessage(text, sender) {
    typingProcess = true; 
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    message_container.insertBefore(messageDiv, typingIndicator);

    let index = 0;

    function type() {
        if (!typingProcess) {
            console.log("Typing Stopped Midway");
            return;
        }

        if (index < text.length) {
            messageDiv.textContent += text.charAt(index);
            index++;
            message_container.scrollTop = message_container.scrollHeight;
            setTimeout(type, typingSpeed);
        } else {
           
            stopTyping();
        }
    }

    type();
}

async function sendMessage() {
    console.log("Executing SendMessage");
    const message = userInp.value.trim();
    if (!message) return;

    userInp.value = "";
    userInp.disabled = true;

    sendButton.textContent = "Stop";
    sendButton.id = "stop-button";

    typingIndicator.style.display = "block";
    message_container.scrollTop = message_container.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, id }),
        });

        const data = await response.json();
        typingIndicator.style.display = "none";
        addMessage(message, "user");
        typeMessage(data.response, "bot");
    } catch (error) {
        console.error("Error:", error);
        addMessage("There was an error in response, please try again later", "bot");
        typingIndicator.style.display = "none";
    }

    userInp.disabled = false;
    userInp.focus();
}

function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    message_container.insertBefore(messageDiv, typingIndicator);
    message_container.scrollTop = message_container.scrollHeight;
}


sendButton.addEventListener("click", sendMessage);
userInp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

userInp.focus();
