let current = 0;
let score = 0;
let answered = false;

function loadQuestion() {

    answered = false;

    const q = questions[current];

    document.getElementById("questionCounter").innerHTML =
        `Question ${current + 1} of ${questions.length}`;

    document.getElementById("question").innerText = q.q;

    document.getElementById("result").innerHTML = "";
    document.getElementById("explanation").innerHTML = "";

    let html = "";

    q.options.forEach(opt => {

        html += `
        <label class="option">
            <input type="radio" name="ans" value="${opt[0]}">
            ${opt}
        </label>
        `;
    });

    document.getElementById("options").innerHTML = html;
    let timeLeft = 180 * 60;

    setInterval(() => {

      let mins = Math.floor(timeLeft / 60);
      let secs = timeLeft % 60;

      document.getElementById("timer").innerHTML =
        `${mins}:${secs.toString().padStart(2,'0')}`;

      timeLeft--;

     },1000);

    let percent =
        ((current + 1) / questions.length) * 100;

    document.getElementById("progressBar")
        .style.width = percent + "%";
}

function checkAnswer() {

    if (answered) return;

    const selected =
        document.querySelector('input[name="ans"]:checked');

    if (!selected) {
        alert("Please select an answer");
        return;
    }

    answered = true;

    if (selected.value === questions[current].answer) {

        score++;

        document.getElementById("result").innerHTML =
            "<h3 style='color:green'>✅ Correct</h3>";

    } else {

        document.getElementById("result").innerHTML =
            `<h3 style='color:red'>
            ❌ Wrong<br>
            Correct Answer:
            ${questions[current].answer}
            </h3>`;
    }

    document.getElementById("explanation").innerHTML =
        `<b>Explanation:</b><br>
         ${questions[current].explanation}`;
}

function nextQuestion() {

    current++;

    if (current < questions.length) {

        loadQuestion();

    } else {

        let percentage =
            ((score / questions.length) * 100).toFixed(2);

        document.body.innerHTML = `
        <div class="container">

            <h1>Exam Completed</h1>

            <h2>Score: ${score}/${questions.length}</h2>

            <h2>${percentage}%</h2>

        </div>
        `;
    }
}

loadQuestion();