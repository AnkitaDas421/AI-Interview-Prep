import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

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
Generate 5 ${difficulty} interview questions for a ${role}.
Return only the questions as plain text.
`;

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

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});