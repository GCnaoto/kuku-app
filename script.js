function showKukuList() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  document.getElementById('app').innerHTML = '<h2>くくの　いちらん</h2><div id="kuku-list-buttons"></div><div id="kuku-list"></div><button onclick="backHome()">ホームに　もどる</button>';
  // 段ボタン生成（DOM操作でイベントバインド）
  const btnsDiv = document.getElementById('kuku-list-buttons');
  btnsDiv.innerHTML = '';
  // クリア済み段情報取得
  let cleared = [];
  try {
    cleared = JSON.parse(localStorage.getItem('orderQuizCleared')||'[]');
  } catch(e) {}
  for(let i=1;i<=9;i++){
    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-block';
    wrapper.style.textAlign = 'center';
    wrapper.style.margin = '8px';
    if (cleared.includes(i)) {
      const mark = document.createElement('div');
      mark.textContent = '★';
      mark.style.color = '#ff9800';
      mark.style.fontSize = '1.3em';
      mark.style.marginBottom = '2px';
      wrapper.appendChild(mark);
    }
    const btn = document.createElement('button');
    btn.textContent = `${i}だん`;
    btn.onclick = () => renderKukuList(i);
    wrapper.appendChild(btn);
    btnsDiv.appendChild(wrapper);
  }
}
const kukuYomi = {
  1: ['いん いち が いち','いん に が に','いん さん が さん','いん し が し','いん ご が ご','いん ろく が ろく','いん しち が しち','いん はち が はち','いん く が く'],
  2: ['に いち が に','に にん が し','に さん が ろく','に し が はち','に ご じゅう','に ろく じゅうに','に しち じゅうし','に はち じゅうろく','に く じゅうはち'],
  3: ['さん いち が さん','さん に が ろく','さ ざん が く','さん し じゅうに','さん ご じゅうご','さぶ ろく じゅうはち','さん しち にじゅういち','さん ぱ にじゅうし','さん く にじゅうしち'],
  4: ['し いち が し','し に が はち','し さん じゅうに','し し じゅうろく','し ご にじゅう','し ろく にじゅうし','し しち にじゅうはち','し は さんじゅうに','し く さんじゅうろく'],
  5: ['ご いち が ご','ご に じゅう','ご さん じゅうご','ご し にじゅう','ご ご にじゅうご','ご ろく さんじゅう','ご しち さんじゅうご','ご は しじゅう','ごっ く しじゅうご'],
  6: ['ろく いち が ろく','ろく に じゅうに','ろく さん じゅうはち','ろく し にじゅうし','ろく ご さんじゅう','ろく ろく さんじゅうろく','ろく しち しじゅうに','ろく は しじゅうはち','ろっ く ごじゅうし'],
  7: ['しち いち が しち','しち に じゅうし','しち さん にじゅういち','しち し にじゅうはち','しち ご さんじゅうご','しち ろく しじゅうに','しち しち しじゅうく','しち は ごじゅうろく','しち く ろくじゅうさん'],
  8: ['はち いち が はち','はち に じゅうろく','はっ さん にじゅうし','はち し さんじゅうに','はち ご しじゅう','はち ろく しじゅうはち','はち しち ごじゅうろく','はっ ぱ ろくじゅうし','はっ く しちじゅうに'],
  9: ['く いち が く','く に じゅうはち','く さん にじゅうしち','く し さんじゅうろく','く ご しじゅうご','く ろく ごじゅうし','く しち ろくじゅうさん','く は しちじゅうに','く く はちじゅういち']
};

function renderKukuList(dan) {
  let html = `<h3>${dan}だん</h3><table style=\"margin:auto;\">`;
  for(let i=1;i<=9;i++){
    let kuku = `${dan} × ${i} = ${dan*i}`;
    let yomi = kukuYomi[dan][i-1] || '';
    html += `<tr><td>${kuku}</td><td>${yomi}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('kuku-list').innerHTML = html;
}
function numToKana(num) {
  const table = ['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう','じゅう','じゅういち','じゅうに','じゅうさん','じゅうよん','じゅうご','じゅうろく','じゅうなな','じゅうはち','じゅうきゅう','にじゅう'];
  return table[num]||num;
}
// 九九順問題
let orderQuizState = { dan: null, index: 1, correctCount: 0 };
function showKukuOrderQuiz() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  // 順問題クリア記録取得
  let cleared = [];
  try {
    cleared = JSON.parse(localStorage.getItem('orderQuizCleared')||'[]');
  } catch(e) {}
  let btns = '';
  for(let i=1;i<=9;i++){
    btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
    if (cleared.includes(i)) {
      btns += `<div style='color:#ff9800;font-size:1.3em;margin-bottom:2px;'>★</div>`;
    }
    btns += `<button onclick=\"startOrderQuiz(${i})\">${i}だん</button></div> `;
  }
  document.getElementById('app').innerHTML = `<h2>じゅんばんに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='order-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
}
function startOrderQuiz(dan) {
  orderQuizState = { dan: dan, index: 1, correctCount: 0 };
  renderOrderQuiz();
  setTimeout(function() {
    const area = document.getElementById('order-quiz-area');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function renderOrderQuiz() {
  const { dan, index, correctCount } = orderQuizState;
  if (correctCount === 9) {
    // クリア
    saveOrderQuizClear(dan);
    // 段ボタンリスト再描画
    let cleared = [];
    try {
      cleared = JSON.parse(localStorage.getItem('orderQuizCleared')||'[]');
    } catch(e) {}
    let btns = '';
    for(let i=1;i<=9;i++){
      btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
      if (cleared.includes(i)) {
        btns += `<div style='color:#ff9800;font-size:1.3em;margin-bottom:2px;'>★</div>`;
      }
      btns += `<button onclick=\"startOrderQuiz(${i})\">${i}だん</button></div> `;
    }
    document.getElementById('app').innerHTML = `<h2>じゅんばんに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='order-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
    document.getElementById('order-quiz-area').innerHTML = `<div class='clear'>${dan}だん　ぜんぶ　せいかい！すごいね！</div><button onclick=\"showKukuOrderQuiz()\">もういちど　ちょうせんする</button>`;
    return;
  }
  if (!dan) return;
  let a = dan, b = index;
  let answer = a * b;
  let choices = [answer];
  while (choices.length < 4) {
    let wrong = Math.floor(Math.random()*81)+1;
    if (wrong !== answer && !choices.includes(wrong)) choices.push(wrong);
  }
  choices = shuffle(choices);
  let fullYomi = kukuYomi[a][b-1] || `${numToKana(a)} かける ${numToKana(b)} は？`;
  let yomi = fullYomi.split(/\s*(が|じゅう|にじゅう|さんじゅう|しじゅう|ごじゅう|ろくじゅう|しちじゅう|はちじゅう)/)[0].trim();
  // ...進捗星リスト削除...
  let html = `<h3>${a} × ${b} = ?</h3><div class='yomi'>${yomi}</div>`;
  choices.forEach(c => {
    html += `<button onclick=\"answerOrderQuiz(${c})\">${c}</button> `;
  });
  html += `<div class='progress'>あと ${9-correctCount}もん！</div>`;
  document.getElementById('order-quiz-area').innerHTML = html;
}
function answerOrderQuiz(ans) {
  const { dan, index } = orderQuizState;
  if (ans === dan * index) {
    orderQuizState.index++;
    orderQuizState.correctCount++;
    if (orderQuizState.index > 9) orderQuizState.index = 1;
    renderOrderQuiz();
  } else {
    // 間違えたら最初から
    orderQuizState.index = 1;
    orderQuizState.correctCount = 0;
    document.getElementById('order-quiz-area').innerHTML = `<div class='error'>まちがえちゃった！さいしょから　やりなおし</div><button onclick=\"renderOrderQuiz()\">もういちど　ちょうせんする</button>`;
  }
}
function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
function saveOrderQuizClear(dan) {
  let cleared = JSON.parse(localStorage.getItem('orderQuizCleared')||'[]');
  if (!cleared.includes(dan)) cleared.push(dan);
  localStorage.setItem('orderQuizCleared', JSON.stringify(cleared));
}
// バラ九九問題
let randomQuizState = { dan: null, order: [], current: 0, correctCount: 0 };
function showKukuRandomQuiz() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  // バラ問題クリア記録取得
  let cleared = [];
  try {
    cleared = JSON.parse(localStorage.getItem('randomQuizCleared')||'[]');
  } catch(e) {}
  let btns = '';
  for(let i=1;i<=9;i++){
    btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
    if (cleared.includes(i)) {
      btns += `<div style='color:#ff9800;font-size:1.3em;margin-bottom:2px;'>★</div>`;
    }
    btns += `<button onclick=\"startRandomQuiz(${i})\">${i}だん</button></div> `;
  }
  document.getElementById('app').innerHTML = `<h2>ばらばらに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='random-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
}
function startRandomQuiz(dan) {
  let order = [];
  for(let i=1;i<=9;i++) order.push(i);
  order = shuffle(order);
  randomQuizState = { dan: dan, order: order, current: 0, correctCount: 0 };
  renderRandomQuiz();
  setTimeout(function() {
    const area = document.getElementById('random-quiz-area');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function renderRandomQuiz() {
  const { dan, order, current, correctCount } = randomQuizState;
  if (correctCount === 9) {
    saveRandomQuizClear(dan);
    // 段ボタンリスト再描画
    let cleared = [];
    try {
      cleared = JSON.parse(localStorage.getItem('randomQuizCleared')||'[]');
    } catch(e) {}
    let btns = '';
    for(let i=1;i<=9;i++){
      btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
      if (cleared.includes(i)) {
        btns += `<div style='color:#ff9800;font-size:1.3em;margin-bottom:2px;'>★</div>`;
      }
      btns += `<button onclick=\"startRandomQuiz(${i})\">${i}だん</button></div> `;
    }
    document.getElementById('app').innerHTML = `<h2>ばらばらに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='random-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
    document.getElementById('random-quiz-area').innerHTML = `<div class='clear'>${dan}だん　ぜんぶ　せいかい！すごいね！</div><button onclick=\"showKukuRandomQuiz()\">もういちど　ちょうせんする</button>`;
    return;
  }
  if (!dan) return;
  let b = order[current];
  let answer = dan * b;
  let choices = [answer];
  while (choices.length < 4) {
    let wrong = Math.floor(Math.random()*81)+1;
    if (wrong !== answer && !choices.includes(wrong)) choices.push(wrong);
  }
  choices = shuffle(choices);
  let fullYomi = kukuYomi[dan][b-1] || `${numToKana(dan)} かける ${numToKana(b)} は？`;
  let yomi = fullYomi.split(/\s*(が|じゅう|にじゅう|さんじゅう|しじゅう|ごじゅう|ろくじゅう|しちじゅう|はちじゅう)/)[0].trim();
  let html = `<h3>${dan} × ${b} = ?</h3><div class='yomi'>${yomi}</div>`;
  choices.forEach(c => {
    html += `<button onclick=\"answerRandomQuiz(${c})\">${c}</button> `;
  });
  html += `<div class='progress'>あと ${9-correctCount}もん！</div>`;
  document.getElementById('random-quiz-area').innerHTML = html;
}
function answerRandomQuiz(ans) {
  const { dan, order, current } = randomQuizState;
  if (ans === dan * order[current]) {
    randomQuizState.current++;
    randomQuizState.correctCount++;
    if (randomQuizState.current >= 9) randomQuizState.current = 0;
    renderRandomQuiz();
  } else {
    // 間違えたら最初から
    let order = [];
    for(let i=1;i<=9;i++) order.push(i);
    order = shuffle(order);
    randomQuizState.order = order;
    randomQuizState.current = 0;
    randomQuizState.correctCount = 0;
    document.getElementById('random-quiz-area').innerHTML = `<div class='error'>まちがえちゃった！さいしょから　やりなおし</div><button onclick=\"renderRandomQuiz()\">もういちど　ちょうせんする</button>`;
  }
}
function saveRandomQuizClear(dan) {
  let cleared = JSON.parse(localStorage.getItem('randomQuizCleared')||'[]');
  if (!cleared.includes(dan)) cleared.push(dan);
  localStorage.setItem('randomQuizCleared', JSON.stringify(cleared));
}
function backHome() {
  document.getElementById('home').style.display = '';
  document.getElementById('app').style.display = 'none';
  document.getElementById('app').innerHTML = '';
  // クリアボタンがなければ追加
  if (!document.getElementById('clear-record-btn')) {
    const btn = document.createElement('button');
    btn.id = 'clear-record-btn';
    btn.textContent = 'せいかいきろくを　ぜんぶ　けす';
    btn.style.marginTop = '16px';
    btn.onclick = function() {
      localStorage.removeItem('orderQuizCleared');
      localStorage.removeItem('randomQuizCleared');
      location.reload();
    };
    document.getElementById('home').appendChild(btn);
  }
}
