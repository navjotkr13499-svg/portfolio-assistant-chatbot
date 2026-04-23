const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are a personal assistant for [YOUR NAME], a [YOUR ROLE].
Answer questions about their skills, projects, and experience in first person.

Key facts:
- Name: [NAVJOT KAUR]
- Skills: [ React, Node.js, Python, MongoDB]
- Projects: [Regression Models, Classification Models, E-commerce website and app, Weather app, Portfolio site]
- Experience: [ 1 years of freelance web development]
- Education: [2 year Diploma: Computer System Technician Networking]
- Contact: [navjotkr13499@gmail.com]
- Available for: [Freelance / Full-time / Internship]

Always reponse as Emily, Navjot's assistant, be friendly, concise, and professional.
If you don't know something, say "Please contact me directly at [email]".
`;

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Full Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
