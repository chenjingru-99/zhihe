/* 学习：单词打卡 / 课表与课后计划 / 英语学习计划 */

ZH.Words = {
  list: null,
  map: null,
  INTERVALS: [1, 2, 4, 7, 15, 30, 60],
  async ensure() {
    if (this.list) return this.list;
    const r = await fetch('data/cet4.json');
    this.list = await r.json();
    this.map = {};
    this.list.forEach((x, i) => { this.map[x.w] = i; });
    return this.list;
  },
  buildSession() {
    const w = ZH.M.words();
    const today = ZH.U.today();
    if (w.session && w.session.date === today) return w.session;
    const target = ZH.M.settings().wordsDaily;
    const queue = [];
    Object.keys(w.progress).forEach(k => {
      if (w.progress[k].due <= today && this.map[k] !== undefined) queue.push(this.map[k]);
    });
    let newCount = 0;
    for (let i = 0; i < this.list.length && newCount < target; i++) {
      if (!w.progress[this.list[i].w]) { queue.push(i); newCount++; }
    }
    w.session = { date: today, queue, pos: 0 };
    ZH.M.saveWords(w);
    return w.session;
  },
  grade(word, g) {
    const w = ZH.M.words();
    const today = ZH.U.today();
    const p = w.progress[word] || { lv: 0 };
    if (g === 2) {
      p.lv = Math.min(p.lv + 1, 6);
      p.due = ZH.U.addDays(today, this.INTERVALS[p.lv]);
    } else if (g === 1) {
      p.due = ZH.U.addDays(today, 1);
    } else {
      p.lv = 0;
      p.due = ZH.U.addDays(today, 1);
    }
    w.progress[word] = p;
    ZH.M.saveWords(w);
  },
  checkin() {
    const w = ZH.M.words();
    const today = ZH.U.today();
    if (w.lastCheckin === today) return;
    w.streak = (w.lastCheckin === ZH.U.addDays(today, -1)) ? (w.streak || 0) + 1 : 1;
    w.lastCheckin = today;
    ZH.M.saveWords(w);
  }
};

ZH.views.learn = function (root) {
  const U = ZH.U, M = ZH.M;

  function render() {
    const w = M.words();
    const wt = M.wordsToday();
    const learned = Object.keys(w.progress).length;
    const streak = w.lastCheckin === U.today() || w.lastCheckin === U.addDays(U.today(), -1) ? (w.streak || 0) : 0;
    const daily = M.settings().wordsDaily;
    const sch = ZH.Data.schedule;
    const todayClasses = (sch && sch.weekdays && sch.weekdays[U.weekday()]) || [];

    let englishHtml = '';
    const plan = ZH.Data.englishPlan;
    if (plan && plan.phases && plan.phases.length) {
      const all = [];
      plan.phases.forEach(ph => ph.tasks.forEach(t => all.push(t)));
      const prog = M.english();
      const done = all.filter(t => prog[t.id]).length;
      const pct = all.length ? Math.round(done / all.length * 100) : 0;
      const cur = plan.phases.find(ph => ph.tasks.some(t => !prog[t.id])) || plan.phases[plan.phases.length - 1];
      const next = cur.tasks.find(t => !prog[t.id]);
      englishHtml = `
      <section class="card">
        <a class="card-title" href="#/english" style="color:inherit">${ZH.icon('sparkle')}英语起飞计划<span class="tail">已完成 ${pct}% ${ZH.icon('chevR')}</span></a>
        <div class="card-soft mt-12">
          <div class="small" style="font-weight:600">${U.esc(cur.title)}</div>
          ${next ? `<div class="row-ts mt-8" style="color:var(--ink)">下一步：${U.esc(next.t)}</div>` : '<div class="row-ts mt-8">全部完成，太棒了</div>'}
          <div class="bar mt-12"><i style="width:${pct}%"></i></div>
        </div>
        <a class="btn btn-soft btn-sm btn-block mt-12" href="#/english">查看完整计划</a>
      </section>`;
    }

    let mandarinHtml = '';
    const mat = ZH.mandarinMaterial();
    if (mat) {
      const md = M.mandarin();
      const mdDone = (md.done || []).includes(U.today());
      mandarinHtml = `
      <section class="card">
        <a class="card-title" href="#/mandarin" style="color:inherit">${ZH.icon('mic')}普通话 · 表达<span class="tail">${ZH.icon('flame')}连续 ${ZH.calcStreak(md.done || [])} 天 ${ZH.icon('chevR')}</span></a>
        <div class="card-soft mt-12">
          <div class="small" style="font-weight:600">${U.esc(mat.title)}</div>
          <div class="mt-8" style="font-size:14px;line-height:2;color:var(--ink)">${U.esc(mat.text)}</div>
        </div>
        <a class="btn ${mdDone ? 'btn-soft' : 'btn-primary'} btn-sm btn-block mt-12" href="#/mandarin">${mdDone ? '今天已打卡 ✓ 换个素材' : '去练习'}</a>
      </section>`;
    }

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">学习</div>
      <div class="page-sub">${U.fmtCNWithWeek(U.today())}</div>
    </div>
    <div class="stagger">
    <section class="card">
      <div class="card-title">${ZH.icon('book')}四级单词<span class="tail">${ZH.icon('flame')}连续 <b class="num">${streak}</b> 天</span></div>
      <div class="mt-12">
        <div class="bar-lbl"><span>今日背诵</span><span class="num">${wt.done} / ${wt.total}</span></div>
        <div class="bar"><i style="width:${wt.total ? Math.min(100, Math.round(wt.done / wt.total * 100)) : 0}%"></i></div>
      </div>
      <div class="flex-between mt-12 dim" style="font-size:12.5px">
        <span>已学 <b class="num">${learned}</b> / ${ZH.Words.list ? ZH.Words.list.length : 4544} 词</span>
        <span>每日词量</span>
      </div>
      <div class="chip-row mt-8" id="daily-chips">
        ${[20, 30, 50, 80].map(n => `<button class="chip num ${n === daily ? 'active' : ''}" data-act="daily" data-n="${n}" lang="en">${n} 词</button>`).join('')}
      </div>
      <button class="btn btn-primary btn-block mt-12" data-act="start-words">${wt.done && !wt.finished ? '继续背诵' : '开始背诵'}</button>
    </section>

    <section class="card">
      <div class="card-title">${ZH.icon('calendar')}今日课表</div>
      ${todayClasses.length ? `<div class="mt-8">${todayClasses.map(c => classRowHtml(c, false)).join('')}</div>` :
        (sch && sch.weekdays ? '<div class="empty" style="padding:16px 0">今天没有课，安排点自己的事吧</div>' :
          '<div class="empty" style="padding:16px 0"><span class="em">📅</span>课表还没有导入<br>把课表发给 AI 助手，就能自动导入</div>')}
      ${sch && sch.weekdays ? '<a class="btn btn-soft btn-sm btn-block mt-8" href="#/schedule">查看整周课表</a>' : ''}
    </section>

    ${englishHtml}

    ${mandarinHtml}
    </div>`;

    bindClassRows(root);
  }

  root.addEventListener('click', async e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'daily') {
      const s = M.settings();
      s.wordsDaily = Number(el.dataset.n);
      M.saveSettings(s);
      render();
    }
    if (act === 'start-words') {
      location.hash = '#/session';
    }
  });

  function classRowHtml(c, expanded) {
    const items = M.lessons()[c.id] || [];
    const done = items.filter(i => i.done).length;
    return `
    <div class="class-row" data-cid="${c.id}">
      <div class="flex-between" data-act="expand">
        <div class="grow">
          <div class="class-time num">${U.esc(c.time || '')}</div>
          <div class="class-name">${U.esc(c.name)}</div>
          <div class="class-meta">${U.esc([c.teacher, c.location].filter(Boolean).join(' · '))}</div>
        </div>
        <div class="row-arrow" style="transition:transform .2s var(--ease-out);transform:rotate(${expanded ? 180 : 0}deg)">${ZH.icon('chevD')}</div>
      </div>
      <div class="lesson-box" style="display:${expanded ? 'block' : 'none'}">
        <div class="small" style="font-weight:600;margin-bottom:4px">课后计划 ${items.length ? done + '/' + items.length : ''}</div>
        ${items.map(it => `
        <div class="todo-row ${it.done ? 'done' : ''}" data-lid="${it.id}">
          <button class="cb" data-act="toggle-lesson" data-cid="${c.id}" data-lid="${it.id}" aria-label="完成">${ZH.icon('check')}</button>
          <span class="todo-txt" style="font-size:14px">${U.esc(it.text)}</span>
          <button class="todo-del" data-act="del-lesson" data-cid="${c.id}" data-lid="${it.id}" aria-label="删除">${ZH.icon('trash')}</button>
        </div>`).join('')}
        <form class="inline-add" data-act="add-lesson" data-cid="${c.id}">
          <input name="t" placeholder="课后要背诵 / 复习什么…" maxlength="60" autocomplete="off">
          <button class="btn btn-primary" type="submit">${ZH.icon('plus')}</button>
        </form>
      </div>
    </div>`;
  }

  function bindClassRows(scope) {
    scope.querySelectorAll('.class-row').forEach(row => {
      const head = row.querySelector('[data-act="expand"]');
      head.addEventListener('click', () => {
        const box = row.querySelector('.lesson-box');
        const open = box.style.display === 'none';
        box.style.display = open ? 'block' : 'none';
        row.querySelector('.row-arrow').style.transform = 'rotate(' + (open ? 180 : 0) + 'deg)';
      });
      row.querySelector('[data-act="add-lesson"]').addEventListener('submit', e => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        const v = (input.value || '').trim();
        if (!v) return;
        const ls = M.lessons();
        ls[row.dataset.cid] = ls[row.dataset.cid] || [];
        ls[row.dataset.cid].push({ id: U.uid(), text: v, done: false });
        M.saveLessons(ls);
        render();
      });
      row.querySelectorAll('[data-act="toggle-lesson"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const ls = M.lessons();
          const it = (ls[btn.dataset.cid] || []).find(x => x.id === btn.dataset.lid);
          if (it) { it.done = !it.done; M.saveLessons(ls); render(); }
        });
      });
      row.querySelectorAll('[data-act="del-lesson"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const ls = M.lessons();
          ls[btn.dataset.cid] = (ls[btn.dataset.cid] || []).filter(x => x.id !== btn.dataset.lid);
          M.saveLessons(ls);
          render();
        });
      });
    });
  }

  ZH._classRowHtml = classRowHtml;
  ZH._bindClassRows = bindClassRows;
  render();
};

/* ---------- 单词背诵（全屏） ---------- */
ZH.views.session = function (root) {
  const U = ZH.U, M = ZH.M;
  let revealed = false;

  async function render() {
    try {
      await ZH.Words.ensure();
    } catch (e) {
      root.innerHTML = `<div class="focus-page"><div class="ring-wrap"><div class="word-done"><span class="big">🌧</span><div>词库加载失败</div><div class="dim small">需要联网加载一次词库，之后会缓存</div></div><button class="btn btn-primary" data-act="back">返回</button></div></div>`;
      bind();
      return;
    }
    const w = M.words();
    let session = (w.session && w.session.date === U.today()) ? w.session : null;

    if (session && session.pos >= session.queue.length) {
      renderDone();
      return;
    }
    if (!session || session.queue.length === 0) {
      session = ZH.Words.buildSession();
      if (session.queue.length === 0) { renderDone(); return; }
    }
    const entry = ZH.Words.list[session.queue[session.pos]];
    const total = session.queue.length, pos = session.pos + 1;

    root.innerHTML = `
    <div class="word-stage">
      <div class="focus-top">
        <button class="icon-btn" data-act="quit" aria-label="退出">${ZH.icon('close')}</button>
        <span class="t">今日单词 <b class="num">${pos}</b>/${total}</span>
        <span style="width:44px"></span>
      </div>
      <div class="bar mt-8"><i style="width:${Math.round((pos - 1) / total * 100)}%"></i></div>
      <div class="word-card" data-act="reveal">
        <div class="word-big" lang="en">${U.esc(entry.w)}</div>
        ${entry.p ? `<div class="word-ph" lang="en">/${U.esc(entry.p)}/</div>` : ''}
        ${revealed ? `
          <div class="word-cn pop">${U.esc(entry.c)}</div>
          ${entry.e ? `<div class="word-ex mt-8"><span class="en" lang="en">${U.esc(entry.e[0])}</span>${U.esc(entry.e[1])}</div>` : ''}` :
          '<div class="dimmer small mt-8">点击卡片查看释义</div>'}
      </div>
      <div class="grade-btns">
        ${revealed ? `
        <button class="grade-btn grade-no" data-act="grade" data-g="0">不认识<small>明天再背</small></button>
        <button class="grade-btn grade-fuzzy" data-act="grade" data-g="1">有点模糊<small>明天复习</small></button>
        <button class="grade-btn grade-know" data-act="grade" data-g="2">认识<small>进入下一级</small></button>` :
        `<button class="btn btn-soft btn-block" data-act="reveal" style="min-height:52px">显示释义</button>`}
      </div>
    </div>`;
    bind();
  }

  function renderDone() {
    const w = M.words();
    ZH.Words.checkin();
    let tomorrowCount = 0;
    const tomorrow = U.addDays(U.today(), 1);
    Object.values(w.progress).forEach(p => { if (p.due <= tomorrow) tomorrowCount++; });
    root.innerHTML = `
    <div class="word-stage">
      <div class="focus-top"><span style="width:44px"></span><span class="t">今日单词</span><span style="width:44px"></span></div>
      <div class="word-done">
        <span class="big pop">🌿</span>
        <div style="font-size:22px;font-weight:700">今日打卡完成</div>
        <div class="dim">连续 <b class="num">${w.streak || 1}</b> 天 · 已学 <b class="num">${Object.keys(w.progress).length}</b> 个词</div>
        <div class="dim small">明天有 ${tomorrowCount} 个单词等着复习</div>
      </div>
      <button class="btn btn-primary btn-block" data-act="back">返回学习</button>
    </div>`;
    bind();
  }

  function bind() {
    root.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('click', async () => {
        const act = el.dataset.act;
        if (act === 'back' || act === 'quit') location.hash = '#/learn';
        if (act === 'reveal') { revealed = true; render(); }
        if (act === 'grade') {
          const w = M.words();
          const entry = ZH.Words.list[w.session.queue[w.session.pos]];
          ZH.Words.grade(entry.w, Number(el.dataset.g));
          w.session.pos++;
          ZH.M.saveWords(w);
          revealed = false;
          if (w.session.pos >= w.session.queue.length) ZH.UI.chime();
          render();
        }
      });
    });
  }

  render();
};

/* ---------- 整周课表 ---------- */
ZH.views.schedule = function (root) {
  const U = ZH.U, M = ZH.M;
  let sel = U.weekday();
  const sch = ZH.Data.schedule;

  function weekDates() {
    const today = U.today();
    const wd = U.weekday();
    const monday = U.addDays(today, 1 - wd);
    const out = [];
    for (let i = 1; i <= 7; i++) out.push(U.addDays(monday, i - 1));
    return out;
  }

  function render() {
    const dates = weekDates();
    const classes = (sch && sch.weekdays && sch.weekdays[sel]) || [];
    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">课表</div>
      <div class="page-sub">${sch && sch.note ? U.esc(sch.note) : '每周循环 · 课后计划可逐节添加'}</div>
    </div>
    <div class="week-chips">
      ${dates.map((d, i) => `
      <button class="week-chip ${d === U.today() ? 'today' : ''} ${sel === i + 1 ? 'active' : ''}" data-act="day" data-d="${i + 1}">
        <span>${U.WEEK_CN[i]}</span><b class="num">${Number(d.slice(8))}</b>
      </button>`).join('')}
    </div>
    <div class="card">
      ${classes.length ? classes.map(c => ZH._classRowHtml(c, false)).join('') :
        '<div class="empty" style="padding:24px 0">' + (sch && sch.weekdays ? '这一天没有课' : '<span class="em">📅</span>课表还没有导入<br>把课表发给 AI 助手即可导入') + '</div>'}
    </div>
    <div class="card">
      <div class="small dim" style="line-height:1.9">每节课都可以展开添加「课后计划」，比如现代汉语上完语法，就计划好要背的内容，上完回来打勾。</div>
    </div>`;
    root.querySelectorAll('[data-act="day"]').forEach(b => {
      b.addEventListener('click', () => { sel = Number(b.dataset.d); render(); });
    });
    ZH._bindClassRows(root);
  }

  render();
};

/* ---------- 英语学习计划 ---------- */
ZH.views.english = function (root) {
  const U = ZH.U, M = ZH.M;
  const plan = ZH.Data.englishPlan;
  if (!plan || !plan.phases) {
    root.innerHTML = '<div class="page-head"><div class="page-title">英语计划</div></div><div class="card"><div class="empty">计划文件加载失败，请联网后重试</div></div>';
    return;
  }
  const prog = M.english();
  const all = [];
  plan.phases.forEach(ph => ph.tasks.forEach(t => all.push(t)));
  const done = all.filter(t => prog[t.id]).length;
  const pct = all.length ? Math.round(done / all.length * 100) : 0;
  let openId = null;
  plan.phases.forEach(ph => { if (!openId && ph.tasks.some(t => !prog[t.id])) openId = ph.id; });

  function render() {
    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">英语起飞计划</div>
      <div class="page-sub">从音标开始 · 每天约 ${plan.dailyMinutes || 30} 分钟 · 距四级还有 ${Math.max(0, U.daysBetween(U.today(), M.settings().examDate))} 天</div>
    </div>
    <div class="card rise">
      <div class="bar-lbl"><span>总进度</span><span class="num">${done} / ${all.length} 项</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>
    ${plan.phases.map(ph => {
      const pd = ph.tasks.filter(t => prog[t.id]).length;
      const pp = ph.tasks.length ? Math.round(pd / ph.tasks.length * 100) : 0;
      const open = openId === ph.id;
      return `
      <div class="card" data-phase="${ph.id}">
        <div class="flex-between" data-act="toggle">
          <div class="grow">
            <div class="card-title" style="font-size:16px">${U.esc(ph.title)}${pp === 100 ? ' <span class="chip" style="min-height:24px;padding:0 10px;font-size:11px">已完成</span>' : ''}</div>
            <div class="row-ts mt-8">${U.esc(ph.goal || '')}</div>
          </div>
          <div class="row-arrow" style="transition:transform .2s var(--ease-out);transform:rotate(${open ? 180 : 0}deg)">${ZH.icon('chevD')}</div>
        </div>
        <div class="bar mt-12" style="height:6px"><i style="width:${pp}%"></i></div>
        <div style="display:${open ? 'block' : 'none'};margin-top:6px">
          ${ph.tasks.map(t => `
          <div class="todo-row ${prog[t.id] ? 'done' : ''}">
            <button class="cb" data-act="task" data-id="${t.id}" aria-label="完成">${ZH.icon('check')}</button>
            <span class="todo-txt" style="font-size:14px">${U.esc(t.t)}${t.dur ? ' <span class="tagline">· ' + t.dur + '</span>' : ''}</span>
            ${t.video && t.video.u ? `<a class="chip" style="min-height:32px;padding:0 12px;font-size:12px;flex:none" href="${U.esc(t.video.u)}" target="_blank" rel="noopener">${ZH.icon('play')}${U.esc(t.video.t || '视频')}</a>` : ''}
          </div>`).join('')}
        </div>
      </div>`;
    }).join('')}
    <div class="card">
      <div class="small dim" style="line-height:1.9">看完视频记得配合「四级单词」一起背，音标阶段每天跟读出声，别只默看。</div>
    </div>`;

    root.querySelectorAll('[data-act="toggle"]').forEach(h => {
      h.addEventListener('click', () => {
        const box = h.closest('[data-phase]').querySelector('[style*="margin-top:6px"]');
        const open = box.style.display === 'none';
        box.style.display = open ? 'block' : 'none';
        h.querySelector('.row-arrow').style.transform = 'rotate(' + (open ? 180 : 0) + 'deg)';
      });
    });
    root.querySelectorAll('[data-act="task"]').forEach(b => {
      b.addEventListener('click', () => {
        const p = M.english();
        if (p[b.dataset.id]) delete p[b.dataset.id];
        else p[b.dataset.id] = true;
        M.saveEnglish(p);
        render();
      });
    });
  }

  render();
};
