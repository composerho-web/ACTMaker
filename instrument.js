/* ============================================================
   MEG 模擬儀器共用框架 (instrument.js + instrument.css 合一)
   提供：科技感儀器外殼、可捲動的提示紀錄、讀數面板、
         檢視切換鈕、強化次數上限處理、與主遊戲的訊息協定
   ============================================================ */

const INSTRUMENT_CSS = `
:root{
  --bg:#070d18; --panel:#0d1830; --panel2:#0a1426; --line:#1e3a5f;
  --cyan:#7fdcff; --cyan-dim:#3a7ca8; --amber:#fbbf24; --green:#4ade80;
  --red:#f87171; --violet:#a78bfa; --text:#dbeafe; --muted:#8ba7c4;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--text);
  font-family:"Segoe UI",system-ui,sans-serif;overflow:hidden}
#shell{display:flex;flex-direction:column;height:100%;min-height:0}

/* ---- 頂部標題列（儀器銘牌） ---- */
#nameplate{display:flex;align-items:center;gap:10px;padding:7px 14px;
  background:linear-gradient(180deg,#1a2f52 0%,#12213c 50%,#0b1526 100%);
  border-bottom:2px solid var(--cyan-dim);flex:none;position:relative;
  box-shadow:inset 0 1px 0 rgba(127,220,255,.15)}
#nameplate::after{content:'';position:absolute;left:0;right:0;bottom:-2px;height:2px;
  background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.5}
#nameplate .led{width:9px;height:9px;border-radius:50%;background:var(--green);
  box-shadow:0 0 8px var(--green);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.45}}
#nameplate h1{margin:0;font-size:14px;color:var(--cyan);letter-spacing:.5px;flex:1}
#nameplate .tag{font-size:10.5px;color:var(--muted);border:1px solid var(--line);
  border-radius:10px;padding:2px 8px}

/* ---- 操作目標橫幅（顯眼、機械感） ---- */
#goalbar{display:flex;align-items:stretch;gap:0;flex:none;
  background:linear-gradient(90deg,#0a1830,#0d2140 60%,#0a1830);
  border-bottom:1px solid var(--line);position:relative;overflow:hidden}
#goalbar::before{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(90deg,rgba(251,191,36,.05) 0 12px,transparent 12px 24px);pointer-events:none}
#goalbar .gicon{display:flex;align-items:center;justify-content:center;
  min-width:46px;background:linear-gradient(180deg,#1a2f52,#0f1e38);
  border-right:2px solid var(--amber);font-size:20px;
  box-shadow:inset 0 0 12px rgba(251,191,36,.25)}
#goalbar .gbody{flex:1;padding:7px 12px;min-width:0}
#goalbar .gtitle{font-size:10px;letter-spacing:2px;color:var(--amber);
  text-transform:uppercase;font-weight:700;display:flex;align-items:center;gap:6px}
#goalbar .gtitle::after{content:'';flex:1;height:1px;
  background:linear-gradient(90deg,var(--amber),transparent)}
#goalbar .gtext{font-size:12.5px;color:#eaf4ff;margin-top:3px;line-height:1.4}
#goalbar .gpass{font-size:11px;color:var(--green);margin-top:3px;display:flex;align-items:center;gap:5px}
#goalbar .gpass b{color:#bbf7d0}
#goalbar .rivet{position:absolute;width:4px;height:4px;border-radius:50%;
  background:radial-gradient(circle,#5a7ba8,#243a5c);box-shadow:0 0 2px #000}

/* ---- 主體：左儀器 / 右側欄 ---- */
#body{flex:1;display:flex;min-height:0}
#viewport{flex:1;position:relative;min-width:0;background:
  radial-gradient(circle at 50% 40%,#0e1a2e 0%,#070d18 75%)}
#viewport canvas{display:block;width:100%;height:100%}
/* 掃描線裝飾 */
#viewport::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(127,220,255,.028) 0 1px,transparent 1px 3px)}

#side{width:290px;flex:none;display:flex;flex-direction:column;min-height:0;
  background:var(--panel2);border-left:1px solid var(--line)}

/* ---- 讀數面板 ---- */
.readouts{padding:8px 10px;border-bottom:1px solid var(--line);flex:none}
.ro{display:flex;justify-content:space-between;align-items:baseline;
  font-size:11.5px;padding:3px 0;border-bottom:1px dashed rgba(127,220,255,.12)}
.ro:last-child{border-bottom:0}
.ro .k{color:var(--muted)}
.ro .v{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;color:var(--cyan)}
.ro .v.amber{color:var(--amber)} .ro .v.green{color:var(--green)}
.ro .v.red{color:var(--red)} .ro .v.violet{color:var(--violet)}

/* ---- 提示紀錄（可捲動、保留歷史） ---- */
#logwrap{flex:1;display:flex;flex-direction:column;min-height:0}
#logtitle{display:flex;align-items:center;gap:6px;padding:6px 10px;
  font-size:11px;color:var(--muted);background:#0b1424;
  border-bottom:1px solid var(--line);flex:none}
#logtitle .badge{margin-left:auto;background:#1e3a5f;color:var(--cyan);
  border-radius:8px;padding:1px 7px;font-size:10px}
#log{flex:1;overflow-y:auto;padding:8px 10px;min-height:0}
#log::-webkit-scrollbar{width:7px}
#log::-webkit-scrollbar-thumb{background:#24406a;border-radius:4px}
#log .entry{margin-bottom:9px;padding:7px 9px;border-radius:6px;
  background:#101d33;border-left:3px solid var(--amber);
  font-size:11.8px;line-height:1.65;color:#fde68a;animation:fadein .3s}
#log .entry.lv1{border-left-color:#60a5fa;color:#bfdbfe}
#log .entry.lv2{border-left-color:var(--amber);color:#fde68a}
#log .entry.lv3{border-left-color:#fb923c;color:#fed7aa}
#log .entry.okmsg{border-left-color:var(--green);color:#bbf7d0;background:#0f2a1c}
#log .entry .hd{display:block;font-size:10px;color:var(--muted);margin-bottom:3px;
  letter-spacing:.4px}
#log .empty{color:#456;font-size:11.5px;text-align:center;padding:16px 0}
@keyframes fadein{from{opacity:0;transform:translateY(-3px)}to{opacity:1}}

/* ---- 控制台 ---- */
#deck{flex:none;background:linear-gradient(180deg,#0c1728,#080f1c);
  border-top:1px solid var(--line);padding:8px 12px}
.rowline{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rowline+.rowline{margin-top:7px}

.knob{display:flex;align-items:center;gap:7px;
  background:linear-gradient(180deg,#14243f,#0c1728);
  border:1px solid var(--line);border-top-color:#2a4a72;border-radius:8px;padding:5px 9px;
  box-shadow:inset 0 1px 0 rgba(127,220,255,.08),0 1px 2px rgba(0,0,0,.3)}
.knob label{font-size:11px;color:var(--muted);white-space:nowrap}
.knob input[type=range]{width:110px;-webkit-appearance:none;height:4px;
  background:linear-gradient(90deg,var(--cyan-dim),var(--cyan));border-radius:3px;outline:0}
.knob input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;
  border-radius:50%;background:#e2f4ff;border:2px solid var(--cyan);cursor:pointer;
  box-shadow:0 0 7px rgba(127,220,255,.75)}
.knob input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
  background:#e2f4ff;border:2px solid var(--cyan);cursor:pointer}
.knob .rd{font-family:ui-monospace,monospace;font-size:12px;color:var(--cyan);
  min-width:52px;text-align:right}
/* 微調鈕 */
.step{background:#16294a;color:var(--cyan);border:1px solid var(--line);border-radius:5px;
  width:22px;height:22px;line-height:1;font-size:13px;cursor:pointer;padding:0}
.step:hover{background:#1e3a5f}

button.btn{background:linear-gradient(180deg,#2a5fd8,#1a3fa0);color:#fff;
  border:1px solid #3d6fe0;border-top-color:#5b8bff;border-radius:7px;
  padding:8px 15px;font-size:12.5px;cursor:pointer;letter-spacing:.4px;
  box-shadow:0 2px 4px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.2)}
button.btn:hover{background:linear-gradient(180deg,#3570e8,#2350b8);transform:translateY(-1px)}
button.btn:active{transform:translateY(1px);box-shadow:inset 0 2px 4px rgba(0,0,0,.4)}
button.btn:disabled{background:#2a3346;color:#6b7a90;cursor:not-allowed;border-color:#333c4e;box-shadow:none;transform:none}
button.btn.submit{background:linear-gradient(180deg,#12a5c8,#0a7290);border-color:#1cc4e0;
  border-top-color:#5fdcff;box-shadow:0 0 14px rgba(14,180,220,.45),inset 0 1px 0 rgba(255,255,255,.25);font-weight:600}
button.btn.submit:hover{background:linear-gradient(180deg,#18b8de,#0c86a8)}
button.btn.ghost{background:linear-gradient(180deg,#122036,#0c1626);border:1px solid var(--line);color:var(--muted);box-shadow:none}
button.btn.ghost:hover{background:#16273e;color:var(--cyan);transform:none}
button.btn.apply{background:linear-gradient(180deg,#1e8a48,#146030);border-color:#25a055;
  border-top-color:#4ade80;box-shadow:0 0 12px rgba(30,160,80,.4),inset 0 1px 0 rgba(255,255,255,.2)}
button.btn.apply:hover{background:linear-gradient(180deg,#26a555,#187539)}
button.btn.apply:disabled{background:#2a3346;box-shadow:none}

/* 檢視切換（分頁鈕） */
.views{display:flex;gap:4px;background:#0a1426;border:1px solid var(--line);
  border-radius:8px;padding:3px}
.views button{background:transparent;border:0;color:var(--muted);font-size:11px;
  padding:5px 10px;border-radius:5px;cursor:pointer;white-space:nowrap}
.views button.on{background:#1e3a5f;color:var(--cyan);box-shadow:inset 0 0 8px rgba(127,220,255,.18)}
.views button:hover:not(.on){color:var(--text)}

/* 切換開關 */
.toggle{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);
  background:#0f1c33;border:1px solid var(--line);border-radius:8px;padding:6px 9px;cursor:pointer}
.toggle .sw{width:30px;height:15px;border-radius:9px;background:#25324a;position:relative;
  transition:background .18s}
.toggle .sw::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;
  border-radius:50%;background:#93a5bd;transition:transform .18s,background .18s}
.toggle.on .sw{background:#0e7490}
.toggle.on .sw::after{transform:translateX(15px);background:#e2f4ff}
.toggle.on{color:var(--cyan)}

#statusline{font-size:11.5px;margin-left:auto;text-align:right}
#statusline.ok{color:var(--green);font-weight:600}
#statusline.bad{color:var(--red)}
#statusline.hint{color:#93c5fd}
#capline{font-size:10.5px;color:var(--violet)}
#capline.full{color:var(--red)}
`;

/* ---------- 建立儀器外殼 ---------- */
function buildInstrument(cfg){
  // cfg: {title, tag, brief, readouts:[{id,label}], views:[{id,label}], deckHTML}
  const st=document.createElement('style'); st.textContent=INSTRUMENT_CSS;
  document.head.appendChild(st);
  const viewsHTML = (cfg.views&&cfg.views.length)
    ? `<div class="views" id="views">${cfg.views.map((v,i)=>
        `<button data-view="${v.id}" class="${i===0?'on':''}">${v.label}</button>`).join('')}</div>`
    : '';
  document.body.innerHTML = `
  <div id="shell">
    <div id="nameplate">
      <span class="led"></span>
      <h1>${cfg.title}</h1>
      <span class="tag">${cfg.tag||''}</span>
    </div>
    ${(cfg.goal||cfg.pass)?`<div id="goalbar">
      <span class="rivet" style="left:6px;top:6px"></span><span class="rivet" style="right:6px;top:6px"></span>
      <span class="rivet" style="left:6px;bottom:6px"></span><span class="rivet" style="right:6px;bottom:6px"></span>
      <div class="gicon">🎯</div>
      <div class="gbody">
        <div class="gtitle">操作目標 · MISSION</div>
        ${cfg.goal?`<div class="gtext">${cfg.goal}</div>`:''}
        ${cfg.pass?`<div class="gpass">✓ 通過條件：<b>${cfg.pass}</b></div>`:''}
      </div>
    </div>`:''}
    <div id="body">
      <div id="viewport"><canvas id="cv"></canvas></div>
      <div id="side">
        <div class="readouts" id="readouts">
          ${(cfg.readouts||[]).map(r=>
            `<div class="ro"><span class="k">${r.label}</span><span class="v" id="${r.id}">—</span></div>`).join('')}
        </div>
        <div id="logwrap">
          <div id="logtitle">🛰 分析紀錄 <span class="badge" id="logcount">0</span></div>
          <div id="log"><div class="empty">尚無紀錄。提交驗證後，若未成功將在此累積分析提示。</div></div>
        </div>
      </div>
    </div>
    <div id="deck">
      <div class="rowline">${cfg.deckHTML||''}</div>
      <div class="rowline">
        ${viewsHTML}
        <button class="btn submit" id="submit">▶ 提交驗證</button>
        <button class="btn ghost" id="reset">↺ 重設</button>
        <span id="statusline" class="hint">${cfg.brief||''}</span>
      </div>
      <div class="rowline">
        <span id="capline">強化次數 0/2</span>
        <span style="flex:1"></span>
        <button class="btn apply" id="apply" disabled>套用強化</button>
      </div>
    </div>
  </div>`;
  return {
    cv:document.getElementById('cv'),
    submit:document.getElementById('submit'),
    reset:document.getElementById('reset'),
    apply:document.getElementById('apply'),
    status:document.getElementById('statusline'),
    cap:document.getElementById('capline'),
    log:document.getElementById('log'),
    logcount:document.getElementById('logcount'),
    views:document.getElementById('views'),
  };
}

/* ---------- 提示紀錄（保留歷史、可捲動、可反覆觀看） ---------- */
function makeHintLog(ui){
  let n=0;
  return {
    add(level, attempt, text){
      const empty=ui.log.querySelector('.empty'); if(empty) empty.remove();
      n++;
      const d=document.createElement('div');
      d.className='entry lv'+level;
      d.innerHTML=`<span class="hd">第 ${attempt} 次嘗試 · 提示層級 ${level}</span>${text}`;
      ui.log.appendChild(d);
      ui.log.scrollTop=ui.log.scrollHeight;
      ui.logcount.textContent=n;
    },
    success(text){
      const empty=ui.log.querySelector('.empty'); if(empty) empty.remove();
      n++;
      const d=document.createElement('div');
      d.className='entry okmsg';
      d.innerHTML=`<span class="hd">校準成功</span>${text}`;
      ui.log.appendChild(d);
      ui.log.scrollTop=ui.log.scrollHeight;
      ui.logcount.textContent=n;
    },
    clear(){ n=0; ui.logcount.textContent='0';
      ui.log.innerHTML='<div class="empty">尚無紀錄。提交驗證後，若未成功將在此累積分析提示。</div>'; }
  };
}

/* ---------- 讀數更新 ---------- */
function setRO(id, text, cls){
  const el=document.getElementById(id); if(!el) return;
  el.textContent=text;
  el.className='v'+(cls?' '+cls:'');
}

/* ---------- 強化次數上限（與主遊戲協定） ---------- */
function makeCap(ui, onFull){
  let successCount=0, MAX=2;
  window.addEventListener('message',e=>{
    const d=e.data;
    if(d&&d.type==='machineState'&&typeof d.successCount==='number'){
      successCount=d.successCount; MAX=d.maxSuccess||2; render();
    }
  });
  function render(){
    ui.cap.textContent=`強化次數 ${successCount}/${MAX}`;
    if(successCount>=MAX){
      ui.cap.classList.add('full');
      ui.apply.disabled=true; ui.apply.textContent='已達強化上限';
      if(onFull) onFull();
    }
  }
  render();
  return {
    get count(){return successCount;}, get max(){return MAX;},
    get full(){return successCount>=MAX;},
    inc(){ successCount++; render(); },
    render
  };
}

/* ---------- 檢視切換 ---------- */
function makeViews(ui, onChange){
  if(!ui.views) return {current:null};
  let cur=ui.views.querySelector('button').dataset.view;
  ui.views.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    ui.views.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); cur=b.dataset.view;
    if(onChange) onChange(cur);
  });
  return { get current(){return cur;} };
}

/* ---------- 旋鈕（含 +/- 微調） ---------- */
function knob(id,label,min,max,step,val,unit){
  return `<div class="knob">
    <label>${label}</label>
    <button class="step" data-step="${id}:-1">−</button>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">
    <button class="step" data-step="${id}:1">+</button>
    <span class="rd" id="${id}_rd">${val}${unit||''}</span>
  </div>`;
}
function wireKnobs(onInput){
  document.querySelectorAll('.step').forEach(b=>{
    b.onclick=()=>{
      const [id,dir]=b.dataset.step.split(':');
      const el=document.getElementById(id);
      const s=+el.step||1;
      el.value = Math.max(+el.min, Math.min(+el.max, (+el.value)+s*(+dir)));
      el.dispatchEvent(new Event('input'));
    };
  });
  document.querySelectorAll('.knob input[type=range]').forEach(el=>{
    el.addEventListener('input',()=>onInput(el.id, +el.value));
  });
}
function setKnobRD(id, text){ const e=document.getElementById(id+'_rd'); if(e) e.textContent=text; }

/* ---------- 切換開關 ---------- */
function toggle(id,label,on){
  return `<div class="toggle ${on?'on':''}" id="${id}"><span class="sw"></span>${label}</div>`;
}
function wireToggle(id, onChange){
  const el=document.getElementById(id);
  el.onclick=()=>{ el.classList.toggle('on'); onChange(el.classList.contains('on')); };
  return ()=>el.classList.contains('on');
}
