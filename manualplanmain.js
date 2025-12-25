/* =========================================================
   Manual Planner (Clean / Single-State / Backend-Friendly)
   - ONE global state: window.state
   - Dates stored ISO: YYYY-MM-DD (backend)
   - UI shows DD-MM-YYYY
   - IDs unified using crypto.randomUUID() fallback
   - Flatpickr supported (no input-mask conflicts)
   - Keeps: stepper, cities, mapping, plan, drag&drop, lock, review, cart event
   ========================================================= */

/* --------------------- Header animation --------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('manualHeader');
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (ent.isIntersecting) {
        el.classList.add('show');
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(el);
});

/* --------------------- Step animations (1/2/3) --------------------- */
(function stepAnims(){
  // step 1
  const step1 = document.getElementById('step1Basics');
  if (step1) {
    const io1 = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) { step1.classList.add('show'); io1.disconnect(); }
      });
    }, { threshold: 0.25 });
    io1.observe(step1);
  }

  // step 2
  document.addEventListener('DOMContentLoaded', () => {
    const step2 = document.getElementById('step2Cities');
    if (!step2) return;
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) { step2.classList.add('show'); io2.disconnect(); }
      });
    }, { threshold: 0.25 });
    io2.observe(step2);
  });

  // step 3
  document.addEventListener('DOMContentLoaded', () => {
    const step3 = document.getElementById('step3Plan');
    if (!step3) return;
    const io3 = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) { step3.classList.add('show'); io3.disconnect(); }
      });
    }, { threshold: 0.25 });
    io3.observe(step3);
  });
})();

/* --------------------- PLACES  ------------------- */
window.PLACES = window.PLACES || [
  { id:'p1', name:'Albaik',          city:'Riyadh',   category:'restaurants',  url:'/places/riyadh/albaik' },
  { id:'p2', name:'Najd Village',    city:'Riyadh',   category:'restaurants',  url:'/places/riyadh/najd-village' },
  { id:'p3', name:'Brew Café',       city:'Jeddah',   category:'cafes',        url:'/places/jeddah/brew-cafe' },
  { id:'p4', name:'Al Shallal Park', city:'Jeddah',   category:'parks',        url:'/places/jeddah/al-shallal' },
  { id:'p5', name:'Tamimi Markets',  city:'Dammam',   category:'supermarkets', url:'/places/dammam/tamimi' },
];

/*  
   Manual Planner Core
  */
(() => {
  /* --------------------- Helpers --------------------- */
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const q = (sel, root=document) => {
    if (window.jQuery) {
      const $el = (root === document) ? window.jQuery(sel) : window.jQuery(root).find(sel);
      return $el.length ? $el[0] : null;
    }
    return root.querySelector(sel);
  };

  // translation
  const t = (key) =>
    (window.I18N?.[document.documentElement.lang]?.[key]) ||
    (window.I18N?.en?.[key]) ||
    key;

  const tt = (key, fallback) => (typeof window.t === 'function' ? t(key) : (fallback ?? key));

  const uid = () => (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 11));

  /*  State (ONE source of truth)  */
  const state = (window.state = window.state || {});
  state.days       = Array.isArray(state.days) ? state.days : [];        // [{id, date:'YYYY-MM-DD'}]
  state.cities     = Array.isArray(state.cities) ? state.cities : [];    // [{id, name, nights}]
  state.plan       = (state.plan && typeof state.plan === 'object') ? state.plan : {}; // { [dayId]: {morning:[],...} }
  state.dayCityMap = (state.dayCityMap && typeof state.dayCityMap === 'object') ? state.dayCityMap : {};
  state.cart       = Array.isArray(state.cart) ? state.cart : [];

  /*   Date utils (store ISO, show DD-MM-YYYY)  */
  const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

  function parseAnyDate(str){
    if(!str) return null;
    const s = String(str).trim();

    // YYYY-MM-DD
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(m){
      const d = new Date(+m[1], +m[2]-1, +m[3]);
      return isNaN(d) ? null : d;
    }

    // DD-MM-YYYY
    m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if(m){
      const d = new Date(+m[3], +m[2]-1, +m[1]);
      if (d.getFullYear() === +m[3] && d.getMonth() === (+m[2]-1) && d.getDate() === +m[1]) return d;
      return null;
    }

    // fallback
    const d = new Date(s);
    return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function toISO(input){
    const d = (input instanceof Date) ? input : parseAnyDate(input);
    if(!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function isoToDDMMYYYY(iso){
    if(!isISO(iso)) return '';
    const [y,m,d] = iso.split('-');
    return `${d}-${m}-${y}`;
  }

  function addDaysISO(iso, n=1){
    const base = isISO(iso) ? new Date(iso + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + n);
    return toISO(base);
  }

  function getLastDayISO(){
    for (let i = state.days.length - 1; i >= 0; i--) {
      const iso = state.days[i]?.date;
      if (isISO(iso)) return iso;
    }
    return '';
  }

  /* --------------------- DOM getters --------------------- */
  const getPlanDaysEl = () => $('#planDays');
  const getSteps      = () => $$('.step');
  const getDots       = () => $$('.step-dot');

  /* --------------------- Wizard nav --------------------- */
  let current = 0;

  function showStep(i){
    const steps = getSteps();
    if(!steps.length) return;
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((el, idx) => el.classList.toggle('hidden', idx !== current));

    const dots = getDots();
    dots.forEach((d, idx) => {
      d.className =
        'step-dot w-7 h-7 rounded-full grid place-items-center ' +
        (idx <= current ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700');
      d.textContent = idx + 1;
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.next')) showStep(current + 1);
    if (e.target.closest('.prev')) showStep(current - 1);
  });

  /* --------------------- Plan ensure --------------------- */
  function ensurePlan(){
    state.plan = state.plan || {};
    state.days.forEach((d) => {
      if(!d.id) d.id = uid();
      if(!state.plan[d.id]){
        state.plan[d.id] = {
          morning: [],
          afternoon: [],
          evening: [],
          locked: { morning:false, afternoon:false, evening:false }
        };
      } else {
        const p = state.plan[d.id];
        p.morning   = Array.isArray(p.morning) ? p.morning : [];
        p.afternoon = Array.isArray(p.afternoon) ? p.afternoon : [];
        p.evening   = Array.isArray(p.evening) ? p.evening : [];
        p.locked    = p.locked || { morning:false, afternoon:false, evening:false };
      }
    });

    // clean plan keys for removed days (optional but safe)
    const valid = new Set(state.days.map(d => d.id));
    Object.keys(state.plan).forEach(k => { if(!valid.has(k)) delete state.plan[k]; });
  }

  /*  Cities -> Days map (derived)  */
  function mapCitiesToDays(){
    if(!state.days.length || !state.cities.length){
      state.dayCityMap = {};
      return;
    }
    const map = {};
    let dayIdx = 0;
    state.cities.forEach((c) => {
      const nights = Math.max(1, parseInt(c.nights || 1, 10));
      for(let i=0;i<nights;i++){
        if(dayIdx < state.days.length){
          map[state.days[dayIdx].id] = c.name;
          dayIdx++;
        }
      }
    });
    state.dayCityMap = map;
  }
  window.mapCitiesToDays = mapCitiesToDays;

  /* --------------------- Days preview --------------------- */
  function renderDaysPreview(){
    const wrap = q('#daysPreview');
    const list = q('#daysPreviewList');
    if(!wrap || !list) return;

    list.innerHTML = '';
    ensurePlan();

    state.days.forEach((d, idx) => {
      const chip = document.createElement('span');
      chip.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm';

      const ddmm = d.date ? isoToDDMMYYYY(d.date) : '';
      chip.textContent = `${t('mp_day_label')} ${idx+1}` + (ddmm ? ` • ${ddmm}` : '');

      const del = document.createElement('button');
      del.className = 'ml-2 text-red-600 hover:underline';
      del.textContent = t('mp_delete');
      del.onclick = () => {
        state.days.splice(idx, 1);
        mapCitiesToDays();
        ensurePlan();
        renderDaysPreview();
        renderPlan();
      };

      chip.appendChild(del);
      list.appendChild(chip);
    });

    wrap.classList.toggle('hidden', state.days.length === 0);
  }

  /* --------------------- City select --------------------- */
  function fillCitySelect(){
    const sel = document.getElementById('citySelect');
    if(!sel) return;

    const fromPlaces = Array.from(new Set((window.PLACES || []).map(p => p.city).filter(Boolean)));
    const cities = Array.from(new Set(fromPlaces)).sort((a,b)=>a.localeCompare(b));

    sel.innerHTML = `<option value="" disabled selected>${t('mp_city_select_ph')}</option>`;
    cities.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });

    const optOther = document.createElement('option');
    optOther.value = '__custom__';
    optOther.textContent = t('mp_city_other');
    sel.appendChild(optOther);
  }

  /* --------------------- Places picker --------------------- */
  const PLACE_CATS = [
    { key:'all',          label:()=>t('mp_places_tab_all') },
    { key:'restaurants',  label:()=>t('mp_cat_restaurants') },
    { key:'cafes',        label:()=>t('mp_cat_cafes') },
    { key:'parks',        label:()=>t('mp_cat_parks') },
    { key:'supermarkets', label:()=>t('mp_cat_supermarkets') },
  ];

  function filterPlaces({qText='', cat='all', cityHint=null}={}){
    const needle = qText.trim().toLowerCase();
    return (window.PLACES||[]).filter(p => {
      if(cat !== 'all' && p.category !== cat) return false;
      if(needle){
        const hay = `${p.name} ${p.city||''}`.toLowerCase();
        if(!hay.includes(needle)) return false;
      }
      return true;
    }).sort((a,b) => {
      const aBoost = (cityHint && a.city && a.city.toLowerCase() === cityHint.toLowerCase()) ? -1 : 0;
      const bBoost = (cityHint && b.city && b.city.toLowerCase() === cityHint.toLowerCase()) ? -1 : 0;
      return aBoost - bBoost || a.name.localeCompare(b.name);
    });
  }

  function showPlacesPicker({dayId, slotName, onPick}){
    const cityHint = state.dayCityMap?.[dayId] || null;

    const wrap = document.createElement('div');
    wrap.className = 'place-backdrop';

    const card = document.createElement('div');
    card.className = 'place-card w-[min(950px,94vw)] rounded-2xl bg-white shadow-2xl border border-gray-200 p-6';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900">${t('mp_places_title')}</h3>
          <p class="text-gray-500 text-sm">${t('mp_places_sub')}${cityHint? ` • <span class="font-medium">${cityHint}</span>`:''}</p>
        </div>
        <button class="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold" data-act="close">${t('mp_places_close')}</button>
      </div>
      <div class="flex flex-wrap items-center gap-2 mb-4">
        ${PLACE_CATS.map((c,i)=>`<button class="place-tab ${i===0?'active':''}" data-cat="${c.key}">${c.label()}</button>`).join('')}
        <div class="ms-auto w-full md:w-64">
          <input type="search"
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                 placeholder="${t('mp_places_search_ph')}"
                 data-role="search">
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-3" data-role="list"></div>
    `;

    const listEl = card.querySelector('[data-role="list"]');
    const searchEl = card.querySelector('[data-role="search"]');
    const local = { cat:'all', qText:'' };

    function renderList(){
      const rows = filterPlaces({ qText: local.qText, cat: local.cat, cityHint });
      listEl.innerHTML = rows.map(p=>`
        <div class="place-item rounded-xl border border-gray-200 p-3 flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 truncate">${p.name}</div>
            <div class="text-xs text-gray-500">${p.city||''} • ${t('mp_cat_'+p.category) || p.category}</div>
            <div class="mt-2 flex gap-2">
              <a href="${p.url}" class="text-teal-700 underline" target="_blank" rel="noopener">${t('mp_places_visit')}</a>
              <button class="text-sm px-2 py-1 rounded bg-teal-600 text-white" data-pick="${p.id}">${t('mp_places_add')}</button>
            </div>
          </div>
        </div>
      `).join('') || `<div class="text-gray-500">${t('mp_empty')}</div>`;
    }

    renderList();

    card.addEventListener('click', (e) => {
      if (e.target.matches('[data-act="close"]')) { wrap.remove(); return; }

      const tab = e.target.closest('.place-tab');
      if(tab){
        card.querySelectorAll('.place-tab').forEach(b=>b.classList.remove('active'));
        tab.classList.add('active');
        local.cat = tab.dataset.cat || 'all';
        renderList();
      }

      const pickBtn = e.target.closest('[data-pick]');
      if(pickBtn){
        const pid = pickBtn.getAttribute('data-pick');
        const place = (window.PLACES||[]).find(x => x.id === pid);
        if(place){
          onPick?.(place);
          wrap.remove();
        }
      }
    });

    searchEl.addEventListener('input', (e) => {
      local.qText = e.target.value || '';
      renderList();
    });

    wrap.appendChild(card);
    document.body.appendChild(wrap);
  }

  /* --------------------- Drag & Drop (same day only) --------------------- */
  function makeDraggable(card, meta){
    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(meta));
      card.classList.add('opacity-50');
    });
    card.addEventListener('dragend', () => card.classList.remove('opacity-50'));
  }

  function computeDropIndex(listEl, clientY){
    const children = Array.from(listEl.children);
    if(children.length === 0) return 0;
    for(let i=0;i<children.length;i++){
      const r = children[i].getBoundingClientRect();
      if(clientY < r.top + r.height/2) return i;
    }
    return children.length;
  }

  function makeDropZone(listEl, targetMeta){
    listEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      listEl.classList.add('ring-2','ring-teal-300');
      e.dataTransfer.dropEffect = 'move';
    });

    listEl.addEventListener('dragleave', () => listEl.classList.remove('ring-2','ring-teal-300'));

    listEl.addEventListener('drop', (e) => {
      e.preventDefault();
      listEl.classList.remove('ring-2','ring-teal-300');

      const data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
      if(!data.dId || data.dId !== targetMeta.dId) return;  

      const fromArr = state.plan[data.dId][data.slotName];
      const toArr   = state.plan[targetMeta.dId][targetMeta.slotName];

      const [moved] = fromArr.splice(data.index, 1);
      const toIndex = computeDropIndex(listEl, e.clientY);
      toArr.splice(toIndex, 0, moved);

      renderPlan();
    });
  }

  /* --------------------- Toggle-all helper --------------------- */
  function updateToggleAllButton(){
    const btn = $('#btnToggleAll');
    if(!btn) return;

    const slots = $$('#planDays [data-slot]');
    if(!slots.length){
      btn.dataset.state = 'expanded';
      btn.textContent = tt('mp_collapse_all','Collapse all');
      return;
    }

    const allCollapsed = slots.every(el => el.classList.contains('collapsed'));
    btn.dataset.state = allCollapsed ? 'collapsed' : 'expanded';
    btn.textContent = tt(allCollapsed ? 'mp_expand_all' : 'mp_collapse_all', allCollapsed ? 'Expand all' : 'Collapse all');
  }
  window.updateToggleAllButton = updateToggleAllButton;

  /* --------------------- Plan renderer --------------------- */
  function renderPlan(){
    ensurePlan();
    const planDaysEl = getPlanDaysEl();
    if(!planDaysEl) return;

    planDaysEl.innerHTML = '';

    state.days.forEach((d, dayIndex) => {
      const dayBox = document.createElement('div');
      dayBox.className = 'rounded-2xl border border-gray-200 p-5 shadow-sm';

      const title = document.createElement('div');
      title.className = 'flex items-center justify-between mb-3';

      const ddmm = d.date ? isoToDDMMYYYY(d.date) : '';
      const cityChunk = state.dayCityMap?.[d.id]
        ? ` • <span data-i18n="mp_city">${tt('mp_city','City')}</span>: <span class="day-city">${state.dayCityMap[d.id]}</span>`
        : '';

      title.innerHTML = `
        <div class="font-semibold text-gray-900">
          <span data-i18n="mp_day_label">${tt('mp_day_label','Day')}</span>
          <span class="day-index">${dayIndex+1}</span>
          ${ddmm ? ` • <span class="day-date">${ddmm}</span>` : ''}
          ${cityChunk}
        </div>
        <div class="flex items-center gap-2">
          <button class="toggle-day text-sm px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                  data-state="expanded"
                  data-i18n="mp_collapse_all">
            ${tt('mp_collapse_all','Collapse all')}
          </button>
        </div>
      `;

      // per-day toggle
      title.addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-day');
        if(!btn) return;

        const slots = dayBox.querySelectorAll('[data-slot]');
        if(btn.dataset.state === 'expanded'){
          slots.forEach(el => el.classList.add('collapsed'));
          btn.dataset.state = 'collapsed';
          btn.setAttribute('data-i18n','mp_expand_all');
          btn.textContent = tt('mp_expand_all','Expand all');
        } else {
          slots.forEach(el => el.classList.remove('collapsed'));
          btn.dataset.state = 'expanded';
          btn.setAttribute('data-i18n','mp_collapse_all');
          btn.textContent = tt('mp_collapse_all','Collapse all');
        }
        if (window.translateIn) translateIn(btn);
        updateToggleAllButton();
      });

      const slotsWrap = document.createElement('div');
      slotsWrap.className = 'grid md:grid-cols-3 gap-4 vline relative';

      ['morning','afternoon','evening'].forEach((slotName) => {
        const slotBox = document.createElement('div');
        slotBox.dataset.slot = slotName;

        const locked = !!state.plan[d.id].locked?.[slotName];
        slotBox.className = 'rounded-xl border border-gray-200 p-4 shadow-[var(--slotShadow)] bg-white ' + (locked ? 'locked' : '');

        const labelKey = slotName === 'morning' ? 'mp_morning' : (slotName === 'afternoon' ? 'mp_afternoon' : 'mp_evening');

        const slotTitle = document.createElement('div');
        slotTitle.className = 'flex items-center justify-between mb-3';
        slotTitle.innerHTML = `
          <span class="font-semibold"><span data-i18n="${labelKey}">${tt(labelKey, slotName)}</span></span>
          <div class="flex gap-2">
            <button class="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    data-act="lock"
                    data-i18n="${locked ? 'mp_unlock' : 'mp_lock'}">
              ${locked ? tt('mp_unlock','Unlock') : tt('mp_lock','Lock')}
            </button>
          </div>
        `;

        const list = document.createElement('div');
        list.className = 'space-y-2';

        (state.plan[d.id][slotName] || []).forEach((act, aidx) => {
          const card = document.createElement('div');
          card.className = 'rounded-lg border border-gray-200 p-3 bg-white flex flex-col gap-2';

          card.innerHTML = `
            <div class="grid grid-cols-[1fr,110px] gap-2">
              <input class="act-title w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                     value="${act.title||''}"
                     data-i18n-attr="placeholder:mp_activity_ph"
                     placeholder="${tt('mp_activity_ph','Activity name (e.g., National Museum)')}" />
              <input class="act-time w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                     value="${act.time||''}"
                     data-i18n-attr="placeholder:mp_time_ph"
                     placeholder="${tt('mp_time_ph','Time (e.g., 10:30)')}" />
            </div>

            <textarea class="act-note w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                      rows="2"
                      data-i18n-attr="placeholder:mp_note_ph"
                      placeholder="${tt('mp_note_ph','Notes (ticket, phone, budget)')}">${act.note||''}</textarea>

            <div class="flex flex-wrap items-center gap-2">
              ${act.url ? `
                <a href="${act.url}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-1 text-teal-700 underline text-xs">
                   <span data-i18n="mp_places_visit">${tt('mp_places_visit','Visit page')}</span>
                </a>` : ''}

              <a href="#cart" data-act="addToCart"
                 class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600
                        text-white text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 4h-2a1 1 0 0 0 0 2h1.28l1.6 8A2 2 0 0 0 9.84 16h6.96a2 2 0 0 0 1.96-1.58l1.24-6.2A1 1 0 0 0 19 7H8.22l-.32-1.6A2 2 0 0 0 7 4Zm2 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                </svg>
                <span data-i18n="mp_add_to_cart">${tt('mp_add_to_cart','Add to cart')}</span>
              </a>

              <span class="ms-auto"></span>
              <button class="text-xs underline" data-act="up"><span data-i18n="mp_up">${tt('mp_up','Up')}</span></button>
              <button class="text-xs underline" data-act="down"><span data-i18n="mp_down">${tt('mp_down','Down')}</span></button>
              <button class="text-xs text-red-600 underline" data-act="delete"><span data-i18n="mp_delete">${tt('mp_delete','Delete')}</span></button>
            </div>
          `;

          // click controls
          card.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if(!btn) return;

            const actName = btn.dataset.act;
            const arr = state.plan[d.id][slotName];

            if(actName === 'delete'){ arr.splice(aidx, 1); renderPlan(); return; }
            if(actName === 'up' && aidx > 0){ [arr[aidx-1], arr[aidx]] = [arr[aidx], arr[aidx-1]]; renderPlan(); return; }
            if(actName === 'down' && aidx < arr.length - 1){ [arr[aidx+1], arr[aidx]] = [arr[aidx], arr[aidx+1]]; renderPlan(); return; }

            if(actName === 'addToCart'){
              // sync values
              const titleEl = card.querySelector('.act-title');
              const timeEl  = card.querySelector('.act-time');
              const noteEl  = card.querySelector('.act-note');

              arr[aidx] = {
                ...arr[aidx],
                title: (titleEl?.value || '').trim(),
                time:  (timeEl?.value  || '').trim(),
                note:  (noteEl?.value  || '').trim(),
              };

              const item = {
                dayId: d.id,
                dayIndex: dayIndex + 1,
                date: d.date || '',               
                dateLabel: ddmm || '',       
                city: state.dayCityMap?.[d.id] || '',
                slot: slotName,
                title: arr[aidx].title || '',
                time:  arr[aidx].time  || '',
                note:  arr[aidx].note  || '',
                url:   arr[aidx].url   || '',
                ts: Date.now()
              };

              state.cart.push(item);

              // feedback
              const old = btn.innerHTML;
              btn.innerHTML = `✓ <span data-i18n="mp_added_to_cart">${tt('mp_added_to_cart','Added to cart')}</span>`;
              btn.classList.remove('bg-amber-500','hover:bg-amber-600');
              btn.classList.add('bg-emerald-600');
              setTimeout(() => {
                btn.innerHTML = old;
                btn.classList.remove('bg-emerald-600');
                btn.classList.add('bg-amber-500','hover:bg-amber-600');
                if (window.translateIn) translateIn(btn);
              }, 1200);

              document.dispatchEvent(new CustomEvent('cart:add', { detail: item }));
            }
          });

          // persist on input
          card.addEventListener('input', () => {
            const titleV = card.querySelector('.act-title')?.value?.trim() || '';
            const timeV  = card.querySelector('.act-time')?.value?.trim() || '';
            const noteV  = card.querySelector('.act-note')?.value?.trim() || '';
            state.plan[d.id][slotName][aidx] = { ...state.plan[d.id][slotName][aidx], title:titleV, time:timeV, note:noteV };
          });

          makeDraggable(card, { dId: d.id, slotName, index: aidx });
          list.appendChild(card);
        });

        makeDropZone(list, { dId: d.id, slotName });

        // buttons row
        const btnRow = document.createElement('div');
        btnRow.className = 'mt-2 flex flex-wrap gap-2';

        const addBtn = document.createElement('button');
        addBtn.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700';
        addBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span data-i18n="mp_add_activity">${tt('mp_add_activity','Add activity')}</span>
        `;
        addBtn.onclick = () => { state.plan[d.id][slotName].push({ title:'', time:'', note:'', url:'' }); renderPlan(); };

        const browseBtn = document.createElement('button');
        browseBtn.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200';
        browseBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16v16H4z"/><path d="M4 9h16"/>
          </svg>
          <span data-i18n="mp_places_title">${tt('mp_places_title','Browse places')}</span>
        `;
        browseBtn.onclick = () => {
          showPlacesPicker({
            dayId: d.id,
            slotName,
            onPick: (place) => {
              state.plan[d.id][slotName].push({
                title: place.name,
                time: '',
                note: place.city || '',
                url:  place.url || ''
              });
              renderPlan();
            }
          });
        };

        // lock click
        slotBox.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-act="lock"]') || e.target.closest('[data-act]');
          if(!btn || btn.dataset.act !== 'lock') return;
          state.plan[d.id].locked[slotName] = !state.plan[d.id].locked[slotName];
          renderPlan();
        });

        btnRow.appendChild(addBtn);
        btnRow.appendChild(browseBtn);

        slotBox.appendChild(slotTitle);
        slotBox.appendChild(list);
        slotBox.appendChild(btnRow);
        slotsWrap.appendChild(slotBox);
      });

      dayBox.appendChild(title);
      dayBox.appendChild(slotsWrap);

      planDaysEl.appendChild(dayBox);
      if (window.translateIn) translateIn(dayBox);
    });

    updateToggleAllButton();
  }

  /* --------------------- Toggle all header button --------------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#btnToggleAll');
    if(!btn) return;

    const slots = $$('#planDays [data-slot]');
    if(!slots.length) return;

    const shouldCollapse = btn.dataset.state !== 'collapsed' && slots.some(el => !el.classList.contains('collapsed'));
    if(shouldCollapse) slots.forEach(el => el.classList.add('collapsed'));
    else slots.forEach(el => el.classList.remove('collapsed'));

    updateToggleAllButton();
  });

  /* --------------------- Review modal --------------------- */
  function showReview(){
    ensurePlan();

    const wrap = document.createElement('div');
    wrap.className = 'review-backdrop';

    const card = document.createElement('div');
    card.className = 'review-card w-[min(900px,92vw)] rounded-2xl bg-white shadow-xl border border-gray-200 p-6';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900">${t('mp_review_title')}</h3>
          <p class="text-gray-500 text-sm">${t('mp_review_sub')}</p>
        </div>
        <button class="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold" data-act="close">${t('mp_review_close')}</button>
      </div>
      <div class="space-y-5" id="reviewBody"></div>
    `;

    const body = card.querySelector('#reviewBody');

    state.days.forEach((d, idx) => {
      const cityName = state.dayCityMap?.[d.id] ? ` • ${t('mp_city')}: ${state.dayCityMap[d.id]}` : '';
      const ddmm = d.date ? isoToDDMMYYYY(d.date) : '';

      const dayBox = document.createElement('div');
      dayBox.className = 'rounded-xl border border-gray-200 p-4';

      dayBox.innerHTML = `
        <div class="font-semibold text-gray-900 mb-3">${t('mp_day_label')} ${idx+1}${ddmm ? ' • '+ddmm : ''}${cityName}</div>
        <div class="grid md:grid-cols-3 gap-3">
          ${['morning','afternoon','evening'].map(slot => {
            const labelKey = slot==='morning' ? 'mp_morning' : slot==='afternoon' ? 'mp_afternoon' : 'mp_evening';
            const items = (state.plan[d.id]?.[slot] || []);
            const empty = items.length === 0 ? `<li class="text-gray-400 italic">${t('mp_empty')}</li>` : '';
            return `
              <div class="rounded-lg border border-gray-100 p-3 bg-gray-50">
                <div class="text-sm font-semibold text-gray-800 mb-2">${t(labelKey)}</div>
                <ul class="space-y-2 text-sm text-gray-700">
                  ${items.map(a => `
                    <li class="bg-white border border-gray-200 rounded-md p-2">
                      <div class="font-medium">${a.time ? a.time+' — ' : ''}${a.title || ''}</div>
                      ${a.note ? `<div class="text-xs text-gray-500 mt-1">${a.note}</div>` : ''}
                      ${a.url ? `<div class="text-xs mt-1"><a href="${a.url}" target="_blank" rel="noopener" class="text-teal-700 underline">${t('mp_places_visit')}</a></div>` : ''}
                    </li>
                  `).join('')}
                  ${empty}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      `;

      body.appendChild(dayBox);
    });

    wrap.appendChild(card);
    document.body.appendChild(wrap);

    card.querySelector('[data-act="close"]')?.addEventListener('click', () => wrap.remove());
    wrap.addEventListener('click', (e) => { if(e.target === wrap) wrap.remove(); });
  }

  /* --------------------- Cities UI --------------------- */
  function renderCities(){
    const list = $('#citiesList');
    if(!list) return;

    list.innerHTML = '';
    state.cities.forEach((c, idx) => {
      const tag = document.createElement('span');
      tag.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm';
      tag.textContent = `${c.name} • ${c.nights}`;

      const del = document.createElement('button');
      del.className = 'text-xs text-red-600 underline';
      del.textContent = t('mp_delete');
      del.onclick = () => {
        state.cities.splice(idx, 1);
        renderCities();
        mapCitiesToDays();
        renderPlan();
      };

      tag.appendChild(del);
      list.appendChild(tag);
    });
  }

  /* --------------------- Bind once on DOM ready --------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure buttons type
    const btnAddDay = q('#btnAddDay');
    const btnGenerateDays = q('#btnGenerateDays');
    if (btnAddDay && !btnAddDay.hasAttribute('type')) btnAddDay.setAttribute('type','button');
    if (btnGenerateDays && !btnGenerateDays.hasAttribute('type')) btnGenerateDays.setAttribute('type','button');

    // Flatpickr (no input mask to avoid conflict)
    const fpStart = window.flatpickr?.('#mpStart', {
      altInput: true,
      altFormat: 'd-m-Y',    
      dateFormat: 'Y-m-d',   
      allowInput: true
    });
    const fpEnd = window.flatpickr?.('#mpEnd', {
      altInput: true,
      altFormat: 'd-m-Y',
      dateFormat: 'Y-m-d',
      allowInput: true
    });
    fpStart?.altInput && (fpStart.altInput.placeholder = 'DD-MM-YYYY');
    fpEnd?.altInput && (fpEnd.altInput.placeholder = 'DD-MM-YYYY');

    // Helper to read range reliably (flatpickr OR manual input)
    const readStartDate = () => fpStart?.selectedDates?.[0] || parseAnyDate(q('#mpStart')?.value || '');
    const readEndDate   = () => fpEnd?.selectedDates?.[0]   || parseAnyDate(q('#mpEnd')?.value || '');

    // fill cities
    fillCitySelect();

    // Generate days from range
    if(btnGenerateDays && !btnGenerateDays.dataset.bound){
      btnGenerateDays.dataset.bound = '1';
      btnGenerateDays.addEventListener('click', () => {
        const s = readStartDate();
        const e = readEndDate();
        if(!s || !e){ alert(t('mp_select_dates') || 'Select start & end dates'); return; }

        const sd = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const ed = new Date(e.getFullYear(), e.getMonth(), e.getDate());
        if(ed < sd){ alert(t('mp_end_after_start') || 'End must be after start'); return; }

        state.days = [];
        let cur = toISO(sd);
        const endISO = toISO(ed);
        while(cur && cur <= endISO){
          state.days.push({ id: uid(), date: cur });
          cur = addDaysISO(cur, 1);
        }

        mapCitiesToDays();
        ensurePlan();
        renderCities();
        renderDaysPreview();
        renderPlan();
        showStep(0);
      });
    }

    // Add single day (auto date)
    if(btnAddDay && !btnAddDay.dataset.bound){
      btnAddDay.dataset.bound = '1';
      btnAddDay.addEventListener('click', (e) => {
        e.preventDefault();

        const lastISO = getLastDayISO();
        const startISO = toISO(readStartDate() || q('#mpStart')?.value || '');
        const newISO = lastISO
          ? addDaysISO(lastISO, 1)
          : (startISO ? addDaysISO(startISO, state.days.length) : addDaysISO(toISO(new Date()), state.days.length));

        state.days.push({ id: uid(), date: newISO });

        mapCitiesToDays();
        ensurePlan();
        renderDaysPreview();
        renderPlan();
      });
    }

    // City custom toggle
    const citySelect = document.getElementById('citySelect');
    const cityCustomWrap = document.getElementById('cityCustomWrap');
    citySelect?.addEventListener('change', () => {
      const isCustom = citySelect.value === '__custom__';
      cityCustomWrap?.classList.toggle('hidden', !isCustom);
    });

    // Add city
    document.getElementById('btnAddCity')?.addEventListener('click', () => {
      const sel = document.getElementById('citySelect');
      const nights = parseInt(document.getElementById('cityNights')?.value || '1', 10);
      if(!sel || !sel.value) return;

      let name = sel.value;
      if(name === '__custom__'){
        name = (document.getElementById('cityCustom')?.value || '').trim();
        if(!name) return;
      }

      state.cities.push({ id: uid(), name, nights: Math.max(1, nights) });

      // reset
      sel.selectedIndex = 0;
      const nightsEl = document.getElementById('cityNights');
      if(nightsEl) nightsEl.value = '';
      const cityCustom = document.getElementById('cityCustom');
      if(cityCustom){ cityCustom.value=''; cityCustomWrap?.classList.add('hidden'); }

      renderCities();
      mapCitiesToDays();
      ensurePlan();
      renderPlan();
    });

    // Clear cities
    document.getElementById('btnClearCities')?.addEventListener('click', () => {
      state.cities = [];
      renderCities();
      mapCitiesToDays();
      renderPlan();
    });

    // Finish => review
    document.getElementById('btnFinish')?.addEventListener('click', () => {
      ensurePlan();
      mapCitiesToDays();
      renderPlan();
      showReview();
    });

    // Init
    mapCitiesToDays();
    ensurePlan();
    renderCities();
    renderDaysPreview();
    renderPlan();
    showStep(0);
    updateToggleAllButton();
  });

})();

/* --------------------- Footer reveal animation --------------------- */
(function () {
  const revealables = document.querySelectorAll('[data-reveal]');
  const withStagger = (root) => {
    const items = root.querySelectorAll('li, a, p, h4, span');
    items.forEach((el, i) => el.style.setProperty('--rv-delay', (i * 60) + 'ms'));
  };

  if (!('IntersectionObserver' in window)) {
    revealables.forEach(el => { withStagger(el); el.classList.add('is-inview'); });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        withStagger(entry.target);
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealables.forEach(el => io.observe(el));
})();

// translation
 
// ===================== I18N Dictionaries =====================
/* ===================== I18N Dictionaries ===================== */
window.I18N = window.I18N || { en: {}, ar: {} };

Object.assign(I18N.en, {
  plan2_manual_title: "Manual Planning",

  mp_title:"Build your trip manually, step by step",
  mp_subtitle:"Pick dates, cities, and fill Morning/Afternoon/Evening activities. Lock any slot to keep it while you edit others.",
  mp_step_basics:"Basics", mp_step_cities:"Cities", mp_step_plan:"Plan",
  mp_btn_generate_days:"Generate days", mp_btn_add_day:"Add day", mp_next:"Next", mp_prev:"Back",
  mp_hint_days:"Tip: Generating days from your dates will create one entry per date.", mp_days_preview:"Days preview",
  mp_city_ph:"City name", mp_nights_ph:"Nights", mp_btn_add_city:"Add city", mp_btn_clear_cities:"Clear",
  mp_cities_route:"Your route",
  mp_expand_all:"Expand all", mp_collapse_all:"Collapse all", mp_finish:"Finish",
  mp_day_label:"Day", mp_morning:"Morning", mp_afternoon:"Afternoon", mp_evening:"Evening",
  mp_add_activity:"Add activity",
  mp_activity_ph:"Activity name (e.g., National Museum)",
  mp_time_ph:"Time (e.g., 10:30)",
  mp_note_ph:"Notes (ticket, phone, budget)",
  mp_lock:"Lock", mp_unlock:"Unlock", mp_delete:"Delete",
  mp_review_title:"Plan review", mp_review_sub:"Read-only summary", mp_review_close:"Close",
  mp_empty:"(empty)", mp_city:"City",
  mp_places_title:"Browse places", mp_places_sub:"Pick from categories or search", mp_places_close:"Close",
  mp_places_search_ph:"Search by name, city…", mp_places_visit:"Visit page", mp_places_add:"Add to plan",
  mp_places_tab_all:"All", mp_cat_restaurants:"Restaurants", mp_cat_cafes:"Cafés", mp_cat_parks:"Parks", mp_cat_supermarkets:"Supermarkets",
  mp_city_select_ph:"Select city",
  mp_city_custom_ph:"Custom city name",
  mp_city_other:"Other…",
  startDate:"Start date",
  endDate:"End date",
  // Added
  mp_up:"Up",
  mp_down:"Down",
  mp_added_to_cart:"Added to cart",
  mp_add_to_cart:"Add to cart"
});

Object.assign(I18N.ar, {
  plan2_manual_title: "تخطيط يدوي",
  mp_title:"ابنِ رحلتك يدويًا خطوة بخطوة",
  mp_subtitle:"اختر التواريخ والمدن، ثم املأ أنشطة الصباح/الظهر/المساء. يمكنك قفل أي خانة للحفاظ عليها أثناء تعديل البقية.",
  mp_step_basics:"الأساسيات", mp_step_cities:"المدن", mp_step_plan:"الخطة",
  mp_btn_generate_days:"إنشاء الأيام", mp_btn_add_day:"إضافة يوم", mp_next:"التالي", mp_prev:"السابق",
  mp_hint_days:"تلميح: إنشاء الأيام من التواريخ سيضيف يومًا واحدًا لكل تاريخ.", mp_days_preview:"معاينة الأيام",
  mp_city_ph:"اسم المدينة", mp_nights_ph:"ليالٍ", mp_btn_add_city:"إضافة مدينة", mp_btn_clear_cities:"تفريغ",
  mp_cities_route:"مسار رحلتك",
  mp_expand_all:"عرض الكل", mp_collapse_all:"طيّ الكل", mp_finish:"إنهاء",
  mp_day_label:"اليوم", mp_morning:"صباح", mp_afternoon:"ظهر", mp_evening:"مساء",
  mp_add_activity:"إضافة نشاط",
  mp_activity_ph:"اسم النشاط (مثال: المتحف الوطني)",
  mp_time_ph:"الوقت (مثال: 10:30)",
  mp_note_ph:"ملاحظات (تذكرة، هاتف، ميزانية)",
  mp_lock:"قفل", mp_unlock:"فتح", mp_delete:"حذف",
  mp_review_title:"مراجعة الخطة", mp_review_sub:"ملخص للقراءة فقط", mp_review_close:"إغلاق",
  mp_empty:"(فارغ)", mp_city:"المدينة",
  mp_places_title:"تصفح الأماكن", mp_places_sub:"اختر من التصنيفات أو ابحث", mp_places_close:"إغلاق",
  mp_places_search_ph:"ابحث بالاسم أو المدينة…", mp_places_visit:"زيارة الصفحة", mp_places_add:"إضافة للخطة",
  mp_places_tab_all:"الكل", mp_cat_restaurants:"مطاعم", mp_cat_cafes:"كافيهات", mp_cat_parks:"حدائق", mp_cat_supermarkets:"سوبر ماركت",
  mp_city_select_ph:"اختر المدينة",
  mp_city_custom_ph:"اسم مدينة أخرى",
  mp_city_other:"أخرى…",
  startDate:"تاريخ البدء",
  endDate:"تاريخ الانتهاء",

  // Added
  mp_up:"أعلى",
  mp_down:"أسفل",
  mp_added_to_cart:"أُضيفت إلى السلة",
  mp_add_to_cart:"أضف إلى السلة"
});

/* ===================== Translation Engine ===================== */
(function(){
  const html = document.documentElement;
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function getLang(){ return localStorage.getItem('lang') || 'en'; }
  function dictFor(lang){
    return (window.I18N && (window.I18N[lang] || window.I18N.en)) || {};
  }

  // Global tt() helper
  window.tt = function tt(key, fallback=''){
    const lang = getLang();
    const dict = dictFor(lang);
    if (key in dict) return dict[key];
    if (I18N?.en && key in I18N.en) return I18N.en[key];
    return fallback || key;
    // NOTE: this returns a *string* at render time; for dynamic language switching,
    // always use data-i18n / data-i18n-attr so translateIn() can update later.
  };

  function translateTextNodes(root, lang){
    const dict = dictFor(lang);
    $$('[data-i18n]', root).forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key in dict) el.textContent = dict[key];
    });
  }
  function translateAttrs(root, lang){
    const dict = dictFor(lang);
    $$('[data-i18n-attr]', root).forEach(el => {
      const map = el.getAttribute('data-i18n-attr')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      map.forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key && (key in dict)) el.setAttribute(attr, dict[key]);
      });
    });
  }
  function translateIn(root=document, lang=getLang()){
    translateTextNodes(root, lang);
    translateAttrs(root, lang);
  }
  function applyLang(lang){
    localStorage.setItem('lang', lang);
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    translateIn(document, lang);
  }

  // Expose
  window.translateIn = translateIn;
  window.applyLang   = applyLang;
  window.getLang     = getLang;

  function setupLangMenus(){
    const desktopBtn  = $('#langBtnDesktop');
    const desktopMenu = $('#langMenuDesktop');
    const mobileBtn   = $('#langBtnMobile');
    const mobileMenu  = $('#langMenuMobile');

    [desktopMenu, mobileMenu].forEach(m => m && m.classList.add('lang-menu'));

    const toggle = (btn, menu) => {
      if (!btn || !menu) return;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        $$('.lang-menu').forEach(m => m.classList.add('hidden'));
        menu.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
      });
    };
    toggle(desktopBtn, desktopMenu);
    toggle(mobileBtn,  mobileMenu);

    document.addEventListener('click', () => {
      $$('.lang-menu').forEach(m => m.classList.add('hidden'));
      desktopBtn && desktopBtn.setAttribute('aria-expanded','false');
      mobileBtn && mobileBtn.setAttribute('aria-expanded','false');
    });

    $$('#langMenuDesktop [data-lang], #langMenuMobile [data-lang]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const lang = a.getAttribute('data-lang');
        applyLang(lang);
        $$('.lang-menu').forEach(m => m.classList.add('hidden'));
        desktopBtn && desktopBtn.setAttribute('aria-expanded','false');
        mobileBtn && mobileBtn.setAttribute('aria-expanded','false');
      });
    });
  }

  function setupNavbar(){
    const items = document.querySelectorAll('.nav-item');
    items.forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('opacity-0','translate-y-2');
        el.classList.add('opacity-100','translate-y-0');
      }, i * 200);
    });

    const navToggle  = $('#navToggle');
    const mobileMenu = $('#mobileMenu');
    if (navToggle && mobileMenu) {
      const links = mobileMenu.querySelectorAll('a');
      navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', (!expanded).toString());
      });
      links.forEach(link => link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        navToggle.setAttribute('aria-expanded', 'false');
      }));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    setupLangMenus();
    applyLang(getLang()); // Apply saved language (default EN)
  });
})();
