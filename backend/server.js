const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Portfolio Data (You can later move this to a JSON file)
const portfolioData = {
  name: process.env.USER_NAME || "Navjot Kaur",
  role: process.env.USER_ROLE || "Full Stack Developer & AI Enthusiast",
  skills: [
    "React",
    "Node.js",
    "Python",
    "MongoDB",
    "Express.js",
    "NLP",
    "Machine Learning",
  ],
  projects: [
    {
      name: "Portfolio Assistant Chatbot",
      description:
        "An AI-powered chatbot that answers questions about my portfolio and experience",
      tech: "Node.js, Groq API, React, NLP",
    },
    {
      name: "Regression & Classification Models",
      description: "Machine learning models for predictive analysis",
      tech: "Python, Scikit-learn, Pandas",
    },
    {
      name: "E-commerce Website & App",
      description: "Full-stack e-commerce platform",
      tech: "React, Node.js, MongoDB",
    },
    {
      name: "Weather App",
      description: "Real-time weather application",
      tech: "React, Weather API",
    },
  ],
  experience: "1 year of freelance web development",
  education: "2-year Diploma: Computer System Technician (Networking)",
  email: process.env.USER_EMAIL || "navjotkr13499@gmail.com",
  available_for: ["Freelance", "Full-time", "Internship"],
};

// Create a dynamic system prompt
const createSystemPrompt = () => {
  return `
You are a personal assistant for ${portfolioData.name}, a ${portfolioData.role}.
Your job is to answer questions about their portfolio, skills, and experience in a friendly and professional manner.

ABOUT ${portfolioData.name.toUpperCase()}:
- Role: ${portfolioData.role}
- Email: ${portfolioData.email}
- Available for: ${portfolioData.available_for.join(", ")}
- Education: ${portfolioData.education}
- Experience: ${portfolioData.experience}

SKILLS:
${portfolioData.skills.map((skill) => `• ${skill}`).join("\n")}

PROJECTS:
${portfolioData.projects.map((proj) => `• ${proj.name}: ${proj.description} (Tech: ${proj.tech})`).join("\n")}

IMPORTANT GUIDELINES:
1. Always respond in first person as ${portfolioData.name}'s assistant
2. Be friendly, professional, and concise (keep responses under 150 words unless asked for more detail)
3. If asked about something not in this profile, politely say: "I don't have that information, but you can contact ${portfolioData.name} directly at ${portfolioData.email}"
4. Never make up projects or skills that aren't listed
5. When appropriate, encourage the user to check out the GitHub repository or contact directly
6. Always be enthusiastic about ${portfolioData.name}'s work in AI and web development
`;
};

// Store conversation history (in-memory for now, can be upgraded to a database)
const conversationHistory = {};

// POST route to handle chat messages
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  // Validation: Check if message is provided and not empty
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  // Create a unique session ID if not provided
  const currentSessionId = sessionId || `session-${Date.now()}`;

  // Initialize session history if it doesn't exist
  if (!conversationHistory[currentSessionId]) {
    conversationHistory[currentSessionId] = [];
  }

  try {
    // Add user message to history
    conversationHistory[currentSessionId].push({
      role: "user",
      content: message,
    });

    // Keep only last 10 messages to avoid token limits
    if (conversationHistory[currentSessionId].length > 10) {
      conversationHistory[currentSessionId] = conversationHistory[
        currentSessionId
      ].slice(-10);
    }

    // Create messages array with system prompt
    const messages = [
      { role: "system", content: createSystemPrompt() },
      ...conversationHistory[currentSessionId],
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: 0.7, // Balanced between creative and factual
      max_tokens: 512, // Limit response length
    });

    const botReply = completion.choices[0].message.content;

    // Add bot response to history
    conversationHistory[currentSessionId].push({
      role: "assistant",
      content: botReply,
    });

    // Return response with session ID for continuity
    res.json({ reply: botReply, sessionId: currentSessionId });
  } catch (error) {
    console.error("❌ Groq API Error:", error.message);

    // Provide user-friendly error message
    if (error.message.includes("authentication")) {
      return res
        .status(500)
        .json({
          error: "Authentication failed. Check your Groq API key.",
        });
    }

    res.status(500).json({
      error:
        "Sorry, I encountered an error. Please try again in a moment.",
    });
  }
});

// Health check endpoint (useful for monitoring)
app.get("/health", (req, res) => {
  res.json({ status: "✅ Server is running", timestamp: new Date() });
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 System Prompt initialized for: ${portfolioData.name}`);
});

