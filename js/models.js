ZH.M = {
  settings() {
    return Object.assign({ examDate: '2026-12-12', wordsDaily: 30, savingGoal: 1500, petOn: true }, ZH.Store.get('settings', {}));
  },
  saveSettings(s) { ZH.Store.set('settings', s); },

  todos() { return ZH.Store.get('todos', []); },
  saveTodos(t) { ZH.Store.set('todos', t); },
  todosToday() {
    const d = ZH.U.today();
    return this.todos().filter(t => t.date === d);
  },

  focus() { return ZH.Store.get('focus', { sessions: [] }); },
  saveFocus(f) { ZH.Store.set('focus', f); },
  focusToday() {
    const d = ZH.U.today();
    const s = this.focus().sessions.filter(x => x.date === d && x.completed);
    return { count: s.length, minutes: s.reduce((a, b) => a + b.minutes, 0) };
  },
  focusStreak() {
    const dates = [...new Set(this.focus().sessions.filter(x => x.completed).map(x => x.date))];
    return ZH.calcStreak(dates);
  },
  addFocusSession(minutes) {
    const f = this.focus();
    f.sessions.push({ id: ZH.U.uid(), date: ZH.U.today(), startTs: Date.now() - minutes * 60000, minutes, completed: true });
    if (f.sessions.length > 3000) f.sessions = f.sessions.slice(-3000);
    this.saveFocus(f);
  },

  scroll() { return ZH.Store.get('scrollTime', {}); },
  scrollToday() { return this.scroll()[ZH.U.today()] || 0; },
  addScroll(min) {
    const s = this.scroll();
    const d = ZH.U.today();
    s[d] = (s[d] || 0) + min;
    ZH.Store.set('scrollTime', s);
  },

  diary() { return ZH.Store.get('diary', { entries: [] }); },
  saveDiary(d) { ZH.Store.set('diary', d); },

  words() { return ZH.Store.get('words', { progress: {}, streak: 0, lastCheckin: null, session: null }); },
  saveWords(w) { ZH.Store.set('words', w); },
  wordsToday() {
    const w = this.words();
    const today = ZH.U.today();
    if (w.session && w.session.date === today) {
      return { done: w.session.pos, total: w.session.queue.length, finished: w.session.pos >= w.session.queue.length };
    }
    let due = 0;
    Object.values(w.progress).forEach(p => { if (p.due <= today) due++; });
    const target = this.settings().wordsDaily;
    return { done: 0, total: due + target, finished: false };
  },

  money() { return ZH.Store.get('money', { entries: [], goal: {} }); },
  saveMoney(m) { ZH.Store.set('money', m); },
  moneyMonth(mk) { return this.money().entries.filter(e => (e.date || '').startsWith(mk)); },

  reviews() { return ZH.Store.get('reviews', {}); },
  saveReviews(r) { ZH.Store.set('reviews', r); },

  mandarin() { return ZH.Store.get('mandarin', { done: [] }); },
  saveMandarin(m) { ZH.Store.set('mandarin', m); },

  moviesData() { return ZH.Store.get('movies', { watched: [], watchlist: [] }); },
  saveMovies(m) { ZH.Store.set('movies', m); },

  lessons() { return ZH.Store.get('lessonPlans', {}); },
  saveLessons(l) { ZH.Store.set('lessonPlans', l); },
  lessonsToday() {
    const sch = ZH.Data.schedule;
    const out = [];
    if (sch && sch.weekdays) {
      const wd = ZH.U.weekday();
      (sch.weekdays[wd] || []).forEach(c => {
        const items = this.lessons()[c.id] || [];
        items.forEach(it => out.push(it));
      });
    }
    return out;
  },

  english() { return ZH.Store.get('englishProgress', {}); },
  saveEnglish(e) { ZH.Store.set('englishProgress', e); }
};
