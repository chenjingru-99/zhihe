/* 我的：安装 / 设置 / 备份 */

ZH.views.me = function (root) {
  const U = ZH.U, M = ZH.M;
  const standalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const lastBackup = ZH.Store.get('lastBackup', null);

  function render() {
    const s = M.settings();
    const pet = ZH.Pet.growthInfo();
    const petNext = pet.next ? ' · 再 ' + (pet.next - pet.streak) + ' 天到「' + ZH.Pet.STAGE_NAMES[pet.stage + 1] + '」' : ' · 已完全长大';
    root.innerHTML = `
    <div class="page-head rise">
      <div class="page-title">我的</div>
      <div class="page-sub">知禾工作台 · 你的数据都保存在这台手机上</div>
    </div>
    <div class="stagger">

    <section class="card">
      <div class="card-title">${ZH.icon('leaf')}安装到主屏幕</div>
      ${standalone ? '<div class="empty" style="padding:12px 0;color:var(--rose-700)"><span class="em">🌿</span>已经安装好了，像 App 一样使用</div>' : `
      <div class="card-soft mt-12" style="line-height:2">
        ${isIOS ? `
        <div class="small" style="font-weight:600">iPhone / iPad</div>
        <div class="small dim">1. 用 Safari 打开本页面<br>2. 点底部「分享」按钮<br>3. 选「添加到主屏幕」<br>4. 从主屏幕打开，就是全屏 App</div>` : `
        <div class="small" style="font-weight:600">Android</div>
        <div class="small dim">1. 用 Chrome 打开本页面<br>2. 点右上角「⋮」菜单<br>3. 选「安装应用」或「添加到主屏幕」</div>`}
      </div>
      <p class="focus-note" style="margin-top:12px">安装后数据会更稳定，也能离线打开</p>`}
    </section>

    <section class="card">
      <div class="card-title">${ZH.icon('target')}学习与目标</div>
      <div class="field mt-12"><label class="field-label">四级考试日期（用于倒计时）</label>
        <input class="input num" id="s-exam" type="date" value="${U.esc(s.examDate)}"></div>
      <div class="field"><label class="field-label">每日单词量</label>
        <div class="chip-row">${[20, 30, 50, 80].map(n =>
          `<button class="chip num ${n === s.wordsDaily ? 'active' : ''}" data-act="daily" data-n="${n}" lang="en">${n} 词</button>`).join('')}</div></div>
      <div class="field" style="margin-bottom:0"><label class="field-label">每月存钱目标（元）</label>
        <input class="input num" id="s-goal" type="number" inputmode="numeric" value="${s.savingGoal}" lang="en"></div>
    </section>

    <section class="card">
      <div class="card-title">${ZH.icon('sparkle')}桌宠知知<span class="tail">${pet.name}</span></div>
      <div class="flex mt-12" style="gap:14px">
        <div class="pet-preview">${ZH.Pet.svg('normal', pet.stage)}</div>
        <div class="grow">
          <div class="small" style="font-weight:600">住在首页右下角，随连续专注天数慢慢长大</div>
          <div class="row-ts mt-8">连续专注 <b class="num" style="color:var(--ink)">${pet.streak}</b> 天${petNext}</div>
        </div>
      </div>
      <div class="field mt-12" style="margin-bottom:10px"><label class="field-label">显示开关</label>
        <div class="chip-row">
          <button class="chip ${s.petOn !== false ? 'active' : ''}" data-act="pet-on" data-v="1">在首页显示</button>
          <button class="chip ${s.petOn === false ? 'active' : ''}" data-act="pet-on" data-v="0">隐藏知知</button>
        </div></div>
      <button class="btn btn-soft btn-sm btn-block" data-act="pet-reset">回到默认位置</button>
    </section>

    <section class="card">
      <div class="card-title">${ZH.icon('download')}数据备份</div>
      <p class="small dim mt-8" style="line-height:1.9">所有数据都存在这台手机的浏览器里，换手机或清除浏览器数据前，记得先导出备份。${lastBackup ? '<br>上次备份：' + U.fmtCNWithWeek(U.dateKey(new Date(lastBackup))) + ' ' + U.timeHM(lastBackup) : ''}</p>
      <div class="flex mt-12" style="gap:8px">
        <button class="btn btn-primary grow" data-act="export">${ZH.icon('download')}导出备份</button>
        <label class="btn btn-soft" style="flex:none;cursor:pointer">${ZH.icon('upload')}导入恢复
          <input type="file" id="s-import" accept="application/json,.json" style="display:none">
        </label>
      </div>
    </section>

    <section class="card">
      <div class="card-title">${ZH.icon('info')}关于</div>
      <div class="small dim mt-8" style="line-height:2">
        知禾工作台 v1.1 · 给自己的一亩三分地<br>
        课表、英语计划、片单、每日新闻由 AI 助手维护，想更新就把素材发给它
      </div>
    </section>
    </div>`;

    root.querySelector('#s-exam').addEventListener('change', e => {
      const st = M.settings();
      if (e.target.value) { st.examDate = e.target.value; M.saveSettings(st); ZH.UI.toast('已保存'); }
    });
    root.querySelector('#s-goal').addEventListener('change', e => {
      const st = M.settings();
      st.savingGoal = Math.max(0, Number(e.target.value) || 0);
      M.saveSettings(st);
      ZH.UI.toast('已保存');
    });
    root.querySelectorAll('[data-act="daily"]').forEach(el => {
      el.addEventListener('click', () => {
        const st = M.settings();
        st.wordsDaily = Number(el.dataset.n);
        M.saveSettings(st);
        render();
      });
    });
    root.querySelectorAll('[data-act="pet-on"]').forEach(el => {
      el.addEventListener('click', () => {
        const st = M.settings();
        st.petOn = el.dataset.v === '1';
        M.saveSettings(st);
        if (!st.petOn) ZH.Pet.cleanup();
        ZH.UI.toast(st.petOn ? '知知会在首页等你' : '知知先躲起来了');
        render();
      });
    });
    const pr = root.querySelector('[data-act="pet-reset"]');
    if (pr) pr.addEventListener('click', () => {
      ZH.Store.set('petPos', null);
      ZH.Pet.cleanup();
      ZH.UI.toast('下次进首页，知知回到右下角');
    });
    root.querySelector('[data-act="export"]').addEventListener('click', () => {
      const data = { app: 'zhihe', version: 1, exportedAt: Date.now(), data: ZH.Store.exportAll() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '知禾工作台备份-' + U.today() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      ZH.Store.set('lastBackup', Date.now());
      ZH.UI.toast('备份文件已下载，妥善保存');
    });
    root.querySelector('#s-import').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const obj = JSON.parse(reader.result);
          const payload = obj && obj.app === 'zhihe' ? obj.data : obj;
          if (!payload || typeof payload !== 'object') throw new Error('bad');
          const ok = await ZH.UI.confirm('导入备份', '将覆盖本机当前的所有数据，确定继续吗？');
          if (ok) {
            ZH.Store.importAll(payload);
            ZH.UI.toast('导入完成');
            render();
          }
        } catch (err) {
          ZH.UI.toast('文件格式不对，导入失败');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  render();
};
