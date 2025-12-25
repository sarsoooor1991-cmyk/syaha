 

/* ---------------------- Step 1  --------------------- */
(() => {
  const els = Array.from(document.querySelectorAll('.anim-fadeUp'));
  if (!('IntersectionObserver' in window) || !els.length) return;

  els.forEach(el => { el.style.animationPlayState = 'paused'; el.style.opacity = 0; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({isIntersecting, target}) => {
      if (isIntersecting) {
        target.style.opacity = '';
        target.style.animationPlayState = 'running';
        io.unobserve(target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();

/* ---------------------- MAIN (Wizard) ---------------------- */
(() => {

  /* ===================== I18N (FULL DICTIONARY) ===================== */
  const I18N = {
    en: {
      // Header / Wizard
      badge: "✈️ Trip Wizard",
      title: "Smart trip planner: Balance your energy and budget",
      subtitle: "Pick dates, travel energy, and cities; get a balanced day-by-day plan you can lock & regenerate.",
      subtitleInline: "(Morning / Afternoon / Evening)",

      // Stepper
      stepBasics: "Basics", stepCities: "Cities", stepPrefs: "Preferences",

      // Dates
      startDate: "Start date", endDate: "End date",
      phStartDate: "Select start date", phEndDate: "Select end date",

      // Energy
      energyLabel: "Daily activity level",
      lightPlan: "Light Plan", balancedPlan: "Balanced Plan", intensePlan: "Intense Plan",

      // Group
      partyLabel: "Who are you traveling with?", solo: "Solo", friends: "Friends", family: "Family", couple: "Couple",

      // Buttons / Generic
      next: "Next", back: "Back", addCity: "+ Add city", generate: "Generate itinerary",
      generateBtn: "Generate itinerary", yourItinerary: "Your itinerary", reset: "Reset",

      // Labels / Help
      chooseCity: "Choose city",
      interests: "Interests (influence activity picks)",
      interestsLabel: "Interests (influence activity picks)",
      budget: "Budget (SAR)", budgetLabel: "Budget (SAR)", phBudget: "e.g., 8000", currencySAR: "SAR",

      // Output section
      itineraryTitle: "Your itinerary",
      resetBtn: "Reset",
      durationTxt: "Duration",
      dayLabel: "Day",
      addDaySameCity: "Add day in this city",
      removeDay: "Remove",
      regenerateDay: "Regenerate",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",

      // Interests chips
      interest_culture: "Culture",
      interest_food: "Food",
      interest_coffee: "Coffee & tea",
      interest_nature: "Nature",
      interest_stays: "Elegant stays",
      interest_adventure: "Adventure",
      interest_shopping: "Shopping",

      results_icon_alt: "Section icon",
      rest_img_alt: "Restaurant",

      footer_categories: "All Categories",
      footer_restaurants: "Restaurants",
      footer_cafe: "Cafe",
      footer_supermarkets: "Supermarket",
      footer_hotels: "Hotels",

      footer_contact: "Contact",
      footer_email: "Email: Support123@gmail.com",
      footer_phone1: "Phone 1: 12345678",
      footer_phone2: "Phone 2: 3455765433345",

      footer_policies: "Policies",
      footer_guidelines: "Community Guidelines",
      footer_terms: "Terms of Use",
      footer_privacy: "Privacy Policy",

      footer_download: "Download Our App",
      footer_download_desc: "Get the Latest Version of our Apps",
      footer_rights: "© 2025 Siyahatna. All rights reserved.",

      footer_logo_alt: "Siyahatna logo",
      footer_google_alt: "Get it on Google Play",
      footer_apple_alt: "Download on the App Store",
    },

    ar: {
      // Header / Wizard
      badge: "✈️ مُخطِّط الرحلات",
      title: "مُخطِّط رحلات ذكي يوازن بين طاقتك وميزانيتك",
      subtitle: "اختر التواريخ، مستوى النشاط، والمدن؛ واحصل على خطة يومية متوازنة مع إمكانية القفل وإعادة التوليد.",
      subtitleInline: "(صباح / بعد الظهر / مساء)",

      // Stepper
      stepBasics: "الأساسيات", stepCities: "المدن", stepPrefs: "التفضيلات",

      // Dates
      startDate: "تاريخ البداية", endDate: "تاريخ النهاية",
      phStartDate: "اختر تاريخ البداية", phEndDate: "اختر تاريخ النهاية",

      // Energy
      energyLabel: "مستوى النشاط اليومي",
      lightPlan: "خطة خفيفة", balancedPlan: "خطة متوازنة", intensePlan: "خطة مكثفة",

      // Group
      partyLabel: "ستسافر مع من؟", solo: "فردي", friends: "أصدقاء", family: "عائلة", couple: "ثنائي",

      // Buttons / Generic
      next: "التالي", back: "رجوع", addCity: "+ إضافة مدينة", generate: "ولّد الخطة",
      generateBtn: "إنشاء برنامج الرحلة", yourItinerary: "برنامج رحلتك", reset: "إعادة الضبط",

      // Labels / Help
      chooseCity: "اختر مدينة",
      interests: "الاهتمامات (تؤثر على اختيار الأنشطة)",
      interestsLabel: "الاهتمامات (تؤثر على اختيار الأنشطة)",
      budget: "الميزانية (ر.س)", budgetLabel: "الميزانية (ر.س)", phBudget: "مثال: ٨٠٠٠", currencySAR: "ر.س",

      // Output section
      itineraryTitle: "برنامج رحلتك",
      resetBtn: "إعادة تعيين",
      durationTxt: "المدة",
      dayLabel: "اليوم",
      addDaySameCity: "إضافة يوم في نفس المدينة",
      removeDay: "إزالة",
      regenerateDay: "إعادة التوليد",
      morning: "صباحًا",
      afternoon: "بعد الظهر",
      evening: "مساءً",

      // Interests chips
      interest_culture: "ثقافة",
      interest_food: "طعام",
      interest_coffee: "قهوة وشاي",
      interest_nature: "طبيعة",
      interest_stays: "إقامات فاخرة",
      interest_adventure: "مغامرة",
      interest_shopping: "تسوق",

      results_icon_alt: "أيقونة القسم",
      rest_img_alt: "مطعم",

      footer_categories: "كل الفئات",
      footer_restaurants: "مطاعم",
      footer_cafe: "مقاهي",
      footer_supermarkets: "سوبر ماركت",
      footer_hotels: "فنادق",

      footer_contact: "تواصل معنا",
      footer_email: "البريد: Support123@gmail.com",
      footer_phone1: "الهاتف 1: 12345678",
      footer_phone2: "الهاتف 2: 3455765433345",

      footer_policies: "السياسات",
      footer_guidelines: "إرشادات المجتمع",
      footer_terms: "شروط الاستخدام",
      footer_privacy: "سياسة الخصوصية",

      footer_download: "حمّل تطبيقنا",
      footer_download_desc: "احصل على أحدث إصدار من تطبيقاتنا",
      footer_rights: "© 2025 سياحتنا. جميع الحقوق محفوظة.",

      footer_logo_alt: "شعار سياحتنا",
      footer_google_alt: "متاح على Google Play",
      footer_apple_alt: "حمّل من App Store"
    }
  };

  /* ================== Helpers ================== */
  const html = document.documentElement;
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const uid = () => (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2,10));

  const getLang = () => localStorage.getItem("lang") || "en";

  function translateIn(root, lang){
    const dict = I18N[lang] || I18N.en;
    root.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
  }

  function applyLang(lang){
    localStorage.setItem("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
    translateIn(document, lang);
  }

  /* ================== ISO Date utils (Backend-friendly) ================== */
  const isISO = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s||''));
  const toISO = (dateLike) => {
    const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  const addDaysISO = (iso, n=1) => {
    const base = new Date(String(iso) + "T00:00:00");
    base.setDate(base.getDate() + n);
    return toISO(base);
  };
  const daysBetweenInclusive = (startISO, endISO) => {
    const s = new Date(startISO + "T00:00:00");
    const e = new Date(endISO   + "T00:00:00");
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    return Math.floor((e - s)/(1000*60*60*24)) + 1;
  };
  const fmtDateLocalFromISO = (iso, lang=getLang()) => {
    const d = new Date(iso + "T00:00:00");
    const locales = (lang === "ar") ? "ar-SA" : "en-US";
    return new Intl.DateTimeFormat(locales, { year: "numeric", month: "long", day: "numeric" }).format(d);
  };

  /* ================== Backend-friendly State ================== */
  const state = (window.TripWizardState = window.TripWizardState || {});
  state.lang = state.lang || getLang();

  // Core backend data:
  state.cities    = Array.isArray(state.cities) ? state.cities : [];     // [{id,name,days}]
  state.days      = Array.isArray(state.days)   ? state.days   : [];     // [{id,date,cityId}]
  // UI selections:
  state.energy    = state.energy || "2";
  state.budget    = state.budget || "";
  state.interests = Array.isArray(state.interests) ? state.interests : [];

  /* ================== Backend API ==================
     hydrateTripWizard(payload):
       - payload.cities: [{id?,name,days}]
       - payload.days:   [{id?,date,cityId}]
       - OR payload.startDate/endDate + cities -> generates days
     exportTripWizard(): returns payload for API
  =================================================== */
  window.hydrateTripWizard = function(payload){
    if (!payload || typeof payload !== "object") return;

    if (payload.lang) {
      state.lang = payload.lang;
      applyLang(state.lang);
    }

    if (payload.energy != null) state.energy = String(payload.energy);
    if (payload.budget != null) state.budget = String(payload.budget);
    if (Array.isArray(payload.interests)) state.interests = payload.interests.map(x=>String(x));

    if (Array.isArray(payload.cities)) {
      state.cities = payload.cities
        .map(c => ({
          id: c.id || uid(),
          name: String(c.name || '').trim(),
          days: Math.max(1, parseInt(c.days ?? c.nights ?? 1, 10))
        }))
        .filter(c => c.name);
      syncCitiesToUI();
    }

    if (Array.isArray(payload.days)) {
      state.days = payload.days
        .map(d => ({
          id: d.id || uid(),
          date: isISO(d.date) ? d.date : toISO(d.date),
          cityId: d.cityId || null
        }))
        .filter(d => d.date);
      syncDatesUIFromState();
      syncEnergyToUI();
      syncBudgetToUI();
      syncInterestsToUI();
      renderFromState();
      return;
    }

    // Range-based hydration
    const sISO = payload.startDate ? (isISO(payload.startDate) ? payload.startDate : toISO(payload.startDate)) : getStartISOFromUI();
    const eISO = payload.endDate   ? (isISO(payload.endDate)   ? payload.endDate   : toISO(payload.endDate))   : getEndISOFromUI();

    if (isISO(sISO) && isISO(eISO) && state.cities.length) {
      setDatesUI(sISO, eISO);
      buildDaysFromRangeAndCities(sISO, eISO);
      syncEnergyToUI();
      syncBudgetToUI();
      syncInterestsToUI();
      renderFromState();
    }
  };

  window.exportTripWizard = function(){
    return {
      lang: state.lang,
      startDate: getStartISOFromUI(),
      endDate: getEndISOFromUI(),
      energy: state.energy,
      budget: state.budget,
      interests: [...state.interests],
      cities: state.cities.map(c => ({ id:c.id, name:c.name, days:c.days })),
      days: state.days.map(d => ({ id:d.id, date:d.date, cityId:d.cityId }))
    };
  };

  /* ================== Language Menus (same selectors) ================== */
  function setupLangMenus(){
    $("#langMenuDesktop")?.classList.add("lang-menu");
    $("#langMenuMobile")?.classList.add("lang-menu");

    const toggle = (btnSel, menuSel) => {
      const btn = $(btnSel), menu = $(menuSel);
      if(!btn || !menu) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        $$(".lang-menu").forEach(m => m.classList.add("hidden"));
        menu.classList.toggle("hidden");
      });
    };
    toggle("#langBtnDesktop", "#langMenuDesktop");
    toggle("#langBtnMobile", "#langMenuMobile");

    $$('#langMenuDesktop [data-lang], #langMenuMobile [data-lang]').forEach(a=>{
      a.addEventListener("click", (e)=>{
        e.preventDefault();
        const lang = a.getAttribute("data-lang") || "en";
        state.lang = lang;
        applyLang(lang);
        $$(".lang-menu").forEach(m => m.classList.add("hidden"));
        renderFromState();
      });
    });

    document.addEventListener("click", ()=> $$(".lang-menu").forEach(m=> m.classList.add("hidden")));
  }

  /* ================== Stepper (same selectors) ================== */
  const steps = $$('.step');
  const dots  = $$('.step-dot');
  let stepIdx = 0;

  const goStep = (i) => {
    stepIdx = Math.max(0, Math.min(i, steps.length-1));
    steps.forEach((el, idx) => el.classList.toggle('hidden', idx !== stepIdx));
    dots.forEach((d, idx) => {
      d.classList.toggle('bg-teal-600', idx <= stepIdx);
      d.classList.toggle('text-white',  idx <= stepIdx);
      d.classList.toggle('bg-gray-200', idx >  stepIdx);
      d.classList.toggle('text-gray-700', idx > stepIdx);
    });
  };

  /* ================== Cities (Step 2) ================== */
  const addBtn   = $('#addCity');
  const rowsWrap = $('#cityRows');
  const cityTpl  = $('#cityTpl');

  const addCityRow = (name='', days=1) => {
    const node = cityTpl.content.firstElementChild.cloneNode(true);
    const nameInp = $('.cityName', node);
    const daysInp = $('.cityDays', node);
    const inc = $('.incDay', node);
    const dec = $('.decDay', node);
    const rm  = $('.rmCity', node);

    nameInp.value = name;
    daysInp.value = Math.max(1, parseInt(days||1,10));

    const onAnyChange = () => syncCitiesFromUI();

    inc.addEventListener('click', () => { daysInp.value = (parseInt(daysInp.value||'1',10)+1); onAnyChange(); });
    dec.addEventListener('click', () => {
      const v = Math.max(1, parseInt(daysInp.value||'1',10)-1);
      daysInp.value = v;
      onAnyChange();
    });
    daysInp.addEventListener('input', () => {
      const v = parseInt((daysInp.value||'').replace(/\D/g,'' ) || '1',10);
      daysInp.value = Math.max(1, v);
      onAnyChange();
    });
    nameInp.addEventListener('input', onAnyChange);

    rm.addEventListener('click', () => { node.remove(); onAnyChange(); });

    rowsWrap.appendChild(node);
    syncCitiesFromUI();
  };

  function syncCitiesFromUI(){
    const rows = $$('#cityRows > div');
    const next = [];
    rows.forEach(r => {
      const name = ($('.cityName', r)?.value || '').trim();
      const days = Math.max(1, parseInt($('.cityDays', r)?.value || '1', 10));
      if (name) next.push({ id: uid(), name, days });
    });

    // Keep IDs stable by position if possible
    const prev = state.cities || [];
    state.cities = next.map((c, i) => ({
      id: prev[i]?.id || c.id,
      name: c.name,
      days: c.days
    }));
  }

  function syncCitiesToUI(){
    if(!rowsWrap || !cityTpl) return;
    rowsWrap.innerHTML = '';
    const list = state.cities.length ? state.cities : [{ id:uid(), name:'Riyadh', days:1 }];
    list.forEach(c => addCityRow(c.name, c.days));
  }

  /* ================== Interests (Step 3) ================== */
  const bindInterests = () => {
    $$('#interestWrap .interest').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('!bg-teal-600');
        btn.classList.toggle('!text-white');
        btn.classList.toggle('!border-teal-600');
        btn.classList.toggle('ring-2');
        btn.classList.toggle('ring-teal-300');
        syncInterestsFromUI();
      });
    });
  };

  function syncInterestsFromUI(){
    state.interests = $$('#interestWrap .interest')
      .filter(b => b.classList.contains('!bg-teal-600'))
      .map(b => b.textContent.trim());
  }

  function syncInterestsToUI(){
    const selected = new Set((state.interests||[]).map(s=>String(s).trim()));
    $$('#interestWrap .interest').forEach(btn => {
      const on = selected.has(btn.textContent.trim());
      btn.classList.toggle('!bg-teal-600', on);
      btn.classList.toggle('!text-white', on);
      btn.classList.toggle('!border-teal-600', on);
      btn.classList.toggle('ring-2', on);
      btn.classList.toggle('ring-teal-300', on);
    });
  }

  /* ================== Output & Templates ================== */
  const outWrap       = $('#outWrap');
  const daysContainer = $('#daysContainer');
  const durationTxt   = $('#durationTxt');
  const dayCardTpl    = $('#dayCardTpl');
  const resetAll      = $('#resetAll');
  const energyEl      = $('#energy');
  const budgetEl      = $('#budget') || $('#budgetInput') || null;

  function syncEnergyFromUI(){ state.energy = String(energyEl?.value || "2"); }
  function syncEnergyToUI(){ if(energyEl) energyEl.value = state.energy || "2"; }

  function syncBudgetFromUI(){ if(budgetEl) state.budget = String(budgetEl.value || ''); }
  function syncBudgetToUI(){ if(budgetEl) budgetEl.value = state.budget || ''; }

  /* ================== Dates UI ================== */
  const sInput = $('#sDate');
  const eInput = $('#eDate');

  function getStartISOFromUI(){
    const v = (sInput?.value || '').trim();
    return isISO(v) ? v : toISO(v);
  }
  function getEndISOFromUI(){
    const v = (eInput?.value || '').trim();
    return isISO(v) ? v : toISO(v);
  }
  function setDatesUI(startISO, endISO){
    if (sInput) sInput.value = startISO;
    if (eInput) eInput.value = endISO;
  }
  function syncDatesUIFromState(){
    if(!state.days.length) return;
    const sorted = [...state.days].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    setDatesUI(sorted[0].date, sorted[sorted.length-1].date);
  }

  /* ================== Pools (FIXED typo: Coffee & tea) ================== */
  const BASE_POOL = {
    Culture:   ['Heritage quarter walk', 'Local museum visit', 'Historic market stroll', 'Art gallery stop'],
    Food:      ['Local breakfast spot', 'Popular lunch eatery', 'Dessert café', 'Street food corner'],
    'Coffee & tea': ['Specialty coffee bar', 'Teahouse break', 'Coffee roastery tour', 'Modern café'],
    Nature:    ['City park walk', 'Scenic viewpoint', 'Lakeside stroll', 'Botanical garden'],
    'Elegant stays': ['Hotel lounge tea', 'Rooftop view time', 'Spa hour', 'Poolside unwind'],
    Adventure: ['Light hike', 'Bike ride', 'Kayak / boat ride', 'Zipline / ropes (if avail)'],
    Shopping:  ['Modern mall', 'Local craft market', 'Souvenir arcade', 'Design concept store']
  };

  const cityFlavor = (city) => [
    `${city} old-town corners`,
    `${city} signature café`,
    `${city} skyline viewpoint`,
    `${city} night promenade`
  ];

  const DEFAULT_SLOT = {
    morning:   ['Breakfast & gentle walk', 'Photo spots'],
    afternoon: ['Main attraction + lunch'],
    evening:   ['Sunset view + dinner']
  };

  const slotSizeByEnergy = (val) => {
    const v = parseInt(val||'2',10); // 1 light / 2 balanced / 3 intense
    return v === 1 ? 1 : (v === 3 ? 3 : 2);
  };

  const pickForSlot = (slot, interests, city, energyVal) => {
    const size = slotSizeByEnergy(energyVal);
    const pool = [];

    (interests || []).forEach(k => { if (BASE_POOL[k]) pool.push(...BASE_POOL[k]); });
    pool.push(...cityFlavor(city));
    if (!interests || !interests.length) pool.push(...(DEFAULT_SLOT[slot] || []));

    const bag = [...new Set(pool)];
    const chosen = [];
    for (let i=0;i<size && bag.length;i++){
      const idx = Math.floor(Math.random()*bag.length);
      chosen.push(bag.splice(idx,1)[0]);
    }
    return chosen;
  };

  const renumberDays = () => {
    const cards = $$('.day-card', daysContainer);
    cards.forEach((c, idx) => { $('.dNum', c).textContent = idx+1; });
  };

  /* ================== Build days from range+cities (ISO) ================== */
  function buildDaysFromRangeAndCities(startISO, endISO){
    const totalDays = daysBetweenInclusive(startISO, endISO);
    if (!totalDays) return;

    const cities = (state.cities || []).filter(c=>c.name);
    if (!cities.length) return;

    // Normalize city days to totalDays
    let sum = cities.reduce((a,c)=>a + (c.days||1), 0);

    if (sum < totalDays) {
      let i = 0;
      while (sum < totalDays) { cities[i % cities.length].days += 1; sum++; i++; }
    } else if (sum > totalDays) {
      let i = 0;
      while (sum > totalDays) {
        const c = cities[i % cities.length];
        if (c.days > 1) { c.days -= 1; sum--; }
        i++;
      }
    }

    // Build city cycle by cityId
    const cityCycle = [];
    cities.forEach(c => { for(let i=0;i<c.days;i++) cityCycle.push(c.id); });

    // Build days
    state.days = [];
    let cur = startISO;
    for(let i=0;i<totalDays;i++){
      state.days.push({ id: uid(), date: cur, cityId: cityCycle[i % cityCycle.length] });
      cur = addDaysISO(cur, 1);
    }

    // Save cities back
    state.cities = cities;
    syncCitiesToUI();
  }

  /* ================== Day card (ISO-based, backend-safe) ================== */
  const makeDayCard = (dayIndex, dayObj) => {
    const node = dayCardTpl.content.firstElementChild.cloneNode(true);

    // Translate card immediately
    translateIn(node, getLang());

    const cityName = state.cities.find(c=>c.id === dayObj.cityId)?.name || '';

    $('.dNum',  node).textContent = dayIndex + 1;
    $('.dCity', node).textContent = cityName;
    $('.dDate', node).textContent = fmtDateLocalFromISO(dayObj.date);

    const interests = state.interests || [];
    const energyVal = state.energy || (energyEl?.value || '2');

    const fillSlot = (ulSel, slot) => {
      const ul = $(ulSel, node);
      ul.innerHTML = '';
      const items = pickForSlot(slot, interests, cityName, energyVal);
      items.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
    };

    const regen = () => {
      fillSlot('.morning',   'morning');
      fillSlot('.afternoon', 'afternoon');
      fillSlot('.evening',   'evening');
    };

    regen();

    $('.regenDay', node).addEventListener('click', regen);

    $('.removeDay', node).addEventListener('click', () => {
      const idx = state.days.findIndex(d=>d.id === dayObj.id);
      if (idx > -1) state.days.splice(idx,1);
      renderFromState();
    });

    $('.addSameCity', node).addEventListener('click', () => {
       
      const idx = state.days.findIndex(d=>d.id === dayObj.id);
      if (idx < 0) return;

      state.days.splice(idx+1, 0, { id: uid(), date: dayObj.date, cityId: dayObj.cityId });

       
      const startISO = state.days[0]?.date;
      if (startISO) {
        let cur = startISO;
        state.days = state.days.map((d, i) => {
          const out = { ...d, date: cur };
          cur = addDaysISO(cur, 1);
          return out;
        });
      }

      renderFromState();
    });

    return node;
  };

  function renderFromState(){
    if (!outWrap || !daysContainer) return;

    // show/hide output
    outWrap.classList.toggle('hidden', !state.days.length);
    daysContainer.innerHTML = '';

    if (!state.days.length) return;

    // sort days by date just in case
    state.days.sort((a,b)=>String(a.date).localeCompare(String(b.date)));

    const lang = getLang();
    const dict = I18N[lang] || I18N.en;

    const startISO = state.days[0].date;
    const endISO   = state.days[state.days.length-1].date;

    durationTxt.textContent =
      (lang === 'ar')
        ? `${dict.durationTxt}: ${state.days.length} يوم • ${fmtDateLocalFromISO(startISO, lang)} → ${fmtDateLocalFromISO(endISO, lang)}`
        : `${dict.durationTxt}: ${state.days.length} day(s) • ${fmtDateLocalFromISO(startISO, lang)} → ${fmtDateLocalFromISO(endISO, lang)}`;

    state.days.forEach((d, i) => daysContainer.appendChild(makeDayCard(i, d)));
    renumberDays();
  }

  /* ================== Generate (Backend-friendly) ================== */
  const bindGenerate = () => {
    $('#generate')?.addEventListener('click', () => {

      // Sync UI selections to state
      syncCitiesFromUI();
      syncInterestsFromUI();
      syncEnergyFromUI();
      syncBudgetFromUI();

      const sISO = getStartISOFromUI();
      const eISO = getEndISOFromUI();

      if (!isISO(sISO) || !isISO(eISO)) {
        alert(getLang()==='ar' ? 'من فضلك أدخل تاريخي بدء/نهاية صحيحين.' : 'Please enter valid start/end dates.');
        return;
      }
      if (eISO < sISO) {
        alert(getLang()==='ar' ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.' : 'End date must be after start date.');
        return;
      }
      if (!state.cities.length) {
        alert(getLang()==='ar' ? 'أضف مدينة واحدة على الأقل.' : 'Please add at least one city.');
        return;
      }

      buildDaysFromRangeAndCities(sISO, eISO);
      renderFromState();
      goStep(2);
    });
  };

  /* ================== Reset ================== */
  const bindReset = () => {
    resetAll?.addEventListener('click', () => {
      state.days = [];
      renderFromState();
      goStep(0);
    });
  };

  /* ================== Flatpickr ================== */
  const initCalendars = () => {
    if (typeof flatpickr !== 'function') return;

    const isRTL = (getLang() === 'ar') || (html.getAttribute('dir') === 'rtl');
    const commonOpts = {
      minDate: 'today',
      dateFormat: 'Y-m-d',   
      altInput: true,
      altFormat: 'd M Y',     
      allowInput: true,
      locale: isRTL ? (window.Flatpickr?.l10ns?.ar || null) : undefined,
      disableMobile: true
    };

    const sPicker = flatpickr('#sDate', {
      ...commonOpts,
      onChange: (_, dateStr) => {
        if (ePicker) {
          ePicker.set('minDate', dateStr || 'today');
          if (!ePicker.input.value) ePicker.setDate(dateStr, true);
        }
      }
    });
    var ePicker = flatpickr('#eDate', { ...commonOpts });

    const sVal = sPicker?.input?.value;
    if (sVal && ePicker) ePicker.set('minDate', sVal);
  };

  /* ================== Navbar (same as you had) ================== */
  const bindNavbar = () => {
    const items = document.querySelectorAll(".nav-item");
    items.forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove("opacity-0", "translate-y-2");
        el.classList.add("opacity-100", "translate-y-0");
      }, i * 200);
    });

    const navToggle  = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    if (navToggle && mobileMenu) {
      const mobileLinks = mobileMenu.querySelectorAll("a");
      navToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", (!expanded).toString());
      });
      mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
          mobileMenu.classList.add("hidden");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  };

  /* ================== Init ================== */
  document.addEventListener('DOMContentLoaded', () => {

    // Apply lang
    applyLang(state.lang || getLang());

    // Stepper buttons
    $$('.next').forEach(b => b.addEventListener('click', () => goStep(stepIdx+1)));
    $$('.prev').forEach(b => b.addEventListener('click', () => goStep(stepIdx-1)));
    goStep(0);

    // Default city row
    if (!rowsWrap?.children?.length) addCityRow('Riyadh', 2);
    addBtn?.addEventListener('click', () => addCityRow('', 1));

    // Interests
    bindInterests();

    // Language menus
    setupLangMenus();

    // Flatpickr
    initCalendars();

    // Generate / Reset
    bindGenerate();
    bindReset();

    // Navbar
    bindNavbar();

    // Sync UI selections and render 
    syncEnergyToUI();
    syncBudgetToUI();
    syncInterestsToUI();
    syncCitiesToUI();
    if (state.days.length) {
      syncDatesUIFromState();
      renderFromState();
    }

    // Live updates
    energyEl?.addEventListener('change', () => { syncEnergyFromUI(); renderFromState(); });
    budgetEl?.addEventListener('input', () => { syncBudgetFromUI(); });

  });

})();

/* ---------------------- FOOTER animation  ---------------------- */
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

 