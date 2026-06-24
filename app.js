let current = 0;
let score = 0;

function loadQuestion() {

  const q = questions[current];

  document.getElementById("question").innerText = q.q;

  let html = "";

  q.options.forEach(opt => {
    html += `
      <label>
        <input type="radio" name="ans" value="${opt[0]}">
        ${opt}
      </label><br><br>
    `;
  });

  document.getElementById("options").innerHTML = html;
}

function submitAnswer() {

  const selected =
      document.querySelector('input[name="ans"]:checked');

  if (!selected) {
      alert("Select answer");
      return;
  }

  if (selected.value === questions[current].answer) {
      score++;
  }

  current++;

  if (current < questions.length) {
      loadQuestion();
  } else {
      document.body.innerHTML =
          `<h1>Score: ${score}/${questions.length}</h1>`;
  }
}

loadQuestion();