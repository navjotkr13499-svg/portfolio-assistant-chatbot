const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ── Toggle Chat Window ──
chatToggle.addEventListener('click', () => {
  chatWindow.classList.toggle('active');
  if (chatWindow.classList.contains('active')) {
    userInput.focus();
  }
});

closeChat.addEventListener('click', () => {
  chatWindow.classList.remove('active');
});

// ── Add Message Bubble ──
function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// ── Typing Indicator ──
function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
  typingDiv.id = 'typingIndicator';

  typingDiv.innerHTML = `
    <div class="bubble">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;

  chatMessages.appendChild(typingDiv);
  scrollToBottom();
}

function hideTyping() {
  const typingDiv = document.getElementById('typingIndicator');
  if (typingDiv) typingDiv.remove();
}

// ── Scroll to Bottom ──
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Send Message ──
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  addMessage(message, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  // Show typing indicator
  showTyping();

  try {
   const response = await fetch('https://urban-goggles-wrwg74556wjg35g4g-3000.app.github.dev/chat', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    hideTyping();
    addMessage(data.reply, 'bot');

  } catch (error) {
    hideTyping();
    addMessage('Oops! Something went wrong. Please try again. 😓', 'bot');
    console.error('Error:', error);
  }

  sendBtn.disabled = false;
  userInput.focus();
}

// ── Event Listeners ──
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
