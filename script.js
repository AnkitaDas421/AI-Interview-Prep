let questionCount = 0;
let answerCount = 0;
let pdfCount = 0;


// ==========================================
// GENERATE QUESTIONS
// ==========================================

async function generateQuestions() {

    const role = document.getElementById("role").value.trim();

    if (role === "") {
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

            let message =
                data.error || "Something went wrong.";

            if (
                message.includes("429") ||
                message.includes("Quota")
            ) {
                message =
                    "AI request limit reached. Please wait a minute and try again.";
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
            .map(q => q.trim())
            .filter(q => q !== "");

        questionCount += questions.length;

        document.getElementById("questionCount").innerText =
            questionCount;

        output.innerHTML = "";

        questions.forEach((question, index) => {

            output.innerHTML += `
                <div class="question-card">

                    <div class="question-header">

                        <h3>🎯 Question ${index + 1}</h3>

                        <button
                            class="copy-btn"
                            onclick="copyQuestion(this)"
                        >
                            <i class="fa-regular fa-copy"></i>
                            Copy
                        </button>

                    </div>

                    <p>${question}</p>

                    <div class="question-actions">

                        <button
                            class="answer-btn"
                            onclick="generateAnswer(this)"
                        >
                            ✨ Generate Answer
                        </button>

                    </div>

                    <div class="answer-box"></div>

                </div>
            `;

        });

        output.innerHTML += `

            <div class="bottom-buttons">

                <button
                    class="generate-btn"
                    onclick="generateQuestions()"
                >
                    🔄 Generate Again
                </button>

                <button
                    class="pdf-btn"
                    onclick="downloadPDF()"
                >
                    📄 Download PDF
                </button>

            </div>

        `;

    }

    catch (err) {

        console.error(err);

        output.innerHTML = `
            <div class="error-card">
                <h2>⚠️ AI Temporarily Unavailable</h2>
                <p>AI service is temporarily unavailable. Please try again.</p>
            </div>
        `;

    }

}


// ==========================================
// COPY QUESTION
// ==========================================

function copyQuestion(button) {

    const text =
        button.parentElement
            .nextElementSibling
            .innerText;

    navigator.clipboard.writeText(text);

    button.innerHTML = "✅ Copied";

    setTimeout(() => {

        button.innerHTML = `
            <i class="fa-regular fa-copy"></i> Copy
        `;

    }, 1500);

}


// ==========================================
// CLEAN PDF TEXT
// ==========================================

function writeWrappedText(
    doc,
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    text = cleanPDFText(text);

    if (!text) {
        return y;
    }

    const words = text.split(" ");

    let currentLine = [];
    let currentWidth = 0;

    const spaceWidth =
        doc.getTextWidth(" ");

    for (let i = 0; i < words.length; i++) {

        const word = words[i];

        if (!word) {
            continue;
        }

        const wordWidth =
            doc.getTextWidth(word);

        const newWidth =
            currentLine.length === 0
                ? wordWidth
                : currentWidth +
                  spaceWidth +
                  wordWidth;

        if (
            currentLine.length === 0 ||
            newWidth <= maxWidth
        ) {

            currentLine.push(word);
            currentWidth = newWidth;

        } else {

            let currentX = x;

            currentLine.forEach(lineWord => {

                doc.setCharSpace(0);

                doc.text(
                    lineWord,
                    currentX,
                    y
                );

                currentX +=
                    doc.getTextWidth(lineWord);

                currentX += spaceWidth;

            });

            y += lineHeight;

            currentLine = [word];
            currentWidth = wordWidth;
        }
    }

    if (currentLine.length > 0) {

        let currentX = x;

        currentLine.forEach(lineWord => {

            doc.setCharSpace(0);

            doc.text(
                lineWord,
                currentX,
                y
            );

            currentX +=
                doc.getTextWidth(lineWord);

            currentX += spaceWidth;

        });

        y += lineHeight;
    }

    return y;
}

// ==========================================
// WRITE TEXT WORD BY WORD
// ==========================================
//
// IMPORTANT:
// We do NOT use splitTextToSize().
// We do NOT pass arrays to doc.text().
// Each word gets its own exact X position.
//
// This prevents jsPDF from stretching
// characters on certain lines.
// ==========================================

function writeWrappedText(
    doc,
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    text = cleanPDFText(text);

    if (!text) {
        return y;
    }

    const words = text.split(" ");

    let currentLine = [];
    let currentWidth = 0;

    const spaceWidth =
        doc.getTextWidth(" ");


    for (let i = 0; i < words.length; i++) {

        const word = words[i];

        if (!word) {
            continue;
        }

        const wordWidth =
            doc.getTextWidth(word);


        const newWidth =
            currentLine.length === 0
                ? wordWidth
                : currentWidth +
                  spaceWidth +
                  wordWidth;


        // ------------------------------
        // WORD FITS ON CURRENT LINE
        // ------------------------------

        if (
            currentLine.length === 0 ||
            newWidth <= maxWidth
        ) {

            currentLine.push(word);

            currentWidth = newWidth;

        }


        // ------------------------------
        // WORD DOES NOT FIT
        // ------------------------------

        else {

            let currentX = x;


            // Print each word separately
            currentLine.forEach((lineWord, index) => {

                doc.setCharSpace(0);

                doc.text(
                    lineWord,
                    currentX,
                    y
                );

                currentX +=
                    doc.getTextWidth(lineWord);

                currentX += spaceWidth;

            });


            y += lineHeight;

            currentLine = [word];

            currentWidth = wordWidth;

        }

    }


    // ------------------------------
    // PRINT LAST LINE
    // ------------------------------

    if (currentLine.length > 0) {

        let currentX = x;


        currentLine.forEach(lineWord => {

            doc.setCharSpace(0);

            doc.text(
                lineWord,
                currentX,
                y
            );

            currentX +=
                doc.getTextWidth(lineWord);

            currentX += spaceWidth;

        });


        y += lineHeight;

    }


    return y;
}


// ==========================================
// DOWNLOAD PDF
// ==========================================

async function downloadPDF() {

    try {

        // ==========================================
        // LOAD html2canvas
        // ==========================================

        if (!window.html2canvas) {

            await new Promise((resolve, reject) => {

                const script = document.createElement("script");

                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

                script.onload = resolve;

                script.onerror = () => {
                    reject(
                        new Error("Could not load html2canvas")
                    );
                };

                document.head.appendChild(script);
            });
        }


        // ==========================================
        // CHECK jsPDF
        // ==========================================

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            alert(
                "PDF library is not loaded. Please refresh the page."
            );

            return;
        }


        const { jsPDF } = window.jspdf;

        const doc =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        // ==========================================
        // BASIC PDF SETTINGS
        // ==========================================

        const pageWidth = 210;

        const pageHeight = 297;

        const margin = 15;

        const contentWidth =
            pageWidth - (margin * 2);


        let currentY = margin;


        // ==========================================
        // GET ROLE + DIFFICULTY
        // ==========================================

        const role =
            document.getElementById("role").value;

        const difficulty =
            document.getElementById("difficulty").value;


        // ==========================================
        // PDF HEADER
        // ==========================================

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(20);

        doc.setTextColor(
            17,
            17,
            17
        );

        doc.text(
            "AI Interview Prep Assistant",
            margin,
            currentY
        );


        currentY += 10;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(11);


        doc.text(
            `Role: ${role}`,
            margin,
            currentY
        );


        currentY += 6;


        doc.text(
            `Difficulty: ${difficulty}`,
            margin,
            currentY
        );


        currentY += 12;


        // ==========================================
        // GET QUESTION CARDS
        // ==========================================

        const questionCards =
            document.querySelectorAll(
                ".question-card"
            );


        // ==========================================
        // PROCESS EACH QUESTION
        // ==========================================

        for (
            let index = 0;
            index < questionCards.length;
            index++
        ) {

            const originalCard =
                questionCards[index];


            // ======================================
            // GET TEXT DIRECTLY
            // ======================================

            const questionElement =
                originalCard.querySelector("p");


            if (!questionElement) {
                continue;
            }


            const question =
                questionElement.innerText.trim();


            const answerElement =
                originalCard.querySelector(
                    ".answer-text"
                );


            let answer = "";

            if (answerElement) {

                answer =
                    answerElement.innerText.trim();
            }


            // ======================================
            // CREATE COMPLETELY NEW PDF CARD
            // ======================================

            const pdfCard =
                document.createElement("div");


            // IMPORTANT:
            // No original CSS is inherited.

            pdfCard.style.cssText = `
                width: 760px;
                box-sizing: border-box;
                background: #ffffff;
                color: #111111;
                opacity: 1;
                filter: none;
                padding: 30px;
                margin: 0;
                border: 1px solid #dddddd;
                border-radius: 12px;
                box-shadow: none;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 16px;
                line-height: 1.55;
            `;


            // ======================================
            // QUESTION TITLE
            // ======================================

            const questionTitle =
                document.createElement("div");


            questionTitle.innerText =
                `Question ${index + 1}`;


            questionTitle.style.cssText = `
                color: #111111;
                opacity: 1;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 20px;
                font-weight: 700;
                line-height: 1.3;
                margin: 0 0 18px 0;
            `;


            pdfCard.appendChild(
                questionTitle
            );


            // ======================================
            // QUESTION TEXT
            // ======================================

            const questionText =
                document.createElement("div");


            questionText.innerText =
                question;


            questionText.style.cssText = `
                color: #111111;
                opacity: 1;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 16px;
                font-weight: 400;
                line-height: 1.55;
                margin: 0 0 24px 0;
                white-space: normal;
                word-wrap: break-word;
                overflow-wrap: break-word;
            `;


            pdfCard.appendChild(
                questionText
            );


            // ======================================
            // ANSWER
            // ======================================

            if (answer) {

                const answerTitle =
                    document.createElement("div");


                answerTitle.innerText =
                    "AI Answer";


                answerTitle.style.cssText = `
                    color: #111111;
                    opacity: 1;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    line-height: 1.4;
                    margin: 0 0 14px 0;
                `;


                pdfCard.appendChild(
                    answerTitle
                );


                const answerText =
                    document.createElement("div");


                answerText.innerText =
                    answer;


                answerText.style.cssText = `
                    color: #111111;
                    opacity: 1;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 1.55;
                    margin: 0;
                    white-space: normal;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                `;


                pdfCard.appendChild(
                    answerText
                );
            }


            // ======================================
            // TEMPORARY PDF AREA
            // ======================================

            const pdfArea =
                document.createElement("div");


            pdfArea.style.cssText = `
                position: fixed;
                left: -10000px;
                top: 0;
                width: 760px;
                padding: 0;
                margin: 0;
                background: #ffffff;
                opacity: 1;
                filter: none;
                z-index: -9999;
            `;


            pdfArea.appendChild(
                pdfCard
            );


            document.body.appendChild(
                pdfArea
            );


            // ======================================
            // WAIT FOR RENDER
            // ======================================

            await new Promise(resolve => {

                requestAnimationFrame(() => {

                    requestAnimationFrame(resolve);

                });

            });


            // ======================================
            // CAPTURE CARD
            // ======================================

            const canvas =
                await html2canvas(
                    pdfArea,
                    {
                        scale: 2,

                        backgroundColor:
                            "#ffffff",

                        useCORS: true,

                        allowTaint: false,

                        logging: false,

                        imageTimeout: 0
                    }
                );


            // Remove temporary area

            document.body.removeChild(
                pdfArea
            );


            // ======================================
            // IMAGE SIZE
            // ======================================

            const imageWidth =
                contentWidth;


            const imageHeight =
                (
                    canvas.height /
                    canvas.width
                ) * imageWidth;


            // ======================================
            // PAGE BREAK
            // ======================================

            const availableHeight =
                pageHeight -
                margin -
                currentY;


            if (
                imageHeight >
                availableHeight
            ) {

                doc.addPage();

                currentY =
                    margin;
            }


            // ======================================
            // ADD CARD TO PDF
            // ======================================

            const imageData =
                canvas.toDataURL(
                    "image/png"
                );


            doc.addImage(
                imageData,
                "PNG",
                margin,
                currentY,
                imageWidth,
                imageHeight
            );


            currentY +=
                imageHeight + 8;
        }


        // ==========================================
        // UPDATE PDF COUNTER
        // ==========================================

        pdfCount++;


        const pdfCounter =
            document.getElementById(
                "pdfCount"
            );


        if (pdfCounter) {

            pdfCounter.innerText =
                pdfCount;
        }


        // ==========================================
        // DOWNLOAD
        // ==========================================

        doc.save(
            "Interview_Questions.pdf"
        );


    } catch (error) {

        console.error(
            "PDF ERROR:",
            error
        );


        alert(
            "PDF generation failed. Please check the browser console."
        );
    }
}
// ==========================================
// GENERATE ANSWER
// ==========================================

async function generateAnswer(button) {

    const card =
        button.closest(
            ".question-card"
        );

    const question =
        card.querySelector("p").innerText;

    const answerBox =
        card.querySelector(
            ".answer-box"
        );


    // ======================================
    // LOADING
    // ======================================

    answerBox.style.display =
        "block";

    answerBox.innerHTML = `
        <p>🤖 Generating answer...</p>
    `;


    // ======================================
    // DISABLE BUTTON
    // ======================================

    button.disabled = true;

    button.innerHTML =
        "Generating...";


    try {

        const response =
            await fetch("/answer", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question
                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            answerBox.innerHTML = `
                <p>⚠ ${data.error}</p>
            `;

            return;

        }


        // ==================================
        // DISPLAY ANSWER
        // ==================================

        answerBox.innerHTML = `

            <h4>💡 AI Answer</h4>

            <p class="answer-text">${data.answer}</p>

            <button
                class="copy-answer-btn"
                onclick="copyAnswer(this)"
            >
                📋 Copy Answer
            </button>

        `;


        // ==================================
        // UPDATE COUNTER
        // ==================================

        answerCount++;

        document.getElementById(
            "answerCount"
        ).innerText =
            answerCount;

    }

    catch (err) {

        console.error(err);

        answerBox.innerHTML = `
            <p>
                ❌ Failed to generate answer.
                Please try again.
            </p>
        `;

    }

    finally {

        button.disabled = false;

        button.innerHTML =
            "✨ Generate Answer";

    }

}


// ==========================================
// COPY ANSWER
// ==========================================

function copyAnswer(button) {

    const answer =
        button.parentElement
            .querySelector(
                ".answer-text"
            )
            .innerText;


    navigator.clipboard.writeText(
        answer
    );


    button.innerHTML =
        "✅ Copied";


    setTimeout(() => {

        button.innerHTML =
            "📋 Copy Answer";

    }, 1500);

}