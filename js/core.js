window.ZH = { views: {}, Data: {} };

/* ---------- 本地存储 ---------- */
ZH.Store = {
  NS: 'zhihe.v1.',
  get(key, def) {
    try {
      const v = localStorage.getItem(this.NS + key);
      if (v === null) return def;
      return JSON.parse(v);
    } catch (e) {
      return def;
    }
  },
  set(key, val) {
    try { localStorage.setItem(this.NS + key, JSON.stringify(val)); } catch (e) { }
  },
  keys() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.NS)) out.push(k.slice(this.NS.length));
    }
    return out;
  },
  exportAll() {
    const obj = {};
    this.keys().forEach(k => { obj[k] = this.get(k); });
    return obj;
  },
  importAll(obj) {
    Object.keys(obj || {}).forEach(k => this.set(k, obj[k]));
  }
};

/* ---------- 工具 ---------- */
ZH.U = {
  pad(n) { return n < 10 ? '0' + n : '' + n; },
  dateKey(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + this.pad(t.getMonth() + 1) + '-' + this.pad(t.getDate());
  },
  today() { return this.dateKey(new Date()); },
  fromKey(k) {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
  },
  addDays(key, n) {
    const d = this.fromKey(key);
    d.setDate(d.getDate() + n);
    return this.dateKey(d);
  },
  daysBetween(a, b) {
    return Math.round((this.fromKey(b) - this.fromKey(a)) / 86400000);
  },
  weekday(d) { const t = d || new Date(); return t.getDay() === 0 ? 7 : t.getDay(); },
  WEEK_CN: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  fmtCN(key) {
    const d = this.fromKey(key);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  },
  fmtCNWithWeek(key) {
    return this.fmtCN(key) + ' ' + this.WEEK_CN[this.weekday(this.fromKey(key)) - 1];
  },
  monthKey(key) { return (key || this.today()).slice(0, 7); },
  greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 13) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  },
  timeHM(ts) {
    const t = new Date(ts);
    return this.pad(t.getHours()) + ':' + this.pad(t.getMinutes());
  },
  esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
  money(n) {
    const v = Number(n) || 0;
    return '¥' + (Number.isInteger(v) ? v : v.toFixed(2));
  },
  clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
};

/* ---------- 图标 ---------- */
ZH.I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c1.4-3.4 4.3-5 7.5-5s6.1 1.6 7.5 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  chevD: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5"/><path d="M10 11v6M14 11v6"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.5 8.5a2.12 2.12 0 0 0-3-3L5 17z"/><path d="m13.5 6.5 3 3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10.5h18M16.5 15h1.5"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 9.5h8M8 13h8M8 16.5h5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 8l5-5 5 5M5 20h14"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 3.5h10V21l-5-4-5 4z"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5h4"/><circle cx="12" cy="14" r="8"/><path d="M12 14v-4"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 18.5C5 11 10 5.5 19.5 4.5c.5 9-4 14-12.5 14z"/><path d="M5.5 18.5C7.5 13 10.5 10 15.5 8"/></svg>'
};
ZH.icon = n => ZH.I[n] || '';

/* ---------- UI 组件 ---------- */
ZH.UI = {
  toast(msg) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2200);
  },
  sheet(opts) {
    const mask = document.createElement('div');
    mask.className = 'sheet-mask';
    const sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.innerHTML = '<div class="sheet-grip"></div>' +
      (opts.title ? '<div class="sheet-title"><span>' + ZH.U.esc(opts.title) + '</span></div>' : '') +
      '<div class="sheet-body"></div>';
    document.body.appendChild(mask);
    document.body.appendChild(sheet);
    const close = () => {
      mask.classList.remove('show');
      sheet.classList.remove('show');
      setTimeout(() => { mask.remove(); sheet.remove(); }, 340);
    };
    mask.addEventListener('click', close);
    requestAnimationFrame(() => {
      mask.classList.add('show');
      sheet.classList.add('show');
    });
    const body = sheet.querySelector('.sheet-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (typeof opts.body === 'function') opts.body(body, close);
    return { el: sheet, body, close };
  },
  confirm(title, msg) {
    return new Promise(resolve => {
      const s = ZH.UI.sheet({
        title,
        body: b => {
          b.innerHTML = '<div class="dim" style="font-size:14px">' + ZH.U.esc(msg || '') + '</div>' +
            '<div class="sheet-actions" style="margin-top:18px">' +
            '<button class="btn btn-soft" data-r="0">取消</button>' +
            '<button class="btn btn-primary" data-r="1">确定</button></div>';
          b.querySelectorAll('[data-r]').forEach(btn => {
            btn.addEventListener('click', () => { s.close(); resolve(btn.dataset.r === '1'); });
          });
        }
      });
    });
  },
  chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ZH.UI._ac = ZH.UI._ac || new Ctx();
      const ac = ZH.UI._ac;
      if (ac.state === 'suspended') ac.resume();
      [[523.25, 0], [659.25, .18], [783.99, .36]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(0.18, ac.currentTime + t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.5);
        o.connect(g).connect(ac.destination);
        o.start(ac.currentTime + t);
        o.stop(ac.currentTime + t + 0.55);
      });
    } catch (e) { }
    try { navigator.vibrate && navigator.vibrate([180, 90, 180]); } catch (e) { }
  }
};

/* ---------- 模块状态助手（连击计算） ---------- */
ZH.calcStreak = function (doneDates, today) {
  if (!doneDates || !doneDates.length) return 0;
  const set = new Set(doneDates);
  let d = today || ZH.U.today();
  if (!set.has(d)) d = ZH.U.addDays(d, -1);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = ZH.U.addDays(d, -1);
  }
  return n;
};
