const buttons = document.getElementById("buttons");
const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");

for (let i = 1; i <= 9; i++) {
  const btn = document.createElement("button");
  btn.textContent = i + "の段";
  btn.onclick = () => startQuiz(i);
  buttons.appendChild(btn);
}

let current, step, dan;

function startQuiz(d) {
  dan = d;
  step = 1;
  current = {a: d, b: 1};
  document.getElementById("menu").style.display = "none";
  quiz.style.display = "block";
  showQuestion();
}

function showQuestion() {
  questionEl.textContent = `${current.a} × ${current.b} = ?`;
  const answer = current.a * current.b;

  // 正解＋不正解の候補作成
  let options = [answer];
  while (options.length < 4) {
    let r = Math.floor(Math.random() * 81) + 1;
    if (!options.includes(r)) options.push(r);
  }
  options = options.sort(() => Math.random() - 0.5);

  choicesEl.innerHTML = "";
  options.forEach(o => {
    const btn = document.createElement("button");
    btn.textContent = o;
    btn.onclick = () => checkAnswer(o, answer);
    choicesEl.appendChild(btn);
  });
}

function checkAnswer(choice, correct) {
  if (choice === correct) {
    if (current.b === 9) {
      alert(`${dan}の段クリア！`);
      localStorage.setItem("dan" + dan, "clear");
      location.reload();
    } else {
      current.b++;
      showQuestion();
    }
  } else {
    alert("間違い！最初から");
    startQuiz(dan);
  }
}
