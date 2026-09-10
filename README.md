# 🤖 AI Interview Prep Assistant

An AI-powered interview preparation web application that generates role-specific interview questions and interview-ready answers based on the selected job role and difficulty level.

🔗 **Live Demo:** https://ai-interview-prep-chcl.onrender.com

🔗 **GitHub:** https://github.com/AnkitaDas421/AI-Interview-Prep

---

## 📌 Overview

Preparing for technical interviews can be difficult when you don't know what questions to practice.

**AI Interview Prep Assistant** helps candidates prepare by generating customized interview questions based on:

- Job role
- Difficulty level
- Technical concepts
- Behavioral scenarios
- Real-world situations

Users can also generate AI-powered answers for individual questions and download their complete preparation material as a PDF.

---

## ✨ Features

- 🎯 Role-specific interview questions
- 📊 Easy, Medium, and Hard difficulty levels
- 🤖 AI-generated interview questions
- 💡 AI-generated interview-ready answers
- 📋 Copy questions and answers
- 🔄 Generate a new set of questions
- 📄 Download interview preparation as PDF
- 📱 Responsive design
- 🌙 Modern dark/glassmorphism UI
- 🚀 Deployed on Render

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### AI

- Groq API
- `openai/gpt-oss-20b`

### Libraries & Tools

- jsPDF
- html2canvas
- dotenv
- CORS
- Git
- GitHub
- Render

---

## ⚙️ How It Works

1. Enter a **job role**.
2. Select the desired **difficulty level**.
3. Click **Generate Questions**.
4. The backend sends the request to the Groq API.
5. AI-generated interview questions are displayed.
6. Click **Generate Answer** for any question.
7. Copy questions or answers for practice.
8. Download the preparation material as a PDF.

---

## 🏗️ Project Structure

```text
AI-Interview-Prep/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md