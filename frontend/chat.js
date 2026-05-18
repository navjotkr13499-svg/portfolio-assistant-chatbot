// Configuration
const API_URL = "https://navjotkr13499-svg-5000.app.github.dev/api/chat";
let sessionId = null;

// DOM Elements
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatForm = document.getElementById("chatForm");

// Event Listeners
chatForm.addEventListener("submit", handleSendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage(e);
  }
});

// Handle Send Message
async function handleSendMessage(e) {
  e.preventDefault();

  const message = messageInput.value.trim();

  // Validation
  if (!message) {
    alert("Please type a message!");
    return;
  }

  // Disable input while sending
  messageInput.disabled = true;
  sendBtn.disabled = true;

  // Display user message
  displayMessage(message, "user");

  // Clear input
  messageInput.value = "";

  // Show typing indicator
  showTypingIndicator();

  try {
    // Send message to backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Store session ID for conversation continuity
    if (data.sessionId) {
      sessionId = data.sessionId;
    }

    // Remove typing indicator
    removeTypingIndicator();

    // Display bot response
    displayMessage(data.reply, "bot");

    // Auto-scroll to bottom
    scrollToBottom();
  } catch (error) {
    console.error("Error:", error);
    removeTypingIndicator();
    displayMessage(
      "Sorry, I encountered an error. Please try again in a moment.",
      "bot"
    );
  } finally {
    // Re-enable input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Display Message in Chat
function displayMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const messageParagraph = document.createElement("p");
  messageParagraph.textContent = text;

  messageDiv.appendChild(messageParagraph);
  chatMessages.appendChild(messageDiv);

  scrollToBottom();
}

// Show Typing Indicator
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message";
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  typingDiv.id = "typingIndicator";

  chatMessages.appendChild(typingDiv);
  scrollToBottom();
}

// Remove Typing Indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Auto-scroll to Bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
