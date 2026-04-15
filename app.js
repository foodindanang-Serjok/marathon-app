/* ========== ДАННЫЕ ========== */
var DAYS = [
  { num:1, name:"Точка решения", sub:"Цель: первое ДА Я МОГУ", emoji:"🌱",
    morning:[{type:"audio",title:"Медитация: Ты начинаешь новую жизнь",dur:"5 мин"},{type:"task",text:"Прослушать аффирмации и записать свою"}],
    day:[{type:"reminder",text:"🔔 Ты уже отличаешься от 95% людей"}],
    evening:[{type:"journal",q:"Что ты сделал сегодня?"},{type:"journal",q:"Где победил себя?"}]
  },
  { num:2, name:"Первая победа", sub:"Цель: система работает", emoji:"⚡",
    morning:[{type:"audio",title:"Медитация: Уверенность",dur:"7 мин"},{type:"task",text:"Аффирмации своим голосом — запиши на телефон"}],
    day:[{type:"reminder",text:"🔥 2 дня подряд! Система работает"}],
    evening:[{type:"journal",q:"3 победы за сегодня:"},{type:"journal",q:"1 ошибка (без самобичевания):"}]
  },
  { num:3, name:"Сопротивление", sub:"Ключевой день — большинство сливается", emoji:"💪",
    morning:[{type:"audio",title:"Медитация: Дисциплина",dur:"10 мин"},{type:"task",text:"Аффирмации"}],
    day:[{type:"reminder",text:"💡 Сегодня будет сложно. Это нормально. Ты растёшь."}],
    evening:[{type:"journal",q:"Где хотел слиться сегодня?"},{type:"journal",q:"Почему НЕ слился?"}]
  },
  { num:4, name:"Перелом", sub:"Цель: ощущение новой личности", emoji:"🦋",
    morning:[{type:"audio",title:"Медитация: Новая версия тебя",dur:"10 мин"},{type:"task",text:"Аффирмации с усилением эмоции"}],
    day:[{type:"reminder",text:"🏆 Новый уровень: ты уже не новичок"}],
    evening:[{type:"journal",q:"Кем я был сегодня?"}]
  },
  { num:5, name:"Азарт", sub:"Цель: включить игру", emoji:"🎯",
    morning:[{type:"audio",title:"Медитация: Энергия победителя",dur:"10 мин"},{type:"task",text:"Аффирмации"}],
    day:[{type:"reminder",text:"🚀 Ты уже впереди большинства"}],
    evening:[{type:"journal",q:"Лучший момент сегодняшнего дня:"}]
  },
  { num:6, name:"Усиление", sub:"Цель: привычка как норма", emoji:"🔑",
    morning:[{type:"audio",title:"Медитация: Глубина",dur:"10 мин"},{type:"task",text:"Аффирмации — уже на автомате"}],
    day:[{type:"reminder",text:"✨ Теперь ты человек, который делает"}],
    evening:[{type:"journal",q:"1 результат, который раньше был невозможен:"}]
  },
  { num:7, name:"Новая точка отсчёта", sub:"Цель: зафиксировать трансформацию", emoji:"🌟",
    morning:[{type:"audio",title:"Медитация: Ты изменился",dur:"12 мин"},{type:"task",text:"Аффирмации"}],
    day:[{type:"reminder",text:"📊 Твои итоги 7 дней готовы"}],
    evening:[{type:"journal",q:"Кем я был 7 дней назад?"},{type:"journal",q:"Кто я сейчас?"}]
  }
];

/* ========== СОСТОЯНИЕ ========== */
var doneDays = JSON.parse(localStorage.getItem('doneDays') || '[]');
var tasks    = JSON.parse(localStorage.getItem('tasks')    || '{}');
var dayTasks = JSON.parse(localStorage.getItem('dayTasks') || '{}');
var journals = JSON.parse(localStorage.getItem('journals') || '{}');
var curDay   = parseInt(localStorage.getItem('curDay') || '1');
var openNum  = 1;

/* ========== ГЛАВНЫЙ ЭКРАН ========== */
function renderMain() {
  document.getElementById('sNum').textContent = doneDays.length || 1;
  var g = document.getElementById('dGrid');
  g.innerHTML = '';
  DAYS.forEach(function(d) {
    var done   = doneDays.indexOf(d.num) >= 0;
    var active = d.num === curDay;
    var locked = d.num > curDay;
    var sc = locked ? 'locked' : done ? 'completed' : active ? 'active' : '';
    var bc = done ? 'done' : active ? 'cur' : 'fut';
    var bi = done ? '✓' : d.emoji;
    var dk = 'day' + d.num;
    var td = tasks[dk] || [];
    var dots = [0,1,2].map(function(i) {
      return '<div class="dot' + (td.indexOf(i) >= 0 ? ' on' : '') + '"></div>';
    }).join('');
    var right = active
      ? '<span class="abadge">Сегодня</span>'
      : locked
        ? '<span class="lock-ic">🔒</span>'
        : '<div class="dprog">' + dots + '</div>';
    var cl = locked ? '' : 'onclick="openDay(' + d.num + ')"';
    g.innerHTML += '<div class="day-card ' + sc + '" ' + cl + '>' +
      '<div class="dbadge ' + bc + '">' + bi + '</div>' +
      '<div class="dinfo">' +
        '<div class="dname">День ' + d.num + ' — ' + d.name + '</div>' +
        '<div class="dsub">' + d.sub + '</div>' +
      '</div>' +
      right +
    '</div>';
  });
}

/* ========== ДЕТАЛЬНЫЙ ЭКРАН ========== */
function openDay(n) {
  var d = DAYS[n - 1];
  openNum = n;
  document.getElementById('pLbl').textContent   = 'ДЕНЬ ' + d.num;
  document.getElementById('pTitle').textContent = d.name;
  document.getElementById('pSub').textContent   = d.sub;
  var h = '';
  h += '<div class="tseg"><div class="slbl">🌅 Утро</div>' + items(d.morning, n, 'm') + '</div>';
  h += renderDayTask(n);
  if (d.day && d.day.length) {
    h += '<div class="tseg"><div class="slbl">☀️ День</div>' + items(d.day, n, 'dy') + '</div>';
  }
  h += '<div class="tseg"><div class="slbl">🌙 Вечер — Дневник успеха</div>' + items(d.evening, n, 'e') + '</div>';
  if (n === 7) h += day7block();
  document.getElementById('pBody').innerHTML = h;
  var cta = document.getElementById('pCta');
  if (doneDays.indexOf(n) >= 0) {
    cta.textContent = '✓ День завершён';
    cta.style.background = 'rgba(201,168,76,.2)';
    cta.style.color = 'var(--gold-light)';
  } else {
    cta.textContent = 'Завершить день ✓';
    cta.style.background = 'var(--gold)';
    cta.style.color = 'var(--dark)';
  }
  document.getElementById('dayPanel').classList.add('open');
}

function items(arr, dn, sec) {
  return arr.map(function(it, i) {
    if (it.type === 'audio') {
      return '<div class="ablock">' +
        '<div class="ainfo">' +
          '<div class="atitle">' + it.title + '</div>' +
          '<div class="adur">' + it.dur + '</div>' +
        '</div>' +
        '<audio id="medAudio_' + dn + '_' + i + '" src="meditation.m4a"' +
          ' ontimeupdate="checkMedStop(this);updateMedProgress(this,' + dn + ',' + i + ')"' +
          ' onended="resetMedProgress(' + dn + ',' + i + ')">' +
          'Ваш браузер не поддерживает аудио.' +
        '</audio>' +
        '<div style="margin-top:14px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<div id="medTime_' + dn + '_' + i + '" style="font-size:12px;color:var(--gold-light);font-family:Montserrat,sans-serif;">0:00</div>' +
            '<div style="font-size:12px;color:var(--text-dim);font-family:Montserrat,sans-serif;">10:34</div>' +
          '</div>' +
          '<div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;cursor:pointer;" onclick="seekMed(event,this,' + dn + ',' + i + ')">' +
            '<div id="medProg_' + dn + '_' + i + '" style="height:100%;width:0%;background:linear-gradient(to right,var(--gold),var(--gold-light));border-radius:2px;transition:width .5s linear;"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:center;gap:16px;margin-top:14px;">' +
            '<button onclick="toggleMed(' + dn + ',' + i + ')" id="medBtn_' + dn + '_' + i + '" style="background:var(--gold);color:var(--dark);border:none;border-radius:50%;width:48px;height:48px;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;">▶</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    if (it.type === 'task') {
      var k  = dn + '_' + sec + '_' + i;
      var dk = tasks['day' + dn] || [];
      var dne = dk.indexOf(k) >= 0;
      return '<div class="ti' + (dne ? ' done' : '') + '" id="ti_' + k + '" onclick="tapTask(\'' + k + '\',' + dn + ')">' +
        '<div class="tck">' + (dne ? '✓' : '') + '</div>' +
        '<div class="ttxt">' + it.text + '</div>' +
      '</div>';
    }
    if (it.type === 'reminder') {
      return '<div style="background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);border-radius:12px;padding:14px 16px;font-size:13px;color:var(--gold-light);font-style:italic;margin-bottom:8px;">' + it.text + '</div>';
    }
    if (it.type === 'journal') {
      var jk  = 'j_' + dn + '_' + sec + '_' + i;
      var jval = journals[jk] || '';
      return '<div class="jblock">' +
        '<div class="jq">' + it.q + '</div>' +
        '<textarea class="jinput" id="' + jk + '" placeholder="Напиши здесь..." rows="3"' +
        ' oninput="saveJournal(this)">' + esc(jval) + '</textarea>' +
      '</div>';
    }
    return '';
  }).join('');
}

function renderDayTask(n) {
  var dt    = dayTasks[n] || { items: [] };
  var items = dt.items || [];
  var allDone = items.length > 0 && items.every(function(it) { return it.done; });

  var itemsHtml = items.map(function(it, i) {
    return '<div class="dt-item' + (it.done ? ' dt-item-done' : '') + '" id="dti_' + n + '_' + i + '">' +
      '<div class="dt-check" onclick="toggleDayTask(' + n + ',' + i + ')">' +
        (it.done ? '✓' : '') +
      '</div>' +
      '<div class="dt-item-text">' + esc(it.text) + '</div>' +
      '<div class="dt-item-del" onclick="deleteDayTask(' + n + ',' + i + ')">✕</div>' +
    '</div>';
  }).join('');

  return '<div class="tseg">' +
    '<div class="slbl">🎯 Задачи на день</div>' +
    '<div class="dtblock" id="dtblock_' + n + '">' +
      '<div class="dt-header">' +
        '<div class="dt-icon">🎯</div>' +
        '<div class="dt-label">Запиши свои задачи на сегодня</div>' +
      '</div>' +
      '<div id="dtItems_' + n + '">' + itemsHtml + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;">' +
        '<input class="dt-textarea" id="dtInput_' + n + '" type="text"' +
          ' placeholder="Добавить задачу..." style="flex:1;min-height:auto;padding:10px 14px;resize:none;">' +
        '<button onclick="addDayTask(' + n + ')" style="background:var(--gold);color:var(--dark);border:none;border-radius:10px;padding:10px 16px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">+ Добавить</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function addDayTask(n) {
  var inp  = document.getElementById('dtInput_' + n);
  var text = inp ? inp.value.trim() : '';
  if (!text) {
    if (inp) {
      inp.style.borderColor = 'rgba(224,92,92,.5)';
      setTimeout(function() { inp.style.borderColor = ''; }, 1500);
    }
    return;
  }
  if (!dayTasks[n]) dayTasks[n] = { items: [] };
  if (!dayTasks[n].items) dayTasks[n].items = [];
  dayTasks[n].items.push({ text: text, done: false });
  localStorage.setItem('dayTasks', JSON.stringify(dayTasks));
  inp.value = '';
  // Перерисовываем список задач
  var cont = document.getElementById('dtItems_' + n);
  if (cont) {
    cont.innerHTML = dayTasks[n].items.map(function(it, i) {
      return '<div class="dt-item' + (it.done ? ' dt-item-done' : '') + '" id="dti_' + n + '_' + i + '">' +
        '<div class="dt-check" onclick="toggleDayTask(' + n + ',' + i + ')">' + (it.done ? '✓' : '') + '</div>' +
        '<div class="dt-item-text">' + esc(it.text) + '</div>' +
        '<div class="dt-item-del" onclick="deleteDayTask(' + n + ',' + i + ')">✕</div>' +
      '</div>';
    }).join('');
  }
  toast('✅ Задача добавлена!');
  renderMain();
}

function toggleDayTask(n, i) {
  if (!dayTasks[n] || !dayTasks[n].items) return;
  dayTasks[n].items[i].done = !dayTasks[n].items[i].done;
  localStorage.setItem('dayTasks', JSON.stringify(dayTasks));
  var el = document.getElementById('dti_' + n + '_' + i);
  if (el) {
    var done = dayTasks[n].items[i].done;
    el.className = 'dt-item' + (done ? ' dt-item-done' : '');
    el.querySelector('.dt-check').textContent = done ? '✓' : '';
  }
  renderMain();
  if (dayTasks[n].items[i].done) toast('🎯 Задача выполнена!');
}

function deleteDayTask(n, i) {
  if (!dayTasks[n] || !dayTasks[n].items) return;
  dayTasks[n].items.splice(i, 1);
  localStorage.setItem('dayTasks', JSON.stringify(dayTasks));
  var cont = document.getElementById('dtItems_' + n);
  if (cont) {
    cont.innerHTML = dayTasks[n].items.map(function(it, idx) {
      return '<div class="dt-item' + (it.done ? ' dt-item-done' : '') + '" id="dti_' + n + '_' + idx + '">' +
        '<div class="dt-check" onclick="toggleDayTask(' + n + ',' + idx + ')">' + (it.done ? '✓' : '') + '</div>' +
        '<div class="dt-item-text">' + esc(it.text) + '</div>' +
        '<div class="dt-item-del" onclick="deleteDayTask(' + n + ',' + idx + ')">✕</div>' +
      '</div>';
    }).join('');
  }
  renderMain();
}

function day7block() {
  return '<div style="margin-top:28px;background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(139,111,212,.08));border:1px solid rgba(201,168,76,.25);border-radius:18px;padding:24px;text-align:center;">' +
    '<div style="font-size:32px;margin-bottom:12px;">🏆</div>' +
    '<div style="font-family:Cormorant Garamond,serif;font-size:20px;line-height:1.4;margin-bottom:16px;color:var(--gold-light)">Ты доказал себе, что можешь.</div>' +
    '<button onclick="toast(\'🚀 Продолжай!\')" style="background:var(--gold);color:var(--dark);border:none;border-radius:12px;padding:14px 28px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;cursor:pointer;">Продолжить 30 дней →</button>' +
  '</div>';
}


function tapTask(k, dn) {
  var dk = 'day' + dn;
  if (!tasks[dk]) tasks[dk] = [];
  var idx = tasks[dk].indexOf(k);
  if (idx < 0) tasks[dk].push(k); else tasks[dk].splice(idx, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  var el = document.getElementById('ti_' + k);
  if (el) {
    el.classList.toggle('done');
    el.querySelector('.tck').textContent = el.classList.contains('done') ? '✓' : '';
  }
  renderMain();
}

function completeDay() {
  var n = openNum;

  // Проверяем заполнен ли профиль
  if (!profile.name || !profile.email || !profile.pointA || !profile.pointB) {
    toast('👤 Заполните профиль для сохранения данных');
    setTimeout(function() {
      closeDayPanel();
      navTo('me');
    }, 1500);
    return;
  }

  if (doneDays.indexOf(n) < 0) {
    doneDays.push(n);
    localStorage.setItem('doneDays', JSON.stringify(doneDays));
    if (n === curDay && curDay < 7) {
      curDay = n + 1;
      localStorage.setItem('curDay', curDay);
    }
  }
  renderMain();
  var cta = document.getElementById('pCta');
  cta.textContent = '✓ День завершён';
  cta.style.background = 'rgba(201,168,76,.2)';
  cta.style.color = 'var(--gold-light)';
  toast('🔥 День ' + n + ' завершён!');
  setTimeout(closeDayPanel, 1200);
}

function closeDayPanel() {
  document.getElementById('dayPanel').classList.remove('open');
}

/* ========== НАВИГАЦИЯ ========== */
function navTo(tab) {
  document.querySelectorAll('.ni').forEach(function(n) { n.classList.remove('on'); });
  var el = document.getElementById('ni-' + tab);
  if (el) el.classList.add('on');
  var asc = document.getElementById('affScr');
  var psc = document.getElementById('progScr');
  var msc = document.getElementById('meScr');
  ttsHalt();
  asc.classList.remove('open');
  psc.classList.remove('open');
  msc.classList.remove('open');
  if (tab === 'affirm') {
    asc.classList.add('open');
    loadVoices();
  } else if (tab === 'prog') {
    psc.classList.add('open');
    renderProgress();
  } else if (tab === 'me') {
    msc.classList.add('open');
    loadProfile();
  }
}

/* ========== ПРОГРЕСС ========== */
function renderProgress() {
  var totalDays = 7;
  var doneCount = doneDays.length;
  var pct       = Math.round(doneCount / totalDays * 100);
  var dtDone    = 0;
  for (var i = 1; i <= 7; i++) {
    if (dayTasks[i] && dayTasks[i].done) dtDone++;
  }
  var checksDone = 0;
  Object.keys(tasks).forEach(function(dk) { checksDone += tasks[dk].length; });
  var motivArr = [
    { icon:'🌱', text:'Каждый шаг — это победа над вчерашней версией себя.' },
    { icon:'🔥', text:'Ты уже в топ 5% людей, которые вообще начали.' },
    { icon:'💎', text:'Дисциплина — это свобода. Ты строишь её прямо сейчас.' },
    { icon:'🚀', text:'Большие перемены начинаются с маленьких ежедневных решений.' },
    { icon:'🏆', text:'Ты доказываешь себе каждый день: я человек, который делает.' },
    { icon:'⚡', text:'Энергия идёт туда, куда направлено внимание. Ты на верном пути.' },
    { icon:'🌟', text:'7 дней могут изменить всё. Ты уже меняешься.' }
  ];
  var motiv = motivArr[Math.min(doneCount, 6)];
  var html = '';
  html += '<div class="stats-row">' +
    '<div class="stat-card gold"><div class="stat-num">' + doneCount + '</div><div class="stat-lbl">Дней<br>пройдено</div></div>' +
    '<div class="stat-card gold"><div class="stat-num">' + dtDone + '</div><div class="stat-lbl">Задач<br>выполнено</div></div>' +
    '<div class="stat-card gold"><div class="stat-num">' + checksDone + '</div><div class="stat-lbl">Действий<br>сделано</div></div>' +
  '</div>';
  html += '<div class="prog-block">' +
    '<div class="pb-header"><div class="pb-title">Марафон 7 дней</div><div class="pb-pct">' + pct + '%</div></div>' +
    '<div class="pb-track"><div class="pb-fill" id="pbFill" style="width:0%"></div></div>' +
    '<div class="pb-sub">' + doneCount + ' из ' + totalDays + ' дней завершено</div>' +
  '</div>';
  html += '<div class="prog-block">' +
    '<div class="pb-header"><div class="pb-title">🎯 Задачи дня</div><div class="pb-pct">' + dtDone + ' / 7</div></div>' +
    '<div class="pb-track"><div class="pb-fill" id="pbTasks" style="width:0%"></div></div>' +
    '<div class="pb-sub">Выполнено ' + dtDone + ' из 7 задач</div>' +
  '</div>';
  html += '<div class="motiv-card"><div class="motiv-icon">' + motiv.icon + '</div><div class="motiv-text">' + motiv.text + '</div></div>';
  html += '<div class="slbl" style="margin-bottom:14px">📋 По дням</div>';
  html += '<div class="prog-days">';
  DAYS.forEach(function(d) {
    var isDone   = doneDays.indexOf(d.num) >= 0;
    var isActive = d.num === curDay && !isDone;
    var isLocked = d.num > curDay;
    var rc = isDone ? 'done-row' : isActive ? 'active-row' : '';
    var bc = isDone ? 'done-b'   : isActive ? 'active-b'   : '';
    var bi = isDone ? '✓' : isActive ? '▶' : d.emoji;
    var dt = dayTasks[d.num];
    var dtStatus = isDone
      ? (dt && dt.done ? '🎯 задача выполнена' : '🎯 задача не отмечена')
      : isActive ? 'сегодняшний день'
      : isLocked ? 'заблокирован' : '';
    var check = isDone ? (dt && dt.done ? '🎯✓' : '✓') : isActive ? '→' : '';
    html += '<div class="prog-day-row ' + rc + '">' +
      '<div class="pdr-badge ' + bc + '">' + bi + '</div>' +
      '<div class="pdr-info">' +
        '<div class="pdr-name">День ' + d.num + ' — ' + d.name + '</div>' +
        '<div class="pdr-sub">' + dtStatus + '</div>' +
      '</div>' +
      '<div class="pdr-check">' + check + '</div>' +
    '</div>';
  });
  html += '</div>';

  // Кнопка сброса недели
  html += '<div style="margin-top:28px;padding:20px;background:var(--dark-3);border:1px solid rgba(255,255,255,.06);border-radius:18px;text-align:center;">' +
    '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Хочешь начать заново?</div>' +
    '<div style="font-size:13px;color:var(--text-dim);margin-bottom:16px;line-height:1.5;">Сбрось прогресс и начни марафон с Дня 1</div>' +
    '<button onclick="resetWeek()" style="background:rgba(224,92,92,.15);color:#ff6b6b;border:1px solid rgba(224,92,92,.3);border-radius:12px;padding:13px 24px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .25s;width:100%;">🔄 Начать марафон заново</button>' +
  '</div>';

  document.getElementById('progBody').innerHTML = html;
  setTimeout(function() {
    var f1 = document.getElementById('pbFill');
    var f2 = document.getElementById('pbTasks');
    if (f1) f1.style.width = pct + '%';
    if (f2) f2.style.width = Math.round(dtDone / 7 * 100) + '%';
  }, 100);
}

/* ========== TTS ========== */
var SY    = window.speechSynthesis;
var SYV   = [];
var litId = null;
var paOn  = false;
var paIdx = 0;

function loadVoices() {
  function go() {
    var all = SY.getVoices();
    SYV = all.filter(function(v) { return v.lang.indexOf('ru') === 0; });
    if (!SYV.length) SYV = all;
    var s = document.getElementById('vSel');
    if (!s) return;
    s.innerHTML = '';
    SYV.forEach(function(v, i) {
      var o = document.createElement('option');
      o.value = i;
      o.textContent = v.name.replace(/Google|Microsoft/g, '').trim();
      s.appendChild(o);
    });
  }
  if (SY.getVoices().length) go(); else SY.onvoiceschanged = go;
}

function ttsSpeak(text, cb) {
  if (SY.speaking) SY.cancel();
  var u = new SpeechSynthesisUtterance(text);
  var s = document.getElementById('vSel');
  var r = document.getElementById('vRate');
  u.voice = SYV[s ? parseInt(s.value) : 0] || null;
  u.rate  = r ? parseFloat(r.value) : 0.85;
  u.pitch = 1.05;
  u.lang  = 'ru-RU';
  u.onend = u.onerror = function() { if (cb) cb(); };
  SY.speak(u);
}

function ttsHalt() {
  if (SY.speaking) SY.cancel();
  paOn  = false;
  litId = null;
  refreshAffCards();
  resetPA();
}

/* ========== АФФИРМАЦИИ ========== */
var affs = JSON.parse(localStorage.getItem('affs') || '[]');

function saveAffs() { localStorage.setItem('affs', JSON.stringify(affs)); }

function addAff() {
  var inp = document.getElementById('affIn');
  var t   = inp.value.trim();
  if (!t) {
    inp.style.borderColor = 'rgba(224,92,92,.5)';
    setTimeout(function() { inp.style.borderColor = ''; }, 1000);
    return;
  }
  affs.push({ id: Date.now(), text: t });
  saveAffs();
  inp.value = '';
  renderAffs();
  toast('✨ Аффирмация добавлена!');
}

function delAff(id) {
  ttsHalt();
  affs = affs.filter(function(a) { return a.id !== id; });
  saveAffs();
  renderAffs();
}

function speakOne(id) {
  var aff = null;
  for (var i = 0; i < affs.length; i++) if (affs[i].id === id) { aff = affs[i]; break; }
  if (!aff) return;
  if (litId === id && SY.speaking) { ttsHalt(); return; }
  ttsHalt();
  litId = id;
  refreshAffCards();
  ttsSpeak(aff.text, function() { litId = null; refreshAffCards(); });
}

function togglePA() {
  if (paOn) { ttsHalt(); return; }
  if (!affs.length) return;
  paOn  = true;
  paIdx = 0;
  document.getElementById('paIc').textContent = '⏹';
  document.getElementById('paTx').textContent = 'Остановить';
  document.getElementById('paBtn').classList.add('go');
  nextPA();
}

function nextPA() {
  if (!paOn || paIdx >= affs.length) {
    var fin = paOn && paIdx >= affs.length;
    ttsHalt();
    if (fin) toast('🌟 Все аффирмации прочитаны!');
    return;
  }
  var a = affs[paIdx];
  litId = a.id;
  refreshAffCards();
  ttsSpeak(a.text, function() {
    litId = null;
    refreshAffCards();
    paIdx++;
    setTimeout(nextPA, 800);
  });
}

function resetPA() {
  var b = document.getElementById('paBtn');
  if (!b) return;
  b.classList.remove('go');
  document.getElementById('paIc').textContent = '▶';
  document.getElementById('paTx').textContent = 'Прослушать все подряд';
}

function renderAffs() {
  var list  = document.getElementById('affList');
  var empty = document.getElementById('affEmpty');
  var pab   = document.getElementById('paBtn');
  var vr    = document.getElementById('vRow');
  if (!affs.length) {
    empty.style.display = 'block';
    pab.style.display   = 'none';
    vr.style.display    = 'none';
    list.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  pab.style.display   = 'flex';
  vr.style.display    = 'block';
  list.innerHTML = affs.map(function(a, i) {
    return '<div class="aff-card" id="ac_' + a.id + '">' +
      '<div class="ac-text">' + esc(a.text) + '</div>' +
      '<div class="ac-row">' +
        '<div class="ac-play" onclick="speakOne(' + a.id + ')">▶</div>' +
        '<div class="ac-num">Аффирмация ' + (i + 1) + '</div>' +
        '<button class="ac-del" onclick="delAff(' + a.id + ')">×</button>' +
      '</div>' +
      '<div class="ac-bar"></div>' +
    '</div>';
  }).join('');
  refreshAffCards();
}

function refreshAffCards() {
  affs.forEach(function(a) {
    var c = document.getElementById('ac_' + a.id);
    if (!c) return;
    var p = c.querySelector('.ac-play');
    if (litId === a.id) {
      c.classList.add('lit');
      if (p) p.textContent = '⏸';
    } else {
      c.classList.remove('lit');
      if (p) p.textContent = '▶';
    }
  });
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ========== TOAST ========== */
function toast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-60px);' +
    'background:var(--dark-3);border:1px solid rgba(201,168,76,.35);color:var(--gold-light);' +
    'padding:12px 24px;border-radius:40px;font-size:13px;font-weight:500;z-index:9999;' +
    'transition:transform .4s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;';
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(function() {
    t.style.transform = 'translateX(-50%) translateY(-60px)';
    setTimeout(function() { t.remove(); }, 400);
  }, 2500);
}


/* ========== ПЛЕЕР МЕДИТАЦИИ ========== */
function checkMedStop(audio) {
  if (audio.currentTime >= 634) {
    audio.pause();
    audio.currentTime = 634;
  }
}

function updateMedProgress(audio, dn, i) {
  var pct = (audio.currentTime / 634) * 100;
  var bar = document.getElementById('medProg_' + dn + '_' + i);
  var tim = document.getElementById('medTime_' + dn + '_' + i);
  if (bar) bar.style.width = Math.min(pct, 100) + '%';
  if (tim) {
    var s = Math.floor(audio.currentTime);
    var m = Math.floor(s / 60);
    s = s % 60;
    tim.textContent = m + ':' + (s < 10 ? '0' : '') + s;
  }
}

function resetMedProgress(dn, i) {
  var bar = document.getElementById('medProg_' + dn + '_' + i);
  var tim = document.getElementById('medTime_' + dn + '_' + i);
  var btn = document.getElementById('medBtn_' + dn + '_' + i);
  if (bar) bar.style.width = '0%';
  if (tim) tim.textContent = '0:00';
  if (btn) btn.textContent = '▶';
}

function toggleMed(dn, i) {
  var audio = document.getElementById('medAudio_' + dn + '_' + i);
  var btn   = document.getElementById('medBtn_' + dn + '_' + i);
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    if (btn) btn.textContent = '⏸';
  } else {
    audio.pause();
    if (btn) btn.textContent = '▶';
  }
}

function seekMed(event, bar, dn, i) {
  var audio = document.getElementById('medAudio_' + dn + '_' + i);
  if (!audio) return;
  var rect = bar.getBoundingClientRect();
  var pct  = (event.clientX - rect.left) / rect.width;
  audio.currentTime = Math.min(pct * 634, 634);
}


/* ========== ПРОФИЛЬ ========== */
var profile = JSON.parse(localStorage.getItem('profile') || '{}');

function loadProfile() {
  document.getElementById('meName').value    = profile.name    || '';
  document.getElementById('meEmail').value   = profile.email   || '';
  document.getElementById('mePhone').value   = profile.phone   || '';
  document.getElementById('mePointA').value  = profile.pointA  || '';
  document.getElementById('mePointB').value  = profile.pointB  || '';
  updatePoints();
}

var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxlZJ6foAXk9536Y_G4J7DzYr9tbFJoWdlWXqYahtVXUMi-vyGaGHhLy6yl2B6ZlWAu/exec';

function saveProfile() {
  profile.name   = document.getElementById('meName').value.trim();
  profile.email  = document.getElementById('meEmail').value.trim();
  profile.phone  = document.getElementById('mePhone').value.trim();
  profile.pointA = document.getElementById('mePointA').value.trim();
  profile.pointB = document.getElementById('mePointB').value.trim();
  localStorage.setItem('profile', JSON.stringify(profile));
  toast('✅ Профиль сохранён!');
  updatePoints();
  sendToSheets();
}

function sendToSheets() {
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:   profile.name,
      email:  profile.email,
      phone:  profile.phone,
      pointA: profile.pointA,
      pointB: profile.pointB
    })
  }).then(function() {
    console.log('Данные отправлены в таблицу');
  }).catch(function(err) {
    console.log('Ошибка отправки:', err);
  });
}

function calcPoints() {
  var pts = 0;

  // За каждый завершённый день — 10 баллов
  pts += doneDays.length * 10;

  // За каждую выполненную задачу дня — 5 баллов
  for (var i = 1; i <= 7; i++) {
    if (dayTasks[i] && dayTasks[i].items) {
      dayTasks[i].items.forEach(function(it) { if (it.done) pts += 5; });
    }
  }

  // За каждый чекбокс (аффирмации и задачи) — 2 балла
  Object.keys(tasks).forEach(function(dk) { pts += tasks[dk].length * 2; });

  // За заполненный профиль — 5 баллов
  if (profile.name)   pts += 5;
  if (profile.pointA) pts += 5;
  if (profile.pointB) pts += 5;

  return pts;
}

function updatePoints() {
  var pts = calcPoints();
  var el  = document.getElementById('mePointsNum');
  var sub = document.getElementById('mePointsSub');
  if (el) el.textContent = pts;
  if (sub) {
    var msg = pts === 0
      ? 'Выполняй задания и веди дневник — получай баллы!'
      : pts < 30
        ? 'Хорошее начало! Продолжай в том же духе.'
        : pts < 70
          ? 'Отличный прогресс! Ты на верном пути.'
          : 'Невероятный результат! Ты настоящий чемпион!';
    sub.textContent = msg;
  }
}


/* ========== ДНЕВНИК ========== */
function saveJournal(el) {
  journals[el.id] = el.value;
  localStorage.setItem('journals', JSON.stringify(journals));
}


/* ========== СБРОС НЕДЕЛИ ========== */
function resetWeek() {
  var conf = confirm("Сбросить весь прогресс и начать заново с Дня 1?");
  if (!conf) return;

  // Очищаем все данные марафона
  doneDays = [];
  tasks    = {};
  dayTasks = {};
  journals = {};
  curDay   = 1;

  localStorage.removeItem('doneDays');
  localStorage.removeItem('tasks');
  localStorage.removeItem('dayTasks');
  localStorage.removeItem('journals');
  localStorage.setItem('curDay', '1');

  renderMain();
  renderProgress();
  toast('🔄 Марафон сброшен! Начинаем с Дня 1!');
}

/* ========== INIT ========== */
renderMain();
renderAffs();
