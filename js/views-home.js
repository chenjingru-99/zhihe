/* 首页（青瓷晨雾 · 去卡片化：微标签 + 细线分区 + 知知） / 专注 */

ZH.views.home = function (root) {
  const U = ZH.U, M = ZH.M;
  const today = U.today();
  const s = M.settings();
  const examDays = Math.max(0, U.daysBetween(today, s.examDate));
  const WEEK_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  function renderAll() {
    const todos = M.todosToday();
    const todoDone = todos.filter(t => t.done).length;

    const wt = M.wordsToday();
    const lessons = M.lessonsToday();
    const lessonDone = lessons.filter(l => l.done).length;
    const reviewDone = !!M.reviews()[today];
    const mdDone = (M.mandarin().done || []).includes(today);

    const wordState = wt.finished && wt.total ? 'on' : (wt.done ? 'half' : '');
    const lessonState = lessons.length ? (lessonDone === lessons.length ? 'on' : (lessonDone ? 'half' : '')) : '';

    root.innerHTML = `
  <div class="home-wrap">
  <header class="home-head rise">
    <div>
      <div class="lbl">TODAY · ${WEEK_EN[U.weekday() - 1]}</div>
      <div class="home-date"><b>${U.fmtCN(today)}</b><span class="num" id="home-clock">${U.timeHM(Date.now())}</span></div>
    </div>
    <div class="home-cd" aria-label="距四级考试还有 ${examDays} 天">
      <b class="num">${examDays}</b><span class="lbl">DAYS TO EXAM</span>
    </div>
  </header>

  <hr class="hr">

  <section aria-label="今日待办">
    <div class="hsec">
      <b>今日待办</b>
      <span class="lbl" id="todo-count">${todos.length ? 'TODO · ' + todoDone + '/' + todos.length : 'TODO · CLEAR'}</span>
    </div>
    <div id="todo-list">${todos.length ? todos.map(todoHtml).join('') : '<div class="empty" style="padding:14px 2px">今天还没有安排，加一条吧</div>'}</div>
    <div class="home-add" data-act="add-todo" role="button" tabindex="0" aria-label="添加待办">${ZH.icon('plus')}<span>添加待办…</span></div>
  </section>

  <section class="hdots" aria-label="今日打卡">
    <a class="hdot ${wordState}" href="#/learn"><i></i><span>单词</span></a>
    <a class="hdot ${lessonState}" href="#/learn"><i></i><span>课后</span></a>
    <a class="hdot ${reviewDone ? 'on' : ''}" href="#/review"><i></i><span>复盘</span></a>
    <a class="hdot ${mdDone ? 'on' : ''}" href="#/mandarin"><i></i><span>普通话</span></a>
  </section>
  </div>`;
  }

  function todoHtml(t) {
    return `<div class="todo-row ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="cb" data-act="toggle-todo" aria-label="${t.done ? '标记未完成' : '标记完成'}">${ZH.icon('check')}</button>
      <span class="todo-txt">${U.esc(t.text)}</span>
      <button class="todo-del" data-act="del-todo" aria-label="删除待办">${ZH.icon('trash')}</button>
    </div>`;
  }

  function openAdd() {
    const sh = ZH.UI.sheet({
      title: '添加待办',
      body: b => {
        b.innerHTML = `
        <input class="input" id="td-text" placeholder="要做什么？一句话就好" maxlength="60" autocomplete="off">
        <div class="sheet-actions" style="margin-top:16px">
          <button class="btn btn-soft" data-r="0">取消</button>
          <button class="btn btn-primary" data-r="1">添加</button>
        </div>`;
        const input = b.querySelector('#td-text');
        const submit = () => {
          const v = input.value.trim();
          if (!v) return;
          const ts = M.todos();
          ts.push({ id: U.uid(), text: v, done: false, date: U.today() });
          M.saveTodos(ts);
          sh.close();
          renderTodos();
        };
        setTimeout(() => input.focus(), 280);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        b.querySelectorAll('[data-r]').forEach(btn => {
          btn.addEventListener('click', () => { btn.dataset.r === '1' ? submit() : sh.close(); });
        });
      }
    });
  }

  renderAll();
  const petCleanup = ZH.Pet.mount();

  /* 刚完成一次专注回到首页：知知庆祝一下 */
  if (ZH._focusDoneTs && Date.now() - ZH._focusDoneTs < 150000) {
    ZH._focusDoneTs = 0;
    setTimeout(() => { ZH.Pet.cheer(); ZH.Pet.say('专注结束啦，休息一下吧'); }, 700);
  }

  root.addEventListener('click', clickH);
  root.addEventListener('keydown', keyH);

  function clickH(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'add-todo') openAdd();
    if (act === 'toggle-todo') {
      const ts = M.todos();
      const t = ts.find(x => x.id === el.closest('.todo-row').dataset.id);
      if (t) {
        t.done = !t.done;
        M.saveTodos(ts);
        renderTodos();
        if (t.done) {
          const left = ts.filter(x => x.date === today && !x.done).length;
          ZH.Pet.cheer();
          ZH.Pet.say(left === 0 ? '今天的待办全清空啦' : '勾掉一条，轻松一点了吧');
        }
      }
    }
    if (act === 'del-todo') {
      const id = el.closest('.todo-row').dataset.id;
      M.saveTodos(M.todos().filter(x => x.id !== id));
      renderTodos();
    }
  }

  function keyH(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('[data-act][role="button"]');
    if (el) { e.preventDefault(); el.click(); }
  }

  function renderTodos() {
    const box = root.querySelector('#todo-list');
    const ts = M.todosToday();
    box.innerHTML = ts.length ? ts.map(todoHtml).join('') : '<div class="empty" style="padding:14px 2px">今天还没有安排，加一条吧</div>';
    const lbl = root.querySelector('#todo-count');
    if (lbl) lbl.textContent = ts.length ? 'TODO · ' + ts.filter(t => t.done).length + '/' + ts.length : 'TODO · CLEAR';
  }

  const clock = setInterval(() => {
    const el = root.querySelector('#home-clock');
    if (el) el.textContent = U.timeHM(Date.now());
  }, 15000);

  return function cleanup() {
    clearInterval(clock);
    if (petCleanup) petCleanup();
  };
};

/* ---------- 专注（番茄钟） ---------- */
ZH.views.focus = function (root) {
  const U = ZH.U, M = ZH.M;
  let cur = ZH.Store.get('focusCurrent', null);
  let justDone = null;
  let timer = null;
  let wakeLock = null;
  const DURATIONS = [15, 25, 45, 60];
  let picked = 25;

  if (cur && Date.now() >= cur.endTs) settle(true);

  function render() {
    clearInterval(timer);
    if (cur) renderRunning();
    else if (justDone) renderDone();
    else renderIdle();
  }

  function renderIdle() {
    root.innerHTML = `
    <div class="focus-page">
      <div class="focus-top">
        <button class="icon-btn" data-act="back" aria-label="返回">${ZH.icon('close')}</button>
        <span class="t">专注</span>
        <span style="width:44px"></span>
      </div>
      <div class="ring-wrap">
        <div class="ring"><svg viewBox="0 0 264 264"><circle class="track" cx="132" cy="132" r="118"/><circle class="prog" cx="132" cy="132" r="118" style="stroke-dasharray:741.4;stroke-dashoffset:741.4"/></svg>
          <div class="ring-center"><span class="time-lg num" lang="en">${picked}:00</span><span class="ring-sub">准备开始</span></div>
        </div>
        <div class="chip-row">${DURATIONS.map(d =>
          `<button class="chip num ${d === picked ? 'active' : ''}" data-act="pick" data-d="${d}" lang="en">${d} 分钟</button>`).join('')}
        </div>
        <button class="btn btn-primary" style="min-width:200px" data-act="start">${ZH.icon('play')}开始专注</button>
        <p class="focus-note">专注期间保持这个页面在前台<br>屏幕会保持常亮，结束时用铃声提醒你</p>
      </div>
    </div>`;
    bind();
  }

  function renderRunning() {
    root.innerHTML = `
    <div class="focus-page">
      <div class="focus-top">
        <button class="icon-btn" data-act="giveup" aria-label="放弃专注">${ZH.icon('close')}</button>
        <span class="t">专注中</span>
        <span style="width:44px"></span>
      </div>
      <div class="ring-wrap">
        <div class="ring"><svg viewBox="0 0 264 264"><circle class="track" cx="132" cy="132" r="118"/><circle class="prog" cx="132" cy="132" r="118" style="stroke-dasharray:741.4"/></svg>
          <div class="ring-center"><span class="time-lg num" id="ft" lang="en">--:--</span><span class="ring-sub" id="fs"></span></div>
        </div>
        <p class="focus-note">别切走，去完成你的主线任务<br>回来时这里还在</p>
        <button class="btn btn-danger" data-act="giveup">放弃本次专注</button>
      </div>
    </div>`;
    bind();
    tick();
    timer = setInterval(tick, 300);
  }

  function renderDone() {
    const f = M.focusToday();
    root.innerHTML = `
    <div class="focus-page">
      <div class="focus-top">
        <button class="icon-btn" data-act="back" aria-label="返回">${ZH.icon('close')}</button>
        <span class="t">专注完成</span>
        <span style="width:44px"></span>
      </div>
      <div class="ring-wrap">
        <div class="word-done pop">
          <span class="big">🌿</span>
          <div style="font-size:22px;font-weight:700">完成一个番茄</div>
          <div class="dim">今天已专注 ${f.count} 个番茄，共 ${f.minutes} 分钟</div>
        </div>
        <button class="btn btn-primary" style="min-width:200px" data-act="again">${ZH.icon('play')}再来一个</button>
        <button class="btn btn-ghost" data-act="back">回到首页</button>
      </div>
    </div>`;
    bind();
  }

  function tick() {
    const left = Math.max(0, cur.endTs - Date.now());
    const m = Math.floor(left / 60000), sec = Math.floor(left % 60000 / 1000);
    const tEl = root.querySelector('#ft'), sEl = root.querySelector('#fs');
    if (tEl) tEl.textContent = U.pad(m) + ':' + U.pad(sec);
    if (sEl) sEl.textContent = '还剩 ' + m + ' 分钟';
    const prog = 1 - left / (cur.minutes * 60000);
    const ring = root.querySelector('.prog');
    if (ring) ring.style.strokeDashoffset = 741.4 * (1 - prog);
    if (left <= 0) settle(false);
  }

  function settle(silent) {
    const minutes = cur ? cur.minutes : 0;
    if (cur) {
      M.addFocusSession(minutes);
      ZH.Store.set('focusCurrent', null);
      releaseLock();
      ZH._focusDoneTs = Date.now();
    }
    justDone = true;
    cur = null;
    if (!silent) ZH.UI.chime();
    render();
  }

  async function grabLock() {
    try {
      if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) { }
  }
  function releaseLock() {
    try { wakeLock && wakeLock.release(); } catch (e) { }
    wakeLock = null;
  }

  function bind() {
    root.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('click', async () => {
        const act = el.dataset.act;
        if (act === 'back') location.hash = '#/home';
        if (act === 'pick') {
          picked = Number(el.dataset.d);
          root.querySelectorAll('[data-act="pick"]').forEach(c => c.classList.toggle('active', Number(c.dataset.d) === picked));
          root.querySelector('.time-lg').textContent = picked + ':00';
        }
        if (act === 'start' || act === 'again') {
          justDone = null;
          cur = { minutes: picked, startedTs: Date.now(), endTs: Date.now() + picked * 60000 };
          ZH.Store.set('focusCurrent', cur);
          grabLock();
          render();
        }
        if (act === 'giveup') {
          const ok = await ZH.UI.confirm('放弃本次专注', '这次专注不会计入统计，确定要放弃吗？');
          if (ok) {
            ZH.Store.set('focusCurrent', null);
            cur = null;
            releaseLock();
            location.hash = '#/home';
          }
        }
      });
    });
  }

  document.addEventListener('visibilitychange', onVis);
  function onVis() {
    if (!document.hidden && cur) {
      if (Date.now() >= cur.endTs) settle(false);
    }
  }

  render();
  return function cleanup() {
    clearInterval(timer);
    releaseLock();
    document.removeEventListener('visibilitychange', onVis);
  };
};
