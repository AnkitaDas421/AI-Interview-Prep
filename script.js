async function generateQuestions() {

    const role = document.getElementById("role").value;
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

        const response = await fetch("http://localhost:3000/generate", {

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

            output.innerHTML = `
                <div class="error-card">
                    <h2>⚠ Something went wrong</h2>
                    <p>${data.error}</p>
                </div>
            `;
            return;
        }

        let questions = data.result
            .split("\n")
            .filter(q => q.trim() !== "");

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

    const questions = document.querySelectorAll(".question-card p");

    questions.forEach((question, index) => {

        const lines = doc.splitTextToSize(
            `${index + 1}. ${question.innerText}`,
            170
        );

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, 20, y);

        y += (lines.length * 7) + 10;

    });

    doc.save("Interview_Questions.pdf");

}