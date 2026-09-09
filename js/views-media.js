/* 影音：电影手账 */

ZH.views.movies = function (root) {
  const U = ZH.U, M = ZH.M;
  const list = (ZH.Data.movies || []);
  const GENRES = ['全部', '剧情', '喜剧', '爱情', '科幻', '动画', '悬疑', '犯罪', '奇幻', '动作', '战争'];
  let tab = 'list';
  let genre = '全部';
  let expandedId = null;

  function stats() {
    const md = M.moviesData();
    const year = U.today().slice(0, 4);
    const thisYear = md.watched.filter(w => (w.date || '').startsWith(year));
    const rated = md.watched.filter(w => w.rating);
    const avg = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length) : 0;
    return { thisYear: thisYear.length, avg, want: md.watchlist.length, total: md.watched.length };
  }

  function render() {
    const st = stats();
    const md = M.moviesData();

    let bodyHtml = '';
    if (tab === 'list') {
      const shown = list.filter(m => genre === '全部' || m.g === genre);
      bodyHtml = `
      <div class="chip-row" style="margin:2px 0 4px">${GENRES.map(g =>
        `<button class="chip ${g === genre ? 'active' : ''}" data-act="genre" data-g="${g}">${g}</button>`).join('')}</div>
      ${shown.map(m => {
        const want = md.watchlist.includes(m.id);
        const seen = md.watched.find(w => w.id === m.id);
        return `
        <div class="card" style="padding:15px 18px">
          <div class="flex-between">
            <div class="grow">
              <div class="row-tt">${U.esc(m.t)} <span class="tagline num">${m.y}</span></div>
              <div class="tagline">${U.esc(m.g)} · ${U.esc(m.c)}</div>
            </div>
            ${seen ? `<span class="chip" style="min-height:28px;padding:0 10px;font-size:11px;background:var(--rose-100);color:var(--rose-700)">已看 ${'★'.repeat(seen.rating || 0)}</span>` : ''}
          </div>
          <div class="movie-pitch mt-8">${U.esc(m.p)}</div>
          <div class="flex mt-12" style="gap:8px">
            ${seen ? `<button class="btn btn-soft btn-sm grow" data-act="watched" data-id="${m.id}">改评分 / 影评</button>` :
              `<button class="btn btn-soft btn-sm grow" data-act="watched" data-id="${m.id}">看过，写影评</button>`}
            <button class="btn ${want ? 'btn-primary' : 'btn-soft'} btn-sm" style="flex:none" data-act="want" data-id="${m.id}">${ZH.icon('bookmark')}${want ? '想看' : '想看'}</button>
          </div>
        </div>`;
      }).join('') || '<div class="card"><div class="empty">这个类型暂时没有片目</div></div>'}`;
    } else {
      bodyHtml = `
      <button class="btn btn-primary btn-block mb-12" data-act="watched" data-id="">${ZH.icon('plus')}记录一部看过的电影</button>
      ${md.watched.length ? md.watched.slice().reverse().map(w => `
        <div class="card" style="padding:15px 18px">
          <div class="flex-between">
            <div class="grow">
              <div class="row-tt">${U.esc(w.title)}</div>
              <div class="tagline">${U.fmtCN(w.date)} · ${w.id ? '来自片单' : '自己记录'}</div>
            </div>
            <div class="stars" aria-label="评分 ${w.rating} 星">${[1, 2, 3, 4, 5].map(i =>
              `<span class="star ${i <= w.rating ? '' : 'off'}">★</span>`).join('')}</div>
          </div>
          ${w.review ? `<div class="movie-pitch mt-8" style="display:${expandedId === w.id ? 'block' : '-webkit-box'}">${U.esc(w.review)}</div>` : ''}
          <div class="flex mt-12" style="gap:8px">
            ${w.review ? `<button class="btn btn-soft btn-sm" data-act="expand" data-id="${w.id}">${expandedId === w.id ? '收起' : '展开影评'}</button>` : ''}
            <button class="btn btn-soft btn-sm" data-act="watched" data-id="${w.id || ''}" data-w="${w.id}">编辑</button>
            <button class="btn btn-danger btn-sm" style="flex:none" data-act="del" data-id="${w.id}">${ZH.icon('trash')}</button>
          </div>
        </div>`).join('') : '<div class="card"><div class="empty"><span class="em">🎬</span>看完一部记一部<br>年底翻出来看会很有意思</div></div>'}`;
    }

    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">电影手账</div>
      <div class="page-sub">看过的都算数</div>
    </div>
    <div class="card rise">
      <div class="stat-grid">
        <div class="stat"><div class="stat-num num">${st.thisYear}</div><div class="stat-label">今年观影</div></div>
        <div class="stat"><div class="stat-num num">${st.avg ? st.avg.toFixed(1) : '—'}</div><div class="stat-label">平均评分</div></div>
        <div class="stat"><div class="stat-num num">${st.want}</div><div class="stat-label">想看清单</div></div>
      </div>
    </div>
    <div class="chip-row rise" style="margin-bottom:12px">
      <button class="chip ${tab === 'list' ? 'active' : ''}" data-act="tab" data-t="list">经典片单</button>
      <button class="chip ${tab === 'mine' ? 'active' : ''}" data-act="tab" data-t="mine">我的观影 · ${st.total}</button>
    </div>
    ${bodyHtml}`;

    root.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('click', async () => {
        const act = el.dataset.act;
        if (act === 'tab') { tab = el.dataset.t; render(); }
        if (act === 'genre') { genre = el.dataset.g; render(); }
        if (act === 'expand') { expandedId = expandedId === el.dataset.id ? null : el.dataset.id; render(); }
        if (act === 'want') {
          const md2 = M.moviesData();
          const i = md2.watchlist.indexOf(el.dataset.id);
          if (i >= 0) md2.watchlist.splice(i, 1);
          else md2.watchlist.push(el.dataset.id);
          M.saveMovies(md2);
          render();
        }
        if (act === 'del') {
          const ok = await ZH.UI.confirm('删除这条观影记录', '删除后无法恢复。');
          if (ok) {
            const md2 = M.moviesData();
            md2.watched = md2.watched.filter(w => w.id !== el.dataset.id);
            M.saveMovies(md2);
            render();
          }
        }
        if (act === 'watched') {
          const editId = el.dataset.id || el.dataset.w;
          movieSheet(editId);
        }
      });
    });
  }

  function movieSheet(editId) {
    const md = M.moviesData();
    const editing = md.watched.find(w => w.id === editId);
    const movie = list.find(m => m.id === editId);
    let rating = editing ? editing.rating : 0;

    const s = ZH.UI.sheet({
      title: editing ? '编辑观影记录' : (movie ? '看完《' + movie.t + '》' : '记录一部电影'),
      body: b => {
        b.innerHTML = `
        ${movie ? `<div class="field"><div class="movie-pitch">${U.esc(movie.p)}</div></div>` :
          `<div class="field"><label class="field-label">片名</label>
          <input class="input" id="mv-title" placeholder="电影名" maxlength="40" value="${U.esc(editing ? editing.title : '')}"></div>`}
        <div class="field"><label class="field-label">评分</label>
          <div class="stars" id="mv-stars" style="font-size:26px;gap:6px">
            ${[1, 2, 3, 4, 5].map(i => `<button class="star ${i <= rating ? '' : 'off'}" data-i="${i}" style="padding:4px" aria-label="${i} 星">★</button>`).join('')}
          </div></div>
        <div class="field"><label class="field-label">影评（现在想到什么就写什么）</label>
          <textarea class="textarea" id="mv-review" placeholder="一句也好，写给自己看的">${U.esc(editing ? editing.review || '' : '')}</textarea></div>
        <button class="btn btn-primary btn-block" id="mv-save">保存</button>`;

        b.querySelectorAll('#mv-stars .star').forEach(st => {
          st.addEventListener('click', () => {
            rating = Number(st.dataset.i);
            b.querySelectorAll('#mv-stars .star').forEach(x => x.classList.toggle('off', Number(x.dataset.i) > rating));
          });
        });
        b.querySelector('#mv-save').addEventListener('click', () => {
          const title = movie ? movie.t : b.querySelector('#mv-title').value.trim();
          if (!title) return ZH.UI.toast('先写片名');
          const md2 = M.moviesData();
          if (editing) {
            editing.rating = rating;
            editing.review = b.querySelector('#mv-review').value.trim();
          } else {
            md2.watched.push({
              id: movie ? movie.id : U.uid() + '-c',
              title, date: U.today(), rating, review: b.querySelector('#mv-review').value.trim()
            });
            const wi = md2.watchlist.indexOf(movie ? movie.id : '');
            if (wi >= 0) md2.watchlist.splice(wi, 1);
          }
          M.saveMovies(md2);
          s.close();
          ZH.UI.toast(movie ? '已记录' : '已保存');
          if (tab === 'mine' || true) render();
        });
      }
    });
  }

  render();
};
