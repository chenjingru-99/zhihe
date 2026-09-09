/* 生活：记账 / 日记（复盘在首页入口，普通话在学习页，AI 日报独立 Tab） */

ZH.CATS = [
  { id: 'food', name: '吃饭', em: '🍜' },
  { id: 'shop', name: '买东西', em: '🛍️' },
  { id: 'transport', name: '交通', em: '🚌' },
  { id: 'study', name: '学习', em: '📚' },
  { id: 'fun', name: '娱乐', em: '🎮' },
  { id: 'daily', name: '日用', em: '🧺' },
  { id: 'other', name: '其他', em: '📦' }
];

ZH.MOODS = [
  { id: 'great', em: '😄', name: '开心' },
  { id: 'calm', em: '😌', name: '平静' },
  { id: 'tired', em: '😪', name: '疲惫' },
  { id: 'low', em: '😔', name: '低落' },
  { id: 'full', em: '🌾', name: '充实' }
];

ZH.views.life = function (root) {
  const U = ZH.U, M = ZH.M;
  const today = U.today();

  function render() {
    const mk = U.monthKey();
    const entries = M.moneyMonth(mk);
    const spent = entries.filter(e => e.type !== 'save').reduce((a, b) => a + b.amount, 0);
    const saved = entries.filter(e => e.type === 'save').reduce((a, b) => a + b.amount, 0);
    const goal = M.settings().savingGoal || 0;
    const todayEntries = entries.filter(e => e.date === today && e.type !== 'save');
    const todaySpent = todayEntries.reduce((a, b) => a + b.amount, 0);
    const diary = M.diary();
    const todayEntry = diary.entries.find(x => x.date === today);
    const news = ZH.Data.news;

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">生活</div>
      <div class="page-sub">${U.fmtCNWithWeek(today)}</div>
    </div>
    <div class="stagger">
    <section class="card">
      <div class="flex-between">
        <a class="card-title" href="#/money" style="color:inherit">${ZH.icon('wallet')}账本</a>
        <span class="tagline num">本月支出 ${U.money(spent)}</span>
      </div>
      <div class="mt-12">
        <div class="bar-lbl"><span>存钱目标</span><span class="num">${U.money(saved)} / ${U.money(goal)}</span></div>
        <div class="bar honey"><i style="width:${goal ? Math.min(100, Math.round(saved / goal * 100)) : 0}%"></i></div>
      </div>
      ${todayEntries.length ? `<div class="mt-8">${todayEntries.slice(-4).reverse().map(entryHtml).join('')}</div>` : '<div class="empty" style="padding:12px 0">今天还没记账</div>'}
      <button class="btn btn-primary btn-block mt-12" data-act="add-exp">${ZH.icon('plus')}记一笔${todaySpent ? '（今天已花 ' + U.money(todaySpent) + '）' : ''}</button>
    </section>

    <section class="card">
      <a class="card-title" href="#/diary" style="color:inherit">${ZH.icon('pen')}日记<span class="tail">${diary.entries.length ? diary.entries.length + ' 篇' : ''} ${ZH.icon('chevR')}</span></a>
      ${todayEntry ? `
      <div class="card-soft mt-12">
        <div class="small" style="font-weight:600">${todayEntry.mood ? ZH.MOODS.find(m => m.id === todayEntry.mood).em + ' ' : ''}今天已写日记</div>
        <div class="row-ts mt-8" style="-webkit-line-clamp:3;overflow:hidden;display:-webkit-box">${U.esc(todayEntry.text)}</div>
      </div>
      <a class="btn btn-soft btn-sm btn-block mt-8" href="#/diary">继续编辑</a>` : `
      <div class="empty" style="padding:12px 0">睡前写几句，给今天留个底</div>
      <a class="btn btn-primary btn-sm btn-block mt-8" href="#/diary">写今天的日记</a>`}
    </section>

    <section class="card">
      <a class="card-title" href="#/news" style="color:inherit">${ZH.icon('news')}AI 日报<span class="tail">${news ? U.fmtCN(news.date) + ' · ' + news.items.length + ' 条' : '待更新'} ${ZH.icon('chevR')}</span></a>
      ${news ? `
      <div class="mt-8">
        ${news.items.slice(0, 3).map(n => `
        <a class="news-item" href="${U.esc(n.url)}" target="_blank" rel="noopener">
          <div class="news-t">${U.esc(n.title)}</div>
          <div class="news-src">${U.esc(n.source || '')} ${ZH.icon('chevR')}</div>
        </a>`).join('')}
      </div>
      <a class="btn btn-soft btn-sm btn-block mt-8" href="#/news">查看全部</a>` : `
      <div class="empty" style="padding:12px 0"><span class="em">🌱</span>今天的新闻还没有生成<br>每天早上 8 点会自动更新</div>`}
    </section>
    </div>`;

    root.querySelector('[data-act="add-exp"]').addEventListener('click', () => ZH.moneySheet());
  }

  function entryHtml(e) {
    if (e.type === 'save') {
      return `<div class="row"><div class="row-ic" style="background:var(--honey-100);color:#A66B14">${ZH.icon('target')}</div>
        <div class="row-t"><div class="row-tt">存钱</div><div class="row-ts">${U.esc(e.note || '又存下了一笔')}</div></div>
        <b class="num" style="color:#A66B14">+${U.money(e.amount)}</b></div>`;
    }
    const cat = ZH.CATS.find(c => c.id === e.cat) || ZH.CATS[6];
    return `<div class="row"><div class="row-ic" style="font-size:18px">${cat.em}</div>
      <div class="row-t"><div class="row-tt">${U.esc(e.note || cat.name)}</div><div class="row-ts">${cat.name}</div></div>
      <b class="num">-${U.money(e.amount)}</b></div>`;
  }

  ZH._entryHtml = entryHtml;
  render();
};

/* ---------- 记一笔（数字键盘 + 分类点选即保存） ---------- */
ZH.moneySheet = function () {
  const U = ZH.U;
  let amount = '';

  const s = ZH.UI.sheet({
    title: '记一笔',
    body: b => {
      b.innerHTML = `
      <div class="pay-amt" aria-live="polite"><span class="rmb">¥</span><span class="num" id="p-amt" lang="en">0</span></div>
      <input class="input" id="p-note" placeholder="备注（可选，比如：午饭）" maxlength="30" autocomplete="off">
      <div class="keypad" id="p-keys">
        ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k =>
          `<button class="key ${k === 'del' ? 'key-del' : ''}" data-k="${k}" aria-label="${k === 'del' ? '删除' : k}">${k === 'del' ? ZH.icon('trash') : k}</button>`).join('')}
      </div>
      <div class="cat-grid" id="p-cats">
        ${ZH.CATS.map(c =>
          `<button class="cat-tile" data-cat="${c.id}"><span class="cat-em">${c.em}</span><span class="cat-t">${c.name}</span></button>`).join('')}
        <button class="cat-tile cat-save" data-cat="__save"><span class="cat-em">💰</span><span class="cat-t">存钱</span></button>
      </div>
      <p class="tagline" style="text-align:center;margin-top:10px">点金额打数字，点分类直接入账</p>`;

      function refresh() {
        b.querySelector('#p-amt').textContent = amount || '0';
      }
      b.querySelectorAll('[data-k]').forEach(k => {
        k.addEventListener('click', () => {
          const key = k.dataset.k;
          if (key === 'del') amount = amount.slice(0, -1);
          else if (key === '.') { if (!amount.includes('.')) amount = (amount || '0') + '.'; }
          else {
            if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
            if (amount.replace('.', '').length >= 7) return;
            amount = (amount === '0' ? '' : amount) + key;
          }
          refresh();
        });
      });

      b.querySelectorAll('[data-cat]').forEach(c => {
        c.addEventListener('click', () => {
          const value = Math.round(parseFloat(amount) * 100) / 100;
          if (!value || value <= 0) return ZH.UI.toast('先输入金额');
          const isSave = c.dataset.cat === '__save';
          const m = ZH.M.money();
          m.entries.push({
            id: U.uid(), date: U.today(), amount: value,
            cat: isSave ? null : c.dataset.cat,
            note: b.querySelector('#p-note').value.trim(),
            type: isSave ? 'save' : 'exp'
          });
          ZH.M.saveMoney(m);
          s.close();
          const catName = isSave ? '存钱' : ZH.CATS.find(x => x.id === c.dataset.cat).name;
          ZH.UI.toast('已记：' + catName + ' ' + U.money(value));
          if (['#/life', '#/money'].includes(location.hash)) ZH.renderRoute();
        });
      });
    }
  });
};

/* ---------- 账本 ---------- */
ZH.views.money = function (root) {
  const U = ZH.U, M = ZH.M;
  let mk = U.monthKey();

  function render() {
    const entries = M.moneyMonth(mk).slice().reverse();
    const exp = entries.filter(e => e.type !== 'save');
    const spent = exp.reduce((a, b) => a + b.amount, 0);
    const saved = entries.filter(e => e.type === 'save').reduce((a, b) => a + b.amount, 0);
    const goal = M.settings().savingGoal || 0;
    const byCat = {};
    exp.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + e.amount; });
    const maxCat = Math.max(1, ...Object.values(byCat));

    const groups = {};
    entries.forEach(e => { (groups[e.date] = groups[e.date] || []).push(e); });
    const days = Object.keys(groups).sort().reverse();

    const [y, mo] = mk.split('-');
    const prev = mo === '01' ? (Number(y) - 1) + '-12' : y + '-' + U.pad(Number(mo) - 1);
    const next = mo === '12' ? (Number(y) + 1) + '-01' : y + '-' + U.pad(Number(mo) + 1);

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">账本</div>
      <div class="page-sub">记账和存钱，都算数</div>
    </div>
    <div class="flex rise" style="gap:8px;margin:6px 0 12px">
      <button class="icon-btn" data-act="prev" aria-label="上月">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>'}</button>
      <div style="flex:1;text-align:center;font-weight:700" class="num">${y} 年 ${Number(mo)} 月</div>
      <button class="icon-btn" data-act="next" aria-label="下月">${ZH.icon('chevR')}</button>
    </div>
    <div class="card">
      <div class="stat-grid">
        <div class="stat"><div class="stat-num num">${spent % 1 ? spent.toFixed(1) : spent}<small>元</small></div><div class="stat-label">本月支出</div></div>
        <div class="stat"><div class="stat-num num">${saved % 1 ? saved.toFixed(1) : saved}<small>元</small></div><div class="stat-label">本月存下</div></div>
        <div class="stat"><div class="stat-num num">${spent && saved ? Math.round(saved / spent * 100) : 0}<small>%</small></div><div class="stat-label">存花比</div></div>
      </div>
      <div class="mt-16">
        <div class="bar-lbl"><span>存钱目标 ${U.money(goal)}</span><span class="num">${U.money(saved)}</span></div>
        <div class="bar honey"><i style="width:${goal ? Math.min(100, Math.round(saved / goal * 100)) : 0}%"></i></div>
      </div>
      <div class="mt-16">
        ${ZH.CATS.filter(c => byCat[c.id]).map(c => `
        <div class="flex" style="margin-bottom:8px">
          <span class="small dim" style="width:68px;flex:none">${c.em} ${c.name}</span>
          <span class="bar" style="flex:1;height:8px"><i style="width:${Math.round(byCat[c.id] / maxCat * 100)}%"></i></span>
          <span class="small dim num" style="width:60px;text-align:right;flex:none">${U.money(byCat[c.id])}</span>
        </div>`).join('') || '<div class="empty" style="padding:8px 0">本月还没有支出</div>'}
      </div>
      <div class="flex mt-12" style="gap:8px">
        <button class="btn btn-primary grow" data-act="add-exp">${ZH.icon('plus')}记一笔</button>
      </div>
    </div>
    ${days.map(d => `
      <div class="sec-title">${U.fmtCNWithWeek(d)}<span class="more">${U.money(groups[d].filter(e => e.type !== 'save').reduce((a, b) => a + b.amount, 0))}</span></div>
      ${groups[d].map(e => `
      <div class="card" style="padding:6px 18px">
        <div class="row">${ZH._entryHtml(e).replace('<div class="row">', '')}</div>
      </div>`).join('')}`).join('') ||
      '<div class="card"><div class="empty">这个月还没有记录</div></div>'}`;

    root.querySelector('[data-act="prev"]').addEventListener('click', () => { mk = prev; render(); });
    root.querySelector('[data-act="next"]').addEventListener('click', () => { mk = next; render(); });
    root.querySelector('[data-act="add-exp"]').addEventListener('click', () => ZH.moneySheet());
  }

  render();
};

/* ---------- 日记 ---------- */
ZH.views.diary = function (root) {
  const U = ZH.U, M = ZH.M;
  const today = U.today();

  function render() {
    const d = M.diary();
    const cur = d.entries.find(x => x.date === today);
    const history = d.entries.filter(x => x.date !== today).sort((a, b) => b.date < a.date ? -1 : 1);

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">日记</div>
      <div class="page-sub">${U.fmtCNWithWeek(today)} · 睡前写几句，给今天留个底</div>
    </div>
    <div class="card rise">
      <div class="field"><label class="field-label">今天的心情</label>
        <div class="chip-row" id="d-mood">${ZH.MOODS.map(m =>
          `<button class="chip ${cur && cur.mood === m.id ? 'active' : ''}" data-mood="${m.id}">${m.em} ${m.name}</button>`).join('')}</div></div>
      <div class="field" style="margin-bottom:0"><label class="field-label">今天发生了什么</label>
        <textarea class="textarea" id="d-text" style="min-height:160px" placeholder="随便写，不用给谁看">${U.esc(cur ? cur.text : '')}</textarea></div>
      <button class="btn btn-primary btn-block mt-12" data-act="save">${cur ? '更新今天的日记' : '保存今天的日记'}</button>
    </div>
    ${history.length ? `
    <div class="sec-title">往日日记<span class="more">${history.length} 篇</span></div>
    ${history.map(h => {
      const mood = h.mood ? (ZH.MOODS.find(m => m.id === h.mood) || {}).em + ' ' : '';
      return `
      <div class="card" style="padding:14px 18px">
        <div class="flex-between">
          <b style="font-size:14px">${U.fmtCNWithWeek(h.date)}</b>
          <span class="tagline">${mood}${U.timeHM(h.ts)}</span>
        </div>
        <div class="row-ts mt-8" style="color:var(--ink);white-space:pre-wrap;word-break:break-word">${U.esc(h.text)}</div>
      </div>`;
    }).join('')}` : ''}`;

    let mood = cur ? cur.mood || null : null;
    root.querySelectorAll('[data-mood]').forEach(c => {
      c.addEventListener('click', () => {
        mood = c.dataset.mood;
        root.querySelectorAll('[data-mood]').forEach(x => x.classList.toggle('active', x === c));
      });
    });
    root.querySelector('[data-act="save"]').addEventListener('click', () => {
      const text = root.querySelector('#d-text').value.trim();
      if (!text && !mood) return ZH.UI.toast('写点什么再保存吧');
      const d = M.diary();
      const exist = d.entries.find(x => x.date === today);
      if (exist) {
        exist.text = text;
        exist.mood = mood;
        exist.ts = Date.now();
      } else {
        d.entries.push({ id: U.uid(), date: today, ts: Date.now(), text, mood });
      }
      if (d.entries.length > 1000) d.entries = d.entries.slice(-1000);
      M.saveDiary(d);
      ZH.UI.toast('日记已保存，晚安');
      render();
    });
  }

  render();
};

/* ---------- 每日复盘 ---------- */
ZH.views.review = function (root) {
  const U = ZH.U, M = ZH.M;
  const today = U.today();
  const SCREEN = ['几乎没刷', '30 分钟', '1 小时', '2 小时', '3 小时以上'];

  function render() {
    const all = M.reviews();
    const rv = all[today];
    const history = Object.keys(all).filter(d => d !== today).sort().reverse();

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">今日复盘</div>
      <div class="page-sub">${U.fmtCNWithWeek(today)} · 三个问题，两分钟</div>
    </div>
    <div class="card rise">
      <div class="field"><label class="field-label">今天完成了什么</label>
        <textarea class="textarea" id="r-done" placeholder="哪怕只背了 30 个单词，也值得写下来">${U.esc(rv ? rv.done : '')}</textarea></div>
      <div class="field"><label class="field-label">今天刷了多久手机</label>
        <div class="chip-row" id="r-screen">${SCREEN.map((s, i) =>
          `<button class="chip ${rv && rv.screen === i ? 'active' : ''}" data-i="${i}">${s}</button>`).join('')}</div></div>
      <div class="field"><label class="field-label">明天最重要的一件事</label>
        <input class="input" id="r-tomorrow" placeholder="只写一件" maxlength="40" value="${U.esc(rv ? rv.tomorrow || '' : '')}"></div>
      <div class="field"><label class="field-label">自由总结（可选）</label>
        <textarea class="textarea" id="r-free" placeholder="想说点什么都可以">${U.esc(rv ? rv.free || '' : '')}</textarea></div>
      <button class="btn btn-primary btn-block" data-act="save">保存今日复盘</button>
    </div>
    ${history.length ? `
    <div class="sec-title">历史复盘<span class="more">${history.length} 天</span></div>
    ${history.slice(0, 30).map(d => `
      <div class="card" style="padding:14px 18px">
        <div class="flex-between">
          <b style="font-size:14px">${U.fmtCNWithWeek(d)}</b>
          <span class="tagline">${SCREEN[all[d].screen] || ''}</span>
        </div>
        ${all[d].tomorrow ? `<div class="row-ts mt-8" style="color:var(--ink)">明天：${U.esc(all[d].tomorrow)}</div>` : ''}
        ${all[d].done ? `<div class="row-ts mt-8">${U.esc(all[d].done)}</div>` : ''}
      </div>`).join('')}` : ''}`;

    let screen = rv ? (rv.screen === undefined ? 1 : rv.screen) : 1;
    root.querySelectorAll('#r-screen .chip').forEach(c => {
      c.addEventListener('click', () => {
        screen = Number(c.dataset.i);
        root.querySelectorAll('#r-screen .chip').forEach(x => x.classList.toggle('active', x === c));
      });
    });
    root.querySelector('[data-act="save"]').addEventListener('click', () => {
      const r = M.reviews();
      r[today] = {
        done: root.querySelector('#r-done').value.trim(),
        tomorrow: root.querySelector('#r-tomorrow').value.trim(),
        free: root.querySelector('#r-free').value.trim(),
        screen
      };
      M.saveReviews(r);
      ZH.UI.toast('复盘已保存，今天可以安心休息了');
      render();
    });
  }

  render();
};

/* ---------- 普通话与表达 ---------- */
ZH.mandarinMaterial = function (pick) {
  const md = ZH.Data.mandarin;
  if (!md) return null;
  const day = Math.floor(Date.now() / 86400000);
  const idx = pick !== undefined ? pick : day;
  if (idx % 2 === 0 && md.twisters && md.twisters.length) {
    const t = md.twisters[idx % md.twisters.length];
    return { title: '绕口令 · ' + t.t, text: t.text, tip: t.tip || '先慢后快，读三遍，最后录一遍回放听' };
  }
  if (md.passages && md.passages.length) {
    const p = md.passages[idx % md.passages.length];
    return { title: '朗读 · ' + p.title, text: p.text, tip: p.tip || '出声朗读两遍，注意字音饱满' };
  }
  return null;
};

ZH.views.mandarin = function (root) {
  const U = ZH.U, M = ZH.M;
  const today = U.today();
  let pick;

  function render() {
    const m = M.mandarin();
    const done = (m.done || []).includes(today);
    const streak = ZH.calcStreak(m.done || []);
    const mat = ZH.mandarinMaterial(pick);
    const recent = (m.done || []).slice(-14);
    const last14 = [];
    for (let i = 13; i >= 0; i--) last14.push(U.addDays(today, -i));

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">普通话 · 表达</div>
      <div class="page-sub">${ZH.icon('flame')} 连续 ${streak} 天 · 绕口令和短文每天轮换</div>
    </div>
    ${mat ? `
    <div class="card rise">
      <div class="card-title">${ZH.icon('mic')}${U.esc(mat.title)}</div>
      <div class="card-soft mt-12">
        <div style="font-size:15px;line-height:2.2;color:var(--ink)">${U.esc(mat.text)}</div>
        ${mat.tip ? `<div class="tagline mt-12">${U.esc(mat.tip)}</div>` : ''}
      </div>
      <button class="btn ${done ? 'btn-soft' : 'btn-primary'} btn-block mt-12" data-act="check">${done ? '今天已打卡 ✓' : '练完了，打卡'}</button>
      <button class="btn btn-ghost btn-block btn-sm mt-8" data-act="change">换一个素材</button>
    </div>
    <div class="card">
      <div class="card-title">最近两周</div>
      <div class="flex mt-12" style="gap:6px;flex-wrap:wrap">
        ${last14.map(d => {
          const on = recent.includes(d);
          return `<span title="${d}" style="width:22px;height:22px;border-radius:7px;background:${on ? 'var(--rose-700)' : 'var(--rose-100)'};display:inline-block"></span>`;
        }).join('')}
      </div>
      <div class="tagline mt-12">绿格子代表打卡的日子</div>
    </div>` : '<div class="card"><div class="empty">素材加载失败，请联网后重试</div></div>'}`;

    root.querySelector('[data-act="check"]').addEventListener('click', () => {
      const mm = M.mandarin();
      mm.done = mm.done || [];
      if (!mm.done.includes(today)) {
        mm.done.push(today);
        M.saveMandarin(mm);
        ZH.UI.chime();
      }
      render();
    });
    const ch = root.querySelector('[data-act="change"]');
    if (ch) ch.addEventListener('click', () => {
      pick = Math.floor(Math.random() * 100);
      render();
    });
  }

  render();
};

/* ---------- AI 日报（独立 Tab） ---------- */
ZH.views.news = function (root) {
  const U = ZH.U;
  const news = ZH.Data.news;
  root.innerHTML = `
  <div class="page-head rise">
    <div class="page-title">AI 日报</div>
    <div class="page-sub">${news ? U.fmtCNWithWeek(news.date) + ' · ' + news.items.length + ' 条' : '每天早上 8 点更新'}</div>
  </div>
  <div class="stagger">
  ${news ? news.items.map(n => `
    <a class="card" href="${U.esc(n.url)}" target="_blank" rel="noopener" style="display:block">
      <div class="news-t" style="font-size:16px">${U.esc(n.title)}</div>
      <div class="news-s">${U.esc(n.summary || '')}</div>
      <div class="news-src">${U.esc(n.source || '')} · 打开原文 ${ZH.icon('chevR')}</div>
    </a>`).join('') :
    '<div class="card"><div class="empty"><span class="em">🌱</span>今天还没有新闻<br>由每天早上 8 点的定时任务自动生成</div></div>'}
  <div class="card">
    <div class="small dim" style="line-height:1.9">新闻由 AI 每天早上 8 点检索汇总，聚焦大模型与 AI 行业动态。想调整方向，随时跟 AI 助手说。</div>
  </div>
  </div>`;
};
