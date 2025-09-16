// --- バラ九九（入力式）用 段ごとレベル管理 ---
function getInputQuizExpData() {
  let expData = {};
  try {
    expData = JSON.parse(localStorage.getItem('inputQuizExp') || '{}');
  } catch (e) { }
  return expData;
}
function addInputQuizExp(dan) {
  let expData = getInputQuizExpData();
  expData[dan] = (expData[dan] || 0) + 1;
  if (expData[dan] > 99) expData[dan] = 99;
  localStorage.setItem('inputQuizExp', JSON.stringify(expData));
}
// --- バラ九九（入力式） ---
let inputQuizState = { dan: null, order: [], current: 0, correctCount: 0, input: '' };
function showKukuInputQuiz() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  // 段選択ボタン
  let expData = getInputQuizExpData();
  let btns = '';
  for (let i = 1; i <= 9; i++) {
    const exp = expData[i] || 0;
    const level = Math.min(100, exp + 1);
    btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
    btns += `<div style='color:#4b6cb7;font-size:1.1em;margin-bottom:2px;'>Lv.${level}</div>`;
    btns += `<button onclick="startInputQuiz(${i})">${i}だん</button></div> `;
  }
  document.getElementById('app').innerHTML = `<h2>バラ九九（入力式）</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='input-quiz-area'></div><button onclick="backHome()">ホームに　もどる</button>`;
}
function startInputQuiz(dan) {
  let order = [];
  for (let i = 1; i <= 9; i++) order.push(i);
  order = shuffle(order);
  inputQuizState = { dan: dan, order: order, current: 0, correctCount: 0, input: '' };
  renderInputQuiz();
  setTimeout(function () {
    const area = document.getElementById('input-quiz-area');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function renderInputQuiz() {
  const { dan, order, current, correctCount, input } = inputQuizState;
  if (correctCount === 9) {
    addInputQuizExp(dan);
    showKukuInputQuiz();
    document.getElementById('input-quiz-area').innerHTML = `<div class='clear'>${dan}だん　ぜんぶ　せいかい！すごいね！</div><button onclick=\"startInputQuiz(${dan})\">もういちど　ちょうせんする</button>`;
    return;
  }
  if (!dan) return;
  let b = order[current];
  let html = `<h3>${dan} × ${b} = ?</h3>`;
  // 読み方を追加
  let fullYomi = (kukuYomi[dan] && kukuYomi[dan][b - 1]) || `${numToKana(dan)} かける ${numToKana(b)} は？`;
  let yomi = fullYomi.split(/\s*(が|じゅう|にじゅう|さんじゅう|しじゅう|ごじゅう|ろくじゅう|しちじゅう|はちじゅう)/)[0].trim();
  html += `<div class='yomi'>${yomi}</div>`;
  html += `<div style='font-size:2em;margin:12px 0;'>${input || '&nbsp;'}</div>`;
  html += renderTenKey();
  html += `<div class='progress'>あと ${9 - correctCount}もん！</div>`;
  document.getElementById('input-quiz-area').innerHTML = html;
}
function renderTenKey() {
  // テンキーUI
  let html = `<div id='tenkey-area' style='display:inline-block;'>`;
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  for (let i = 0; i < 9; i++) {
    if (i % 3 === 0) html += '<div>';
    html += `<button style='width:60px;height:60px;font-size:1.5em;margin:4px;' onclick='pressTenKey(${keys[i]})'>${keys[i]}</button>`;
    if (i % 3 === 2) html += '</div>';
  }
  // 0とバックスペースを横並びで
  html += `<div>`;
  html += `<button style='width:60px;height:60px;font-size:1.5em;margin:4px;' onclick='pressTenKey(0)'>0</button>`;
  html += `<button style='width:60px;height:60px;font-size:1.5em;margin:4px;' onclick='pressTenKey(-1)'>⌫</button>`;
  html += `</div>`;
  html += `</div>`;
  return html;
}
function pressTenKey(num) {
  if (num === -1) {
    // バックスペース
    inputQuizState.input = inputQuizState.input.slice(0, -1);
    renderInputQuiz();
    return;
  }
  const { dan, order, current } = inputQuizState;
  const b = order[current];
  const answer = dan * b;
  const answerLength = answer.toString().length;
  if (inputQuizState.input.length < answerLength) {
    inputQuizState.input += num;
    // 桁数が揃ったら自動判定
    if (inputQuizState.input.length === answerLength) {
      if (parseInt(inputQuizState.input, 10) === answer) {
        // 正解なら自動で進む
        inputQuizState.current++;
        inputQuizState.correctCount++;
        inputQuizState.input = '';
        renderInputQuiz();
        return;
      } else {
        // 不正解ならsubmitInputQuiz()で既存の間違い処理
        submitInputQuiz();
        return;
      }
    }
    renderInputQuiz();
    return;
  }
  renderInputQuiz();
}
function submitInputQuiz() {
  const { dan, order, current, input } = inputQuizState;
  const answer = dan * order[current];
  if (parseInt(input, 10) === answer) {
    inputQuizState.current++;
    inputQuizState.correctCount++;
    inputQuizState.input = '';
    renderInputQuiz();
  } else {
    // 間違えたら最初から
    // ミス記録
    let missed = {};
    try {
      missed = JSON.parse(localStorage.getItem('missedKuku') || '{}');
    } catch (e) { }
    let key = `${dan}x${order[current]}`;
    missed[key] = (missed[key] || 0) + 1;
    localStorage.setItem('missedKuku', JSON.stringify(missed));
    let newOrder = [];
    for (let i = 1; i <= 9; i++) newOrder.push(i);
    newOrder = shuffle(newOrder);
    inputQuizState.order = newOrder;
    inputQuizState.current = 0;
    inputQuizState.correctCount = 0;
    inputQuizState.input = '';
    document.getElementById('input-quiz-area').innerHTML = `<div class='error'>まちがえちゃった！<br>せいかいは <b>${dan} × ${order[current]} = ${answer}</b> だよ<br>さいしょから　やりなおし</div><button onclick='renderInputQuiz()'>もういちど　ちょうせんする</button>`;
  }
}
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
    cleared = JSON.parse(localStorage.getItem('orderQuizCleared') || '[]');
  } catch (e) { }
  for (let i = 1; i <= 9; i++) {
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
  1: ['いん いち が いち', 'いん に が に', 'いん さん が さん', 'いん し が し', 'いん ご が ご', 'いん ろく が ろく', 'いん しち が しち', 'いん はち が はち', 'いん く が く'],
  2: ['に いち が に', 'に にん が し', 'に さん が ろく', 'に し が はち', 'に ご じゅう', 'に ろく じゅうに', 'に しち じゅうし', 'に はち じゅうろく', 'に く じゅうはち'],
  3: ['さん いち が さん', 'さん に が ろく', 'さ ざん が く', 'さん し じゅうに', 'さん ご じゅうご', 'さぶ ろく じゅうはち', 'さん しち にじゅういち', 'さん ぱ にじゅうし', 'さん く にじゅうしち'],
  4: ['し いち が し', 'し に が はち', 'し さん じゅうに', 'し し じゅうろく', 'し ご にじゅう', 'し ろく にじゅうし', 'し しち にじゅうはち', 'し は さんじゅうに', 'し く さんじゅうろく'],
  5: ['ご いち が ご', 'ご に じゅう', 'ご さん じゅうご', 'ご し にじゅう', 'ご ご にじゅうご', 'ご ろく さんじゅう', 'ご しち さんじゅうご', 'ご は しじゅう', 'ごっ く しじゅうご'],
  6: ['ろく いち が ろく', 'ろく に じゅうに', 'ろく さん じゅうはち', 'ろく し にじゅうし', 'ろく ご さんじゅう', 'ろく ろく さんじゅうろく', 'ろく しち しじゅうに', 'ろく は しじゅうはち', 'ろっ く ごじゅうし'],
  7: ['しち いち が しち', 'しち に じゅうし', 'しち さん にじゅういち', 'しち し にじゅうはち', 'しち ご さんじゅうご', 'しち ろく しじゅうに', 'しち しち しじゅうく', 'しち は ごじゅうろく', 'しち く ろくじゅうさん'],
  8: ['はち いち が はち', 'はち に じゅうろく', 'はっ さん にじゅうし', 'はち し さんじゅうに', 'はち ご しじゅう', 'はち ろく しじゅうはち', 'はち しち ごじゅうろく', 'はっ ぱ ろくじゅうし', 'はっ く しちじゅうに'],
  9: ['く いち が く', 'く に じゅうはち', 'く さん にじゅうしち', 'く し さんじゅうろく', 'く ご しじゅうご', 'く ろく ごじゅうし', 'く しち ろくじゅうさん', 'く は しちじゅうに', 'く く はちじゅういち']
};

function renderKukuList(dan) {
  let html = `<h3>${dan}だん</h3><table style=\"margin:auto;\">`;
  for (let i = 1; i <= 9; i++) {
    let kuku = `${dan} × ${i} = ${dan * i}`;
    let yomi = kukuYomi[dan][i - 1] || '';
    html += `<tr><td>${kuku}</td><td>${yomi}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('kuku-list').innerHTML = html;
  setTimeout(function () {
    const list = document.getElementById('kuku-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function numToKana(num) {
  const table = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう', 'じゅういち', 'じゅうに', 'じゅうさん', 'じゅうよん', 'じゅうご', 'じゅうろく', 'じゅうなな', 'じゅうはち', 'じゅうきゅう', 'にじゅう'];
  return table[num] || num;
}
// 九九順問題
let orderQuizState = { dan: null, index: 1, correctCount: 0 };
function showKukuOrderQuiz() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  // 段ごとの経験値・レベル取得
  let expData = {};
  try {
    expData = JSON.parse(localStorage.getItem('orderQuizExp') || '{}');
  } catch (e) { }
  let btns = '';
  for (let i = 1; i <= 9; i++) {
    const exp = expData[i] || 0;
    const level = Math.min(100, exp + 1); // 1回クリアごとにレベルUP, MAX100
    btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
    btns += `<div style='color:#4b6cb7;font-size:1.1em;margin-bottom:2px;'>Lv.${level}</div>`;
    btns += `<button onclick=\"startOrderQuiz(${i})\">${i}だん</button></div> `;
  }
  document.getElementById('app').innerHTML = `<h2>じゅんばんに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='order-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
}
function startOrderQuiz(dan) {
  orderQuizState = { dan: dan, index: 1, correctCount: 0 };
  renderOrderQuiz();
  setTimeout(function () {
    const area = document.getElementById('order-quiz-area');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function renderOrderQuiz() {
  const { dan, index, correctCount } = orderQuizState;
  if (correctCount === 9) {
    // クリア
    addOrderQuizExp(dan);
    // 段ボタンリスト再描画
    let expData = {};
    try {
      expData = JSON.parse(localStorage.getItem('orderQuizExp') || '{}');
    } catch (e) { }
    let btns = '';
    for (let i = 1; i <= 9; i++) {
      const exp = expData[i] || 0;
      const level = Math.min(100, exp + 1);
      btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
      btns += `<div style='color:#4b6cb7;font-size:1.1em;margin-bottom:2px;'>Lv.${level}</div>`;
      btns += `<button onclick=\"startOrderQuiz(${i})\">${i}だん</button></div> `;
    }
    document.getElementById('app').innerHTML = `<h2>じゅんばんに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='order-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
    document.getElementById('order-quiz-area').innerHTML = `<div class='clear'>${dan}だん　ぜんぶ　せいかい！すごいね！</div><button onclick=\"showKukuOrderQuiz()\">もういちど　ちょうせんする</button>`;
    return;
  }
  if (!dan) return;
  let a = dan, b = index;
  let answer = a * b;
  let wrongs = [];
  // 近い値
  if (answer > 1 && !wrongs.includes(answer - 1)) wrongs.push(answer - 1);
  if (answer < 81 && !wrongs.includes(answer + 1)) wrongs.push(answer + 1);
  // 同じ段の他の答え
  for (let i = 1; i <= 9; i++) {
    let val = a * i;
    if (val !== answer && !wrongs.includes(val)) wrongs.push(val);
    if (wrongs.length >= 6) break;
  }
  // 4と7の入れ替えパターン
  if (a === 4 || a === 7) {
    let altA = a === 4 ? 7 : 4;
    let altVal = altA * b;
    if (altVal !== answer && !wrongs.includes(altVal)) wrongs.push(altVal);
  }
  if (b === 4 || b === 7) {
    let altB = b === 4 ? 7 : 4;
    let altVal = a * altB;
    if (altVal !== answer && !wrongs.includes(altVal)) wrongs.push(altVal);
  }
  // ランダム
  while (wrongs.length < 10) {
    let r = Math.floor(Math.random() * 81) + 1;
    if (r !== answer && !wrongs.includes(r)) wrongs.push(r);
  }
  let choices = [answer];
  while (choices.length < 4) {
    let idx = Math.floor(Math.random() * wrongs.length);
    let wrong = wrongs[idx];
    if (!choices.includes(wrong)) choices.push(wrong);
  }
  choices = shuffle(choices);
  let fullYomi = kukuYomi[a][b - 1] || `${numToKana(a)} かける ${numToKana(b)} は？`;
  let yomi = fullYomi.split(/\s*(が|じゅう|にじゅう|さんじゅう|しじゅう|ごじゅう|ろくじゅう|しちじゅう|はちじゅう)/)[0].trim();
  // ...進捗星リスト削除...
  let html = `<h3>${a} × ${b} = ?</h3><div class='yomi'>${yomi}</div>`;
  choices.forEach(c => {
    html += `<button onclick=\"answerOrderQuiz(${c})\">${c}</button> `;
  });
  html += `<div class='progress'>あと ${9 - correctCount}もん！</div>`;
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
    // ミス記録
    let missed = JSON.parse(localStorage.getItem('missedKuku') || '{}');
    let key = `${dan}x${index}`;
    missed[key] = (missed[key] || 0) + 1;
    localStorage.setItem('missedKuku', JSON.stringify(missed));
    const correct = dan * index;
    orderQuizState.index = 1;
    orderQuizState.correctCount = 0;
    document.getElementById('order-quiz-area').innerHTML = `<div class='error'>まちがえちゃった！<br>せいかいは <b>${dan} × ${index} = ${correct}</b> だよ<br>さいしょから　やりなおし</div><button onclick=\"renderOrderQuiz()\">もういちど　ちょうせんする</button>`;
  }
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 段ごとに経験値を加算し保存
function addOrderQuizExp(dan) {
  let expData = {};
  try {
    expData = JSON.parse(localStorage.getItem('orderQuizExp') || '{}');
  } catch (e) { }
  expData[dan] = (expData[dan] || 0) + 1;
  // レベルMAX（100）を超える経験値は加算しない
  if (expData[dan] > 99) expData[dan] = 99;
  localStorage.setItem('orderQuizExp', JSON.stringify(expData));
}
// バラ九九問題
let randomQuizState = { dan: null, order: [], current: 0, correctCount: 0 };
function showKukuRandomQuiz() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('app').style.display = '';
  // 段ごとの経験値・レベル取得（バラ問題用）
  let expData = {};
  try {
    expData = JSON.parse(localStorage.getItem('randomQuizExp') || '{}');
  } catch (e) { }
  let btns = '';
  for (let i = 1; i <= 9; i++) {
    const exp = expData[i] || 0;
    const level = Math.min(100, exp + 1); // 1回クリアごとにレベルUP, MAX100
    btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
    btns += `<div style='color:#4b6cb7;font-size:1.1em;margin-bottom:2px;'>Lv.${level}</div>`;
    btns += `<button onclick=\"startRandomQuiz(${i})\">${i}だん</button></div> `;
  }
  document.getElementById('app').innerHTML = `<h2>ばらばらに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='random-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
}
function startRandomQuiz(dan) {
  let order = [];
  for (let i = 1; i <= 9; i++) order.push(i);
  order = shuffle(order);
  randomQuizState = { dan: dan, order: order, current: 0, correctCount: 0 };
  renderRandomQuiz();
  setTimeout(function () {
    const area = document.getElementById('random-quiz-area');
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function renderRandomQuiz() {
  const { dan, order, current, correctCount } = randomQuizState;
  if (correctCount === 9) {
    addRandomQuizExp(dan);
    // 段ボタンリスト再描画
    let expData = {};
    try {
      expData = JSON.parse(localStorage.getItem('randomQuizExp') || '{}');
    } catch (e) { }
    let btns = '';
    for (let i = 1; i <= 9; i++) {
      const exp = expData[i] || 0;
      const level = Math.min(100, exp + 1);
      btns += `<div style='display:inline-block;text-align:center;margin:8px;'>`;
      btns += `<div style='color:#4b6cb7;font-size:1.1em;margin-bottom:2px;'>Lv.${level}</div>`;
      btns += `<button onclick=\"startRandomQuiz(${i})\">${i}だん</button></div> `;
    }
    document.getElementById('app').innerHTML = `<h2>ばらばらに　とく</h2><div>やりたい　だんを　えらんでね</div><div>${btns}</div><div id='random-quiz-area'></div><button onclick=\"backHome()\">ホームに　もどる</button>`;
    document.getElementById('random-quiz-area').innerHTML = `<div class='clear'>${dan}だん　ぜんぶ　せいかい！すごいね！</div><button onclick=\"showKukuRandomQuiz()\">もういちど　ちょうせんする</button>`;
    return;
  }
  if (!dan) return;
  let b = order[current];
  let answer = dan * b;
  let wrongs = [];
  // 近い値
  if (answer > 1 && !wrongs.includes(answer - 1)) wrongs.push(answer - 1);
  if (answer < 81 && !wrongs.includes(answer + 1)) wrongs.push(answer + 1);
  // 同じ段の他の答え
  for (let i = 1; i <= 9; i++) {
    let val = dan * i;
    if (val !== answer && !wrongs.includes(val)) wrongs.push(val);
    if (wrongs.length >= 6) break;
  }
  // 4と7の入れ替えパターン
  if (dan === 4 || dan === 7) {
    let altA = dan === 4 ? 7 : 4;
    let altVal = altA * b;
    if (altVal !== answer && !wrongs.includes(altVal)) wrongs.push(altVal);
  }
  if (b === 4 || b === 7) {
    let altB = b === 4 ? 7 : 4;
    let altVal = dan * altB;
    if (altVal !== answer && !wrongs.includes(altVal)) wrongs.push(altVal);
  }
  // ランダム
  while (wrongs.length < 10) {
    let r = Math.floor(Math.random() * 81) + 1;
    if (r !== answer && !wrongs.includes(r)) wrongs.push(r);
  }
  let choices = [answer];
  while (choices.length < 4) {
    let idx = Math.floor(Math.random() * wrongs.length);
    let wrong = wrongs[idx];
    if (!choices.includes(wrong)) choices.push(wrong);
  }
  choices = shuffle(choices);
  let fullYomi = kukuYomi[dan][b - 1] || `${numToKana(dan)} かける ${numToKana(b)} は？`;
  let yomi = fullYomi.split(/\s*(が|じゅう|にじゅう|さんじゅう|しじゅう|ごじゅう|ろくじゅう|しちじゅう|はちじゅう)/)[0].trim();
  let html = `<h3>${dan} × ${b} = ?</h3><div class='yomi'>${yomi}</div>`;
  choices.forEach(c => {
    html += `<button onclick=\"answerRandomQuiz(${c})\">${c}</button> `;
  });
  html += `<div class='progress'>あと ${9 - correctCount}もん！</div>`;
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
    // ミス記録
    let missed = JSON.parse(localStorage.getItem('missedKuku') || '{}');
    let key = `${dan}x${order[current]}`;
    missed[key] = (missed[key] || 0) + 1;
    localStorage.setItem('missedKuku', JSON.stringify(missed));
    const correct = dan * order[current];
    let orderArr = [];
    for (let i = 1; i <= 9; i++) orderArr.push(i);
    orderArr = shuffle(orderArr);
    randomQuizState.order = orderArr;
    randomQuizState.current = 0;
    randomQuizState.correctCount = 0;
    document.getElementById('random-quiz-area').innerHTML = `<div class='error'>まちがえちゃった！<br>せいかいは <b>${dan} × ${order[current]} = ${correct}</b> だよ<br>もう一回！</div><button onclick=\"renderRandomQuiz()\">もういちど　ちょうせんする</button>`;
  }
}

// 段ごとに経験値を加算し保存（バラ問題用）
function addRandomQuizExp(dan) {
  let expData = {};
  try {
    expData = JSON.parse(localStorage.getItem('randomQuizExp') || '{}');
  } catch (e) { }
  expData[dan] = (expData[dan] || 0) + 1;
  // レベルMAX（100）を超える経験値は加算しない
  if (expData[dan] > 99) expData[dan] = 99;
  localStorage.setItem('randomQuizExp', JSON.stringify(expData));
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
    btn.onclick = function () {
      localStorage.removeItem('orderQuizCleared');
      localStorage.removeItem('randomQuizCleared');
      localStorage.removeItem('missedKuku');
      location.reload();
    };
    document.getElementById('home').appendChild(btn);
  }
  // ランキングボタンがなければ追加
  if (!document.getElementById('missed-ranking-btn')) {
    const btn = document.createElement('button');
    btn.id = 'missed-ranking-btn';
    btn.textContent = 'まちがえやすい問題ランキング';
    btn.style.marginTop = '16px';
    btn.onclick = showMissedRanking;
    document.getElementById('home').appendChild(btn);
  }

  function showMissedRanking() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('app').style.display = '';
    let missed = {};
    try {
      missed = JSON.parse(localStorage.getItem('missedKuku') || '{}');
    } catch (e) { }
    let byDan = {};
    Object.keys(missed).forEach(key => {
      let [dan, b] = key.split('x').map(Number);
      if (!byDan[dan]) byDan[dan] = [];
      byDan[dan].push({ b, count: missed[key] });
    });
    let html = `<h2>まちがえやすい問題ランキング</h2>`;
    for (let dan = 1; dan <= 9; dan++) {
      if (!byDan[dan] || byDan[dan].length === 0) continue;
      html += `<h3>${dan}だん</h3><table style='margin:auto;'><tr><th>問題</th><th>回数</th></tr>`;
      let sorted = byDan[dan].sort((a, b) => b.count - a.count).slice(0, 5);
      sorted.forEach(item => {
        html += `<tr><td>${dan} × ${item.b} = ${dan * item.b}</td><td>${item.count}回</td></tr>`;
      });
      html += `</table>`;
    }
    html += `<button onclick='backHome()'>ホームに　もどる</button>`;
    document.getElementById('app').innerHTML = html;
  }
}
