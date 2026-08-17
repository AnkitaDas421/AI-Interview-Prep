let questionCount = 0;
let answerCount = 0;
let pdfCount = 0;
async function generateQuestions() {

    const role = document.getElementById("role").value.trim();

    if(role===""){
        alert("Please enter a job role.");
        return;
    }
    const difficulty = document.getElementById("difficulty").value;
    const output = document.getElementById("output");

    output.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <h2>Generating Questions...</h2>
            <p>Please wait while AI prepares your interview.</p>
        </div>
    `;

    try {

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                role,
                difficulty
            })

        });

        const data = await response.json();

        if (!response.ok) {

        let message = data.error || "Something went wrong.";

        if (message.includes("429") || message.includes("Quota")) {
            message = "AI request limit reached. Please wait a minute and try again.";
        }

        output.innerHTML = `
            <div class="error-card">
                <h2>⚠ Error</h2>
                <p>${message}</p>
            </div>
        `;

        return;
}

        let questions = data.result
            .split("\n")
            .filter(q => q.trim() !== "");
        questionCount += questions.length;
        document.getElementById("questionCount").innerText = questionCount;

        output.innerHTML = "";

        questions.forEach((question, index) => {

            output.innerHTML += `
                <div class="question-card">

                    <div class="question-header">

                        <h3>🎯 Question ${index + 1}</h3>

                        <button class="copy-btn"
                            onclick="copyQuestion(this)">

                            <i class="fa-regular fa-copy"></i>
                            Copy

                        </button>

                    </div>

                    <p>${question}</p>

                    <div class="question-actions">

                        <button class="answer-btn"
                            onclick="generateAnswer(this)">

                            ✨ Generate Answer

                        </button>

                    </div>

                    <div class="answer-box"></div>

                </div>
            `;

        });

        output.innerHTML += `

        <div class="bottom-buttons">

            <button class="generate-btn"
            onclick="generateQuestions()">

                🔄 Generate Again

            </button>

            <button class="pdf-btn"
            onclick="downloadPDF()">

                📄 Download PDF

            </button>

        </div>

        `;

    }

    catch (err) {

        output.innerHTML = `
            <div class="error-card">
                <h2>❌ Server Error</h2>
                <p>Could not connect to backend.</p>
            </div>
        `;

        console.error(err);

    }

}

function copyQuestion(button) {

    const text = button.parentElement.nextElementSibling.innerText;

    navigator.clipboard.writeText(text);

    button.innerHTML = "✅ Copied";

    setTimeout(() => {

        button.innerHTML = `
            <i class="fa-regular fa-copy"></i> Copy
        `;

    }, 1500);

}

function downloadPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const role = document.getElementById("role").value;
    const difficulty = document.getElementById("difficulty").value;

    doc.setFontSize(20);
    doc.text("AI Interview Prep Assistant", 20, 20);

    doc.setFontSize(12);
    doc.text(`Role: ${role}`, 20, 35);
    doc.text(`Difficulty: ${difficulty}`, 20, 45);

    let y = 60;

    const questionCards = document.querySelectorAll(".question-card");

    questionCards.forEach((card, index) => {

        const question = card.querySelector("p").innerText;

        const questionLines = doc.splitTextToSize(
            question,
            170
        );

        if (y + questionLines.length * 7 > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFont("helvetica", "bold");
        doc.text(`Question ${index + 1}`, 20, y);

        y += 8;

        doc.setFont("helvetica", "normal");
        doc.text(questionLines, 20, y);

        y += questionLines.length * 6 + 12;

const answerElement = card.querySelector(".answer-text");

if (answerElement) {

    let answer = answerElement.innerText;

    // Remove markdown formatting
    answer = answer
        .replace(/\*\*/g, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`/g, "")
        .replace(/#{1,6}\s?/g, "")
        .replace(/>\s?/g, "");

    doc.setFont("helvetica", "bold");
    doc.text("Answer", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");

    const answerLines = doc.splitTextToSize(answer, 170);

    if (y + answerLines.length * 7 > 270) {
        doc.addPage();
        y = 20;
    }

    doc.text(answerLines, 20, y);

    y += answerLines.length * 7 + 10;
}
    });

    pdfCount++;
    document.getElementById("pdfCount").innerText = pdfCount;

    doc.save("Interview_Questions.pdf");
}

async function generateAnswer(button) {

    const card = button.closest(".question-card");
    const question = card.querySelector("p").innerText;
    const answerBox = card.querySelector(".answer-box");

    // Show loading message
    answerBox.style.display = "block";
    answerBox.innerHTML = `
        <p>🤖 Generating answer...</p>
    `;

    // Disable button while loading
    button.disabled = true;
    button.innerHTML = "Generating...";

    try {

        const response = await fetch("/answer", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question
            })

        });

        const data = await response.json();

        if (!response.ok) {

            answerBox.innerHTML = `
                <p>⚠ ${data.error}</p>
            `;

            return;
        }

        answerBox.innerHTML = `
            <h4>💡 AI Answer</h4>

            <p class="answer-text">${data.answer}</p>

            <button class="copy-answer-btn"
                onclick="copyAnswer(this)">
                📋 Copy Answer
            </button>
        `;

        answerCount++;
        document.getElementById("answerCount").innerText = answerCount;

    }

    catch (err) {

        answerBox.innerHTML = `
            <p>❌ Failed to generate answer. Please try again.</p>
        `;

        console.error(err);

    }

    finally {

        button.disabled = false;
        button.innerHTML = "✨ Generate Answer";

    }

}

function copyAnswer(button) {

    const answer = button.parentElement.querySelector(".answer-text").innerText;

    navigator.clipboard.writeText(answer);

    button.innerHTML = "✅ Copied";

    setTimeout(() => {

        button.innerHTML = "📋 Copy Answer";

    }, 1500);

}