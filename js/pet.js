/* 知知 · 桌宠（小暑星屑 · 一笔线稿猫）
   住在首页右下角，可拖动；随连续专注天数成长 */

ZH.Pet = (function () {
  const STROKE = '#B25577';
  const INK = '#4B3A45';
  const DIM = '#B7A4AF';
  const BLUSH = '#F3B9CC';

  const LINES = [
    '今天也要慢慢来呀',
    '勾掉一条待办，轻松一点了吧',
    '你比昨天又多坚持了一天',
    '摸摸头，继续加油',
    '别忘了喝水～',
    '单词背完了吗？我陪你去',
    '专注的时光过得最快',
    '我就在这儿，不吵你',
    '晚上写日记的时候叫我',
    '一步一步来，不着急',
    '今天的天空是什么颜色？',
    '你认真的时候最好看了',
    '坐直一点，眼睛休息下',
    '完成了的事，都算数',
    '再坚持一下下就好',
    '我去帮你盯着时间',
    '今天的你也很努力了',
    '累的话，歇一会儿也没关系',
    '我想看看你长大以后的样子',
    '知禾知禾，慢慢生长'
  ];

  function eyes(kind) {
    if (kind === 'happy') return '<path d="M34 56 q4 -4.5 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M54 56 q4 -4.5 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (kind === 'sleepy') return '<path d="M34 56 q4 3.5 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M54 56 q4 3.5 8 0" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return '<circle cx="38.5" cy="56" r="2.6" fill="' + INK + '"/><circle cx="57.5" cy="56" r="2.6" fill="' + INK + '"/>';
  }

  function mouth(kind) {
    if (kind === 'happy') return '<path d="M43 63 Q48 70 53 63 Z" fill="' + STROKE + '"/>';
    if (kind === 'sleepy') return '<path d="M45 64 q3 2.5 6 0" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="74" y="30" font-size="13" font-weight="700" fill="' + DIM + '" font-family="Georgia,serif">z</text><text x="84" y="18" font-size="9" font-weight="700" fill="' + DIM + '" font-family="Georgia,serif">z</text>';
    return '<path d="M44 63 Q48 67.5 52 63" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  }

  /* 成长配件：0 无 / 1 叶 / 2 花 / 3 花+星 */
  function accessory(stage) {
    let s = '';
    if (stage >= 1) {
      s += '<path d="M30 30 C28 22 34 16 40 17 C40 24 36 29 30 30 Z" fill="none" stroke="' + STROKE + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M31 29 C33 25 36 22 39 19" stroke="' + STROKE + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    }
    if (stage >= 2) {
      s += '<g><circle cx="58" cy="20" r="4" fill="' + STROKE + '"/>' +
        [0, 72, 144, 216, 288].map(a => {
          const rad = a * Math.PI / 180;
          const x = 58 + Math.cos(rad) * 8.5, y = 20 + Math.sin(rad) * 8.5;
          return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.2" fill="none" stroke="' + STROKE + '" stroke-width="1.8"/>';
        }).join('') + '</g>';
    }
    if (stage >= 3) {
      s += '<path d="M20 40 l1.2 3.2 3.2 1.2 -3.2 1.2 -1.2 3.2 -1.2 -3.2 -3.2 -1.2 3.2 -1.2 Z" fill="' + DIM + '"/>' +
        '<path d="M84 48 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 Z" fill="' + DIM + '"/>';
    }
    return s;
  }

  function svg(state, stage) {
    const kind = state === 'cheer' ? 'happy' : state;
    return '<svg viewBox="0 0 96 96">' +
      '<g fill="none" stroke="' + STROKE + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M30 38 L26 18 L44 28"/>' +
      '<path d="M66 38 L70 18 L52 28"/>' +
      '<circle cx="48" cy="58" r="25"/>' +
      '<path d="M22 53 L13 50 M22 62 L14 65"/>' +
      '<path d="M74 53 L83 50 M74 62 L82 65"/>' +
      '</g>' +
      accessory(stage) +
      eyes(kind) + mouth(kind) +
      '<circle cx="33" cy="61.5" r="2.7" fill="' + BLUSH + '" opacity=".85"/>' +
      '<circle cx="63" cy="61.5" r="2.7" fill="' + BLUSH + '" opacity=".85"/>' +
      '</svg>';
  }

  function stageByStreak(streak) {
    if (streak >= 49) return 3;
    if (streak >= 21) return 2;
    if (streak >= 7) return 1;
    return 0;
  }

  const STAGE_NAMES = ['新芽', '一叶', '开花', '生辉'];

  let el = null, bubble = null, revertTimer = null, bubbleTimer = null;

  function baseState() {
    const h = new Date().getHours();
    return (h >= 22 || h < 6) ? 'sleepy' : 'normal';
  }

  function say(msg) {
    if (!bubble) return;
    bubble.textContent = msg;
    const r = el.getBoundingClientRect();
    bubble.style.left = Math.max(8, Math.min(window.innerWidth - 208, r.left - 60)) + 'px';
    bubble.style.top = Math.max(8, r.top - 46) + 'px';
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble && bubble.classList.remove('show'), 2600);
  }

  function setState(st) {
    if (!el) return;
    const streak = (ZH.M && ZH.M.focusStreak) ? ZH.M.focusStreak() : 0;
    el.querySelector('.pet-anim').innerHTML = svg(st, stageByStreak(streak));
  }

  function mount() {
    if (el) return cleanup;
    const s = ZH.M ? ZH.M.settings() : {};
    if (s.petOn === false) return null;

    el = document.createElement('div');
    el.className = 'pet-fab';
    el.setAttribute('aria-label', '桌宠知知，可以摸摸或拖动');
    const inner = document.createElement('div');
    inner.className = 'pet-anim';
    el.appendChild(inner);
    bubble = document.createElement('div');
    bubble.className = 'pet-bubble';
    bubble.setAttribute('role', 'status');

    const saved = ZH.Store.get('petPos', null);
    const size = 64;
    const x = saved ? ZH.U.clamp(saved.x, 0, window.innerWidth - size) : window.innerWidth - size - 16;
    const y = saved ? ZH.U.clamp(saved.y, 0, window.innerHeight - size - 70) : window.innerHeight - size - 100;
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    document.body.appendChild(el);
    document.body.appendChild(bubble);
    el.classList.add('show');
    setState(baseState());

    /* 拖拽 + 点按 */
    let downX = 0, downY = 0, moved = false, downTs = 0;
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      downX = e.clientX; downY = e.clientY; moved = false; downTs = Date.now();
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!el.classList.contains('dragging')) return;
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
      if (!moved) return;
      const r = el.getBoundingClientRect();
      const nx = ZH.U.clamp(r.left + dx, 4, window.innerWidth - r.width - 4);
      const ny = ZH.U.clamp(r.top + dy, 4, window.innerHeight - r.height - 64);
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
      downX = e.clientX; downY = e.clientY;
    });
    el.addEventListener('pointerup', () => {
      el.classList.remove('dragging');
      if (moved) {
        const r = el.getBoundingClientRect();
        ZH.Store.set('petPos', { x: r.left, y: r.top });
      } else if (Date.now() - downTs < 500) {
        setState('happy');
        clearTimeout(revertTimer);
        revertTimer = setTimeout(() => setState(baseState()), 2400);
        say(LINES[Math.floor(Math.random() * LINES.length)]);
      }
    });
    el.addEventListener('pointercancel', () => el.classList.remove('dragging'));

    return cleanup;
  }

  function cleanup() {
    clearTimeout(revertTimer);
    clearTimeout(bubbleTimer);
    if (el) { el.remove(); el = null; }
    if (bubble) { bubble.remove(); bubble = null; }
  }

  /* 供外部触发的反应 */
  function cheer() {
    if (!el) return;
    setState('happy');
    el.classList.add('cheering');
    clearTimeout(revertTimer);
    revertTimer = setTimeout(() => {
      el.classList.remove('cheering');
      setState(baseState());
    }, 1300);
  }

  function growthInfo() {
    const streak = (ZH.M && ZH.M.focusStreak) ? ZH.M.focusStreak() : 0;
    const stage = stageByStreak(streak);
    const next = stage < 3 ? [7, 21, 49][stage] : null;
    return { streak, stage, name: STAGE_NAMES[stage], next };
  }

  return { mount, cleanup, cheer, say, growthInfo, svg, STAGE_NAMES };
})();
