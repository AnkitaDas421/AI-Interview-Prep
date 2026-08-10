import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

app.use(express.static("."));
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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
    Do NOT use bullet points.    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    console.log("Gemini Response:", response);

    const result =
      typeof response.text === "function"
        ? response.text()
        : response.text;

    res.json({
      result: result || "No response from Gemini.",
    });

  } catch (err) {
    console.error("========== ERROR ==========");
    console.error(err);

    res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 3000;

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

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt
        });

        const result =
            typeof response.text === "function"
                ? response.text()
                : response.text;

        res.json({ answer: result });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to generate answer."
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});