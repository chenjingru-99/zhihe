/* 路由与应用入口 */

ZH.TABS = [
  { id: 'home', label: '首页', icon: 'home', hash: '#/home' },
  { id: 'learn', label: '学习', icon: 'book', hash: '#/learn' },
  { id: 'life', label: '生活', icon: 'sun', hash: '#/life' },
  { id: 'media', label: '影音', icon: 'film', hash: '#/movies' },
  { id: 'me', label: '我的', icon: 'user', hash: '#/me' }
];

ZH.ROUTES = {
  home: { view: 'home', tab: 'home' },
  focus: { view: 'focus', tab: 'home', full: true },
  review: { view: 'review', tab: 'home' },
  learn: { view: 'learn', tab: 'learn' },
  session: { view: 'session', tab: 'learn', full: true },
  schedule: { view: 'schedule', tab: 'learn' },
  english: { view: 'english', tab: 'learn' },
  mandarin: { view: 'mandarin', tab: 'learn' },
  life: { view: 'life', tab: 'life' },
  money: { view: 'money', tab: 'life' },
  diary: { view: 'diary', tab: 'life' },
  news: { view: 'news', tab: 'life' },
  movies: { view: 'movies', tab: 'media' },
  me: { view: 'me', tab: 'me' }
};

ZH.renderRoute = function () {
  const name = (location.hash || '#/home').replace(/^#\//, '').split('?')[0] || 'home';
  const r = ZH.ROUTES[name] || ZH.ROUTES.home;
  document.body.dataset.view = name;
  if (ZH._cleanup) { try { ZH._cleanup(); } catch (e) { } ZH._cleanup = null; }
  const root = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');
  root.className = r.full ? 'fullscreen' : '';
  tabbar.style.display = r.full ? 'none' : '';
  ZH.TABS.forEach(t => {
    const el = tabbar.querySelector('[data-tab="' + t.id + '"]');
    if (el) el.classList.toggle('active', t.id === r.tab);
  });
  window.scrollTo(0, 0);
  const view = ZH.views[r.view];
  if (view) ZH._cleanup = view(root) || null;
};

async function loadJson(url) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

async function loadNews() {
  const U = ZH.U;
  for (let i = 0; i < 5; i++) {
    const d = U.addDays(U.today(), -i);
    const n = await loadJson('data/news/' + d + '.json');
    if (n && n.length) {
      ZH.Data.news = { date: d, items: n };
      ZH.Store.set('newsCache', ZH.Data.news);
      return;
    }
  }
  ZH.Data.news = ZH.Store.get('newsCache', null);
}

async function boot() {
  const tabbar = document.getElementById('tabbar');
  tabbar.innerHTML = ZH.TABS.map(t =>
    '<a class="tab" data-tab="' + t.id + '" href="' + t.hash + '" aria-label="' + t.label + '">' +
    ZH.icon(t.icon) + '<span>' + t.label + '</span></a>').join('');

  await Promise.all([
    loadJson('data/schedule.json').then(d => { ZH.Data.schedule = d; }),
    loadJson('data/english-plan.json').then(d => { ZH.Data.englishPlan = d; }),
    loadJson('data/mandarin.json').then(d => { ZH.Data.mandarin = d; }),
    loadJson('data/movies.json').then(d => { ZH.Data.movies = d; }),
    loadNews()
  ]);

  window.addEventListener('hashchange', ZH.renderRoute);
  ZH.renderRoute();

  if ('serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
}

document.addEventListener('DOMContentLoaded', boot);
