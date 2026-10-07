/* ========== ХРАНИЛИЩЕ ========== */
function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function dayKey(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

var WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
var MN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function humanDay(k) {
  if (k === 'marathon') return 'Записи марафона «7 дней»';
  var p = k.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
  return d.getDate() + ' ' + MN[d.getMonth()] + ', ' + WD[d.getDay()];
}

var toastT;
function toast(m) {
  var t = $('toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2000);
}

var profile = load('profile', {});

/* ========== ПЕРЕНОС ДАННЫХ ИЗ СТАРОЙ ВЕРСИИ ========== */
(function migrate() {
  if (load('v2migrated', false)) return;
  var todo = load('todo', []);
  var dayTasks = load('dayTasks', {});
  Object.keys(dayTasks).forEach(function (n) {
    var items = dayTasks[n] && dayTasks[n].items;
    if (items) items.forEach(function (it) { if (it && it.text) todo.push({id: newId(), text: it.text, done: !!it.done}); });
  });
  save('todo', todo);

  var journals = load('journals', {}), diary = load('diary', {}), lines = [];
  Object.keys(journals).sort().forEach(function (k) {
    var v = String(journals[k] || '').trim();
    var day = (k.match(/^j_(\d+)_/) || [])[1];
    if (v) lines.push((day ? 'День ' + day + ': ' : '') + v);
  });
  if (lines.length && !diary.marathon) diary.marathon = lines.join('\n\n');
  save('diary', diary);
  save('v2migrated', true);
})();

/* ========== ТЕМА ========== */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  save('theme2', t);
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'dark' ? '#0B0B10' : '#F3EEE4');
  $('themeVal').textContent = t === 'dark' ? 'Тёмная' : 'Светлая';
}
$('themeRow').onclick = function () { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };

/* ========== НАВИГАЦИЯ ========== */
function profileOk() { return !!(profile.name && profile.phone); }

function showScreen(name) {
  document.querySelectorAll('.nav button').forEach(function (x) { x.classList.toggle('on', x.dataset.s === name); });
  document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('on', s.id === 's-' + name); });
  document.documentElement.setAttribute('data-screen', name);
  window.scrollTo(0, 0);
  if (name === 'diary') renderDiary();
  if (name === 'me') loadProfile();
}

document.querySelectorAll('.nav button').forEach(function (b) {
  b.onclick = function () {
    if (b.dataset.s !== 'me' && !profileOk()) { toast('👤 Сначала заполни имя и телефон'); showScreen('me'); return; }
    showScreen(b.dataset.s);
  };
});

/* ========== ШАПКА ========== */
function renderHeader() {
  var now = new Date();
  $('todayDay').innerHTML = esc(now.getDate() + ' ' + MN[now.getMonth()]) + '<small>' + WD[now.getDay()] + '</small>';
  var h = now.getHours();
  var g = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  var open = load('todo', []).filter(function (t) { return !t.done; }).length;
  $('hello').textContent = g + (profile.name ? ', ' + profile.name : '') + '. ' +
    (open ? 'Задач на сегодня: ' + open + '.' : 'Все задачи сделаны.');
}

/* ========== ЗАДАЧИ ========== */
var showDone = false;

function taskRow(t) {
  return '<li class="task' + (t.done ? ' done' : '') + '" data-id="' + t.id + '">' +
    '<button class="check" data-act="toggle" aria-label="' + (t.done ? 'Вернуть задачу' : 'Отметить выполненной') + '">' + (t.done ? '✓' : '') + '</button>' +
    '<span class="task-text">' + esc(t.text) + '</span>' +
    '<button class="task-del" data-act="del" aria-label="Удалить задачу">×</button></li>';
}

function renderTasks() {
  var all = load('todo', []);
  var open = all.filter(function (t) { return !t.done; }), done = all.filter(function (t) { return t.done; });
  $('taskList').innerHTML = open.length ? open.map(taskRow).join('') :
    '<li class="empty">Добавь первое дело на сегодня — одно короткое действие.</li>';
  $('doneToggle').hidden = !done.length;
  $('doneLbl').textContent = (showDone ? '▾ ' : '▸ ') + 'Выполнено: ' + done.length;
  $('doneList').hidden = !showDone || !done.length;
  $('doneList').innerHTML = done.map(taskRow).join('');
  renderHeader();
}

$('addTask').onsubmit = function (e) {
  e.preventDefault();
  var v = $('taskIn').value.trim();
  if (!v) return;
  var all = load('todo', []);
  all.unshift({id: newId(), text: v, done: false});
  save('todo', all);
  $('taskIn').value = '';
  renderTasks();
};

function onTaskClick(e) {
  var b = e.target.closest('button'); if (!b) return;
  var id = b.closest('.task').dataset.id, all = load('todo', []);
  if (b.dataset.act === 'toggle') {
    all.forEach(function (t) {
      if (t.id === id) { t.done = !t.done; t.doneAt = t.done ? dayKey(new Date()) : null; if (t.done) toast('Готово ✓'); }
    });
  } else {
    all = all.filter(function (t) { return t.id !== id; });
  }
  save('todo', all);
  renderTasks();
}
$('taskList').onclick = onTaskClick;
$('doneList').onclick = onTaskClick;
$('doneToggle').onclick = function (e) {
  if (e.target.id === 'doneClear') {
    save('todo', load('todo', []).filter(function (t) { return !t.done; }));
    toast('Выполненные очищены');
  } else {
    showDone = !showDone;
  }
  renderTasks();
};

/* ========== ДНЕВНИК ========== */
var PROMPTS = ['Главное действие за сегодня', 'Где победил себя', 'За что благодарен'];
var saveT;
function today() { return dayKey(new Date()); }

$('prompts').innerHTML = PROMPTS.map(function (p) { return '<button class="prompt">' + p + '</button>'; }).join('');
$('prompts').onclick = function (e) {
  var b = e.target.closest('.prompt'); if (!b) return;
  var ta = $('entryIn');
  ta.value = (ta.value ? ta.value.replace(/\s*$/, '') + '\n' : '') + b.textContent + ': ';
  ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  saveEntry();
};

function saveEntry() {
  var d = load('diary', {}), v = $('entryIn').value;
  if (v.trim()) d[today()] = v; else delete d[today()];
  save('diary', d);
  $('entrySaved').textContent = v.trim() ? 'Сохранено' : '';
  $('entryCount').textContent = v.trim() ? v.trim().split(/\s+/).length + ' слов' : '';
}
$('entryIn').oninput = function () { $('entrySaved').textContent = '…'; clearTimeout(saveT); saveT = setTimeout(saveEntry, 400); };

function renderDiary() {
  var d = load('diary', {}), t = today();
  $('entryDate').textContent = 'Сегодня, ' + humanDay(t);
  if (document.activeElement !== $('entryIn')) $('entryIn').value = d[t] || '';
  $('entrySaved').textContent = d[t] ? 'Сохранено' : '';
  $('entryCount').textContent = d[t] ? d[t].trim().split(/\s+/).length + ' слов' : '';
  var q = $('diarySearch').value.trim().toLowerCase();
  var keys = Object.keys(d).filter(function (k) { return k !== t && (!q || d[k].toLowerCase().indexOf(q) >= 0); });
  keys.sort(function (a, b) { return a === 'marathon' ? 1 : b === 'marathon' ? -1 : (a < b ? 1 : -1); });
  $('archive').innerHTML = keys.length ? keys.map(function (k) {
    return '<li class="arch"><button class="arch-head"><div class="arch-date">' + humanDay(k) + '</div>' +
      '<div class="arch-prev">' + esc(d[k].split('\n')[0]) + '</div></button><div class="arch-full">' + esc(d[k]) + '</div></li>';
  }).join('') : '<li class="empty">' + (q ? 'Ничего не нашлось.' : 'Здесь появятся твои записи за прошлые дни.') + '</li>';
}
$('archive').onclick = function (e) { var h = e.target.closest('.arch-head'); if (h) h.parentNode.classList.toggle('open'); };
$('diarySearch').oninput = renderDiary;

/* ========== МЕДИТАЦИЯ (стоп на 10:34) ========== */
var MED_END = 634, med = $('medAudio');
function medFmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function medUi() {
  var t = Math.min(med.currentTime || 0, MED_END);
  $('medFill').style.width = (t / MED_END * 100) + '%';
  $('medNow').textContent = medFmt(t);
  $('medBtn').textContent = med.paused ? '▶' : '❚❚';
}
$('medBtn').onclick = function () {
  if (med.paused) {
    if (med.currentTime >= MED_END) med.currentTime = 0;
    med.play().catch(function () { toast('Не удалось включить звук'); });
  } else {
    med.pause();
  }
};
med.addEventListener('timeupdate', function () {
  if (med.currentTime >= MED_END) { med.pause(); med.currentTime = MED_END; toast('Медитация завершена 🙏'); }
  medUi();
});
med.addEventListener('play', medUi);
med.addEventListener('pause', medUi);
$('medTrack').onclick = function (e) {
  var r = this.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  med.currentTime = x * MED_END;
  medUi();
};

/* ========== АФФИРМАЦИИ ========== */
var SY = window.speechSynthesis, sayQueue = [];
function ruVoice() { var v = SY ? SY.getVoices() : []; return v.filter(function (x) { return /^ru/i.test(x.lang); })[0] || null; }
function speak(list) {
  if (!SY) { toast('Озвучка не поддерживается'); return; }
  SY.cancel(); sayQueue = list.slice();
  (function next() {
    document.querySelectorAll('.aff').forEach(function (a) { a.classList.remove('speaking'); });
    var a = sayQueue.shift(); if (!a) return;
    var li = document.querySelector('.aff[data-id="' + a.id + '"]'); if (li) li.classList.add('speaking');
    var u = new SpeechSynthesisUtterance(a.text); u.lang = 'ru-RU'; u.rate = 0.9;
    var v = ruVoice(); if (v) u.voice = v;
    u.onend = u.onerror = function () { setTimeout(next, 500); };
    SY.speak(u);
  })();
}
function renderAffs() {
  var affs = load('affs', []);
  $('affAll').hidden = affs.length < 2;
  $('affList').innerHTML = affs.length ? affs.map(function (a) {
    return '<li class="aff" data-id="' + a.id + '"><button class="aff-play" data-act="play" aria-label="Прослушать">▶</button>' +
      '<div class="aff-text">' + esc(a.text) + '</div><button class="task-del" data-act="del" aria-label="Удалить">×</button></li>';
  }).join('') : '<li class="empty">Напиши первую аффирмацию — приложение прочитает её вслух.</li>';
}
$('affForm').onsubmit = function (e) {
  e.preventDefault();
  var v = $('affIn').value.trim(); if (!v) return;
  var a = load('affs', []); a.push({id: newId(), text: v}); save('affs', a);
  $('affIn').value = ''; renderAffs();
};
$('affList').onclick = function (e) {
  var b = e.target.closest('button'); if (!b) return;
  var id = b.closest('.aff').dataset.id, affs = load('affs', []);
  if (b.dataset.act === 'play') speak(affs.filter(function (a) { return String(a.id) === id; }));
  else { save('affs', affs.filter(function (a) { return String(a.id) !== id; })); renderAffs(); }
};
$('affAll').onclick = function () { speak(load('affs', [])); };

/* ========== ТЕЛЕФОН ========== */
var COUNTRIES = [
  ['RU', '🇷🇺', 'Россия', '7'], ['KZ', '🇰🇿', 'Казахстан', '7'], ['BY', '🇧🇾', 'Беларусь', '375'],
  ['UA', '🇺🇦', 'Украина', '380'], ['UZ', '🇺🇿', 'Узбекистан', '998'], ['KG', '🇰🇬', 'Кыргызстан', '996'],
  ['TJ', '🇹🇯', 'Таджикистан', '992'], ['TM', '🇹🇲', 'Туркменистан', '993'], ['AM', '🇦🇲', 'Армения', '374'],
  ['GE', '🇬🇪', 'Грузия', '995'], ['AZ', '🇦🇿', 'Азербайджан', '994'], ['MD', '🇲🇩', 'Молдова', '373'],
  ['TR', '🇹🇷', 'Турция', '90'], ['AE', '🇦🇪', 'ОАЭ', '971'], ['IL', '🇮🇱', 'Израиль', '972'],
  ['TH', '🇹🇭', 'Таиланд', '66'], ['VN', '🇻🇳', 'Вьетнам', '84'], ['ID', '🇮🇩', 'Индонезия', '62'],
  ['LK', '🇱🇰', 'Шри-Ланка', '94'], ['IN', '🇮🇳', 'Индия', '91'], ['CN', '🇨🇳', 'Китай', '86'],
  ['KR', '🇰🇷', 'Южная Корея', '82'], ['JP', '🇯🇵', 'Япония', '81'], ['CY', '🇨🇾', 'Кипр', '357'],
  ['RS', '🇷🇸', 'Сербия', '381'], ['ME', '🇲🇪', 'Черногория', '382'], ['DE', '🇩🇪', 'Германия', '49'],
  ['ES', '🇪🇸', 'Испания', '34'], ['IT', '🇮🇹', 'Италия', '39'], ['FR', '🇫🇷', 'Франция', '33'],
  ['PL', '🇵🇱', 'Польша', '48'], ['CZ', '🇨🇿', 'Чехия', '420'], ['LV', '🇱🇻', 'Латвия', '371'],
  ['LT', '🇱🇹', 'Литва', '370'], ['EE', '🇪🇪', 'Эстония', '372'], ['GB', '🇬🇧', 'Великобритания', '44'],
  ['US', '🇺🇸', 'США / Канада', '1']
];

function countryBy(key) {
  for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i][0] === key) return COUNTRIES[i];
  return COUNTRIES[0];
}

function initCountries() {
  var sel = document.getElementById('meCountry');
  if (!sel || sel.options.length) return;
  COUNTRIES.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c[0];
    o.textContent = c[1] + ' ' + c[2] + ' +' + c[3];
    sel.appendChild(o);
  });
}

function curCountry() { return countryBy(document.getElementById('meCountry').value || 'RU'); }

function setCountry(key) {
  var c = countryBy(key);
  document.getElementById('meCountry').value = c[0];
  document.getElementById('ccLabel').textContent = c[1] + ' +' + c[3];
}

function formatNational(code, d) {
  if (code === '7') {
    d = d.slice(0, 10);
    if (!d) return '';
    var s = '(' + d.slice(0, 3);
    if (d.length > 3) s += ') ' + d.slice(3, 6);
    if (d.length > 6) s += '-' + d.slice(6, 8);
    if (d.length > 8) s += '-' + d.slice(8, 10);
    return s;
  }
  return d.slice(0, 12).replace(/(\d{3})(?=\d)/g, '$1 ');
}

// Разбирает номер с кодом страны: "+7 900...", "8900...", "+66 81..."
function splitPhone(raw, preferKey) {
  var s = String(raw || '').trim(), digits = s.replace(/\D/g, '');
  if (!digits) return {key: preferKey || 'RU', national: ''};
  if (s.charAt(0) === '+' || s.indexOf('00') === 0) {
    if (s.indexOf('00') === 0) digits = digits.slice(2);
    var best = null;
    COUNTRIES.forEach(function (c) {
      if (digits.indexOf(c[3]) === 0 && (!best || c[3].length > best[3].length || (c[3] === best[3] && c[0] === preferKey))) best = c;
    });
    if (best) return {key: best[0], national: digits.slice(best[3].length)};
  }
  var c0 = countryBy(preferKey || 'RU');
  if (c0[3] === '7' && digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) digits = digits.slice(1);
  return {key: c0[0], national: digits};
}

function onPhoneInput() {
  var el = document.getElementById('mePhone');
  var p = splitPhone(el.value, curCountry()[0]);
  if (p.key !== curCountry()[0]) setCountry(p.key);
  el.value = formatNational(countryBy(p.key)[3], p.national);
  el.closest('.me-field').classList.remove('err');
}

function onCountryChange() {
  setCountry(document.getElementById('meCountry').value);
  onPhoneInput();
  document.getElementById('mePhone').focus();
}

function phoneDigits() { return document.getElementById('mePhone').value.replace(/\D/g, ''); }

function phoneValid() {
  var n = phoneDigits().length;
  return curCountry()[3] === '7' ? n === 10 : n >= 5 && n <= 12;
}

function fullPhone() {
  var c = curCountry();
  return '+' + c[3] + ' ' + document.getElementById('mePhone').value.trim();
}

function markErr(id, msg) {
  var el = document.getElementById(id);
  el.closest('.me-field').classList.add('err');
  toast(msg);
  el.focus();
}


/* ========== ПРОФИЛЬ ========== */
function streak(d) {
  var n = 0, x = new Date();
  if (!d[dayKey(x)]) x.setDate(x.getDate() - 1);
  while (d[dayKey(x)]) { n++; x.setDate(x.getDate() - 1); }
  return n;
}

function loadProfile() {
  initCountries();
  $('meName').value = profile.name || '';
  var ph = splitPhone(profile.phone || '', profile.country || 'RU');
  setCountry(ph.key);
  $('mePhone').value = formatNational(countryBy(ph.key)[3], ph.national);
  $('meEmail').value = profile.email || '';
  $('mePointA').value = profile.pointA || '';
  $('mePointB').value = profile.pointB || '';
  var d = load('diary', {});
  $('stTasks').textContent = load('todo', []).filter(function (t) { return t.done; }).length;
  $('stDays').textContent = Object.keys(d).filter(function (k) { return k !== 'marathon'; }).length;
  $('stStreak').textContent = streak(d);
  $('gate').hidden = profileOk();
  $('stats').hidden = !profileOk();
}

$('saveMe').onclick = function () {
  onPhoneInput();
  var nm = $('meName').value.trim();
  var em = $('meEmail').value.replace(/\s+/g, '');
  document.querySelectorAll('.me-field.err').forEach(function (f) { f.classList.remove('err'); });
  if (!nm) { markErr('meName', '👤 Напиши своё имя'); return; }
  if (!phoneValid()) { markErr('mePhone', '📱 Проверь номер телефона'); return; }
  if (em && !/^[^@]+@[^@]+\.[^@]+$/.test(em)) { markErr('meEmail', '📧 Проверь email'); return; }
  var first = !profileOk();
  profile.name = nm;
  profile.email = em;
  profile.country = curCountry()[0];
  profile.phone = fullPhone();
  profile.pointA = $('mePointA').value.trim();
  profile.pointB = $('mePointB').value.trim();
  save('profile', profile);
  sendToSheets();
  loadProfile();
  renderHeader();
  if (first) showScreen('tasks');
  else toast('✅ Профиль сохранён');
};

/* ========== ТАБЛИЦА ========== */
var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxlZJ6foAXk9536Y_G4J7DzYr9tbFJoWdlWXqYahtVXUMi-vyGaGHhLy6yl2B6ZlWAu/exec';

function getTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
}
function getUid() {
  var u = localStorage.getItem('uid');
  if (!u) { u = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); localStorage.setItem('uid', u); }
  return u;
}
function sendToSheets() {
  fetch(SHEETS_URL, {
    method: 'POST', mode: 'no-cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      sheet: 'Приложение', uid: getUid(), tz: getTz(),
      name: profile.name, email: profile.email, phone: profile.phone,
      pointA: profile.pointA, pointB: profile.pointB
    })
  }).catch(function () {});
}

/* ========== TELEGRAM ========== */
var TG_BOT = 'my_week_mentor_bot';

$('tgBtn').onclick = function () {
  if (!profileOk()) { toast('👤 Сначала сохрани имя и телефон'); return; }
  $('tgOverlay').hidden = false;
};

function openTelegramBot() {
  var uid = getUid();
  var appLink = 'tg://resolve?domain=' + TG_BOT + '&start=' + uid;
  var webLink = 'https://t.me/' + TG_BOT + '?start=' + uid;
  $('tgOverlay').hidden = true;
  var left = false;
  function onHide() { if (document.hidden) left = true; }
  document.addEventListener('visibilitychange', onHide);
  window.location.href = appLink;
  setTimeout(function () {
    document.removeEventListener('visibilitychange', onHide);
    if (!left && !document.hidden) window.location.href = webLink;
  }, 1500);
}

/* ========== ЗАПУСК ========== */
setTheme(load('theme2', localStorage.getItem('theme') || 'dark'));
renderTasks();
renderAffs();
showScreen(profileOk() ? 'tasks' : 'me');
