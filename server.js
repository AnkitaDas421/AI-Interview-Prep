import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(express.static("."));
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateAI(prompt) {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

app.post("/generate", async (req, res) => {
  try {
    console.log("Request:", req.body);

    const { role, difficulty } = req.body;

    const prompt = `
Generate 10 ${difficulty} interview questions for the ${role} role.

Include:
- Technical questions
- Behavioral questions
- Scenario-based questions

Return only 10 interview questions.
Do NOT number them.
Put each question on a new line.
Do NOT use bullet points.
`;

    const result = await generateAI(prompt);

    console.log("Groq Response:", result);

    res.json({
      result: result || "No response from AI.",
    });

  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);

    res.status(500).json({
      error: error.message || "AI service temporarily unavailable.",
    });
  }
});

app.post("/answer", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
You are an experienced technical interviewer.

Answer the following interview question as if you are a job candidate.

Question:
${question}

Requirements:
- Give a direct interview-ready answer.
- Use simple, professional English.
- Keep the answer between 120 and 180 words.
- Do NOT use Markdown.
- Do NOT use **bold**, headings, bullet points, or numbered lists.
- Do NOT include code blocks unless the question specifically asks for code.
- If the question is theoretical, explain it clearly in paragraph form.
- If the question asks for code, provide a short explanation followed by clean code.
- Return only the answer text.
`;

    const result = await generateAI(prompt);

    res.json({
      answer: result || "No answer generated.",
    });

  } catch (error) {
    console.error("Answer Error:", error);

    res.status(500).json({
      error: error.message || "Failed to generate answer.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});