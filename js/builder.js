/* LedgeRays Systems — interactive hero "Build Your System"
   CSS Grid layouts · FLIP glide animation · drag-and-drop (mouse, pen, touch) · tap-to-swap
   Edit the INDUSTRIES list below to change the tabs, modules and layouts. */
(function () {
  'use strict';

  var grid = document.getElementById('lbGrid');
  if (!grid) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOTS = ['a', 'b', 'c', 'd', 'e'];
  var TOUR_MS = 4200;

  /* Each industry: tab label, icon, matching design in Our Work (index), grid areas (3 x 3, letters a–e),
     and 5 modules: [name, short description, visual, value (for "kpi"), code name]
     Visuals: kpi · bars · list · donut · cal */
  var INDUSTRIES = [
    { label: 'Lending', icon: 'i-wallet', design: 0, areas: ['a a b', 'c c b', 'd e b'], mods: [
      ['Portfolio Dashboard', 'Collections vs target', 'kpi', '₱8.43M', 'dashboard'],
      ['Borrowers', 'Profiles and co-makers', 'list', '', 'borrowers'],
      ['Loan Ledger', 'Amortization and balances', 'bars', '', 'ledger'],
      ['Past Due', 'Aging and follow-ups', 'donut', '', 'past-due'],
      ['Collectors', 'Remittance and ranking', 'list', '', 'collectors']] },
    { label: 'Auto & Moto', icon: 'i-wrench', design: 1, areas: ['a b c', 'a d d', 'a e e'], mods: [
      ['Job Order Board', 'From pending to released', 'list', '', 'job-orders'],
      ['Parts Stock', 'Low-stock alerts', 'bars', '', 'parts'],
      ['Mechanics', 'Commissions and vale', 'list', '', 'mechanics'],
      ['Shop Overview', 'Today at a glance', 'kpi', '27 jobs', 'overview'],
      ['Charge Accounts', 'Fleet and regulars', 'donut', '', 'accounts']] },
    { label: 'Rentals', icon: 'i-home', design: 2, areas: ['a a a', 'b c d', 'e e d'], mods: [
      ['Unit Map', 'Paid, due and vacant units', 'cal', '', 'unit-map'],
      ['Tenants', 'Leases and deposits', 'list', '', 'tenants'],
      ['Billing', 'Rent, water and electric', 'bars', '', 'billing'],
      ['Occupancy', 'Units filled this month', 'donut', '', 'occupancy'],
      ['Meter Readings', 'Monthly usage', 'kpi', '4,958 kWh', 'meters']] },
    { label: 'Schools', icon: 'i-cap', design: 3, areas: ['a b b', 'a c d', 'e e d'], mods: [
      ['Students', 'Records per learner', 'list', '', 'students'],
      ['Enrollment', 'By grade level', 'bars', '', 'enrollment'],
      ['Student Accounts', 'Fees and installments', 'kpi', '486 enrolled', 'accounts'],
      ['Cashier Report', 'Daily totals', 'donut', '', 'cashier'],
      ['Reminders', 'Notices to parents', 'cal', '', 'reminders']] },
    { label: 'Contractors', icon: 'i-hat', design: 4, areas: ['a b b', 'a c c', 'd d e'], mods: [
      ['Projects', 'Contracts and progress', 'list', '', 'projects'],
      ['Progress Billing', 'Retention and recoupment', 'kpi', '7 sites', 'billing'],
      ['Project Timeline', 'Every site, every phase', 'bars', '', 'timeline'],
      ['Materials', 'Cost vs budget', 'donut', '', 'materials'],
      ['Payroll', 'Weekly crew pay', 'list', '', 'payroll']] },
    { label: 'Wholesale', icon: 'i-truck', design: 5, areas: ['a a b', 'c d b', 'c e e'], mods: [
      ['Store Dashboard', 'Credit sales vs collections', 'bars', '', 'dashboard'],
      ['Charge Accounts', 'Terms and running ledger', 'list', '', 'accounts'],
      ['Deliveries', 'Drops and receipts', 'cal', '', 'deliveries'],
      ['Inventory', 'Low-stock alerts', 'donut', '', 'inventory'],
      ['Suppliers', 'Payables and due dates', 'kpi', '4 suppliers', 'suppliers']] },
    { label: 'Events', icon: 'i-cal', design: 6, areas: ['a a b', 'a a c', 'd e e'], mods: [
      ['Booking Calendar', 'Every event this month', 'cal', '', 'calendar'],
      ['Upcoming Events', 'Next 7 days', 'list', '', 'upcoming'],
      ['Packages', 'Per-pax pricing', 'kpi', '4 active', 'packages'],
      ['Event Types', 'Weddings, debuts and more', 'donut', '', 'event-types'],
      ['Deposits & Balances', 'From reservation to full', 'bars', '', 'deposits']] },
    { label: 'Organizations', icon: 'i-heart', design: 7, areas: ['a b c', 'd d c', 'd d e'], mods: [
      ['Members', 'Families and ministries', 'list', '', 'members'],
      ['Giving', 'Tithes and offerings', 'kpi', '368 members', 'giving'],
      ['Project Funds', 'Goals and progress', 'donut', '', 'funds'],
      ['Giving Trend', 'Month by month', 'bars', '', 'trend'],
      ['Dues', 'Monthly dues', 'cal', '', 'dues']] },
    { label: 'Solar', icon: 'i-sun', design: 8, areas: ['a a b', 'c d b', 'e e e'], mods: [
      ['Revenue vs Job Cost', 'Margin per month', 'bars', '', 'revenue'],
      ['Projects by Stage', 'Contract to commissioned', 'donut', '', 'stages'],
      ['Solar Calculator', 'System size and quotes', 'kpi', '8.2 kWp', 'calculator'],
      ['Install Calendar', 'Site visits and installs', 'cal', '', 'calendar'],
      ['Clients & Leads', 'Inquiries and follow-ups', 'list', '', 'clients']] }
  ];

  var state = { ind: 0, asg: identity(), fr: 2, gap: 12, picked: null, tour: !reduce };
  function identity() { var m = {}; SLOTS.forEach(function (s) { m[s] = s; }); return m; }

  /* ---------- build DOM ---------- */
  var tabsEl = document.getElementById('lbTabs');
  tabsEl.innerHTML = INDUSTRIES.map(function (it, i) {
    return '<button type="button" class="lb-tab" role="tab" id="lbTab' + i + '" data-i="' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" aria-controls="lbGrid"><svg class="ic"><use href="#' + it.icon + '"/></svg>' + it.label + '</button>';
  }).join('');
  var tabs = Array.prototype.slice.call(tabsEl.children);

  grid.innerHTML = SLOTS.map(function (s, i) {
    return '<button type="button" class="lb-b s' + (i + 1) + '" data-slot="' + s + '" aria-pressed="false"><span class="lb-in"></span></button>';
  }).join('');
  var blocks = Array.prototype.slice.call(grid.children);

  function viz(type, val, seed) {
    var r = function (n) { return 30 + ((seed * 37 + n * 53) % 70); };
    if (type === 'kpi') return '<span class="viz-kpi"><b>' + val + '</b><small>▲ ' + (4 + seed % 9) + '% this month</small></span>';
    if (type === 'bars') { var b = ''; for (var i = 0; i < 7; i++) b += '<i style="--h:' + r(i) + '%"></i>'; return '<span class="viz-bars">' + b + '</span>'; }
    if (type === 'list') return '<span class="viz-list"><i style="--w:' + r(1) + '%"></i><i style="--w:' + r(2) + '%"></i><i style="--w:' + r(3) + '%"></i></span>';
    if (type === 'donut') return '<span class="viz-donut-wrap"><span class="viz-donut" style="--p:' + (45 + seed * 7 % 40) + '%"></span></span>';
    if (type === 'cal') { var c = ''; for (var j = 0; j < 14; j++) c += '<i' + ((j * 5 + seed) % 3 === 0 ? ' class="on"' : '') + '></i>'; return '<span class="viz-cal">' + c + '</span>'; }
    return '';
  }
  function fillBlocks() {
    var it = INDUSTRIES[state.ind];
    blocks.forEach(function (el, i) {
      var m = it.mods[i];
      el.querySelector('.lb-in').innerHTML =
        '<span class="lb-top"><b>' + m[0] + '</b><svg class="ic" aria-hidden="true"><use href="#i-grip"/></svg></span>' +
        '<span class="lb-sub">' + m[1] + '</span><span class="lb-viz" aria-hidden="true">' + viz(m[2], m[3], state.ind + i * 3) + '</span>';
      el.setAttribute('aria-label', m[0] + '. ' + m[1] + '. Select, then select another module to swap.');
    });
  }

  /* ---------- apply state to the page ---------- */
  function areaRows() {
    return INDUSTRIES[state.ind].areas.map(function (r) { return r.split(' '); });
  }
  function apply() {
    var cols = state.fr + 'fr 1fr 1fr';
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--gap', state.gap + 'px');
    grid.style.gridTemplateAreas = INDUSTRIES[state.ind].areas.map(function (r) { return '"' + r + '"'; }).join(' ');
    blocks.forEach(function (el) {
      var s = el.getAttribute('data-slot');
      el.style.gridArea = state.asg[s];
      var on = state.picked === s;
      el.classList.toggle('is-picked', on);
      el.setAttribute('aria-pressed', on);
    });
    tabs.forEach(function (t, i) {
      var on = i === state.ind;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    $('#lbFr').textContent = state.fr + 'fr';
    $('#lbFrDown').disabled = state.fr <= 1;
    $('#lbFrUp').disabled = state.fr >= 3;
    $('#lbGapOut').textContent = state.gap + 'px';
    $('#lbGap').value = state.gap;
    var it = INDUSTRIES[state.ind];
    $('#lbSumName').textContent = it.label;
    $('#lbMods').innerHTML = it.mods.map(function (m) { return '<span>' + m[0] + '</span>'; }).join('');
    $('#lbCode').innerHTML = codeHtml(cols);
  }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function codeHtml(cols) {
    var it = INDUSTRIES[state.ind];
    var name = {};
    // area letter -> module code name (after any swaps)
    SLOTS.forEach(function (s, i) { name[state.asg[s]] = it.mods[i][4]; });
    var rows = areaRows().map(function (r) { return r.map(function (a) { return name[a]; }); });
    var w = 0; rows.forEach(function (r) { r.forEach(function (n) { w = Math.max(w, n.length); }); });
    var pad = function (t) { while (t.length < w) t += ' '; return t; };
    var line = function (p, v) { return '  <span class="c-prop">' + p + '</span><span class="c-pun">:</span> <span class="c-val">' + v + '</span><span class="c-pun">;</span>\n'; };
    var out = '<span class="c-sel">.dashboard</span> <span class="c-pun">{</span>\n' +
      line('display', 'grid') + line('grid-template-columns', esc(cols)) + line('gap', state.gap + 'px') +
      '  <span class="c-prop">grid-template-areas</span><span class="c-pun">:</span>\n';
    out += rows.map(function (r, i) {
      return '    <span class="c-str">"' + esc(r.map(pad).join(' ').replace(/\s+$/, '')) + '"</span>' + (i === rows.length - 1 ? '<span class="c-pun">;</span>' : '');
    }).join('\n');
    return out + '\n<span class="c-pun">}</span>';
  }

  /* ---------- FLIP: measure, change, then glide from old to new ---------- */
  function flip(change, fade) {
    if (reduce || !grid.animate) { change(); return; }
    var first = blocks.map(function (el) { return el.getBoundingClientRect(); });
    change();
    blocks.forEach(function (el, i) {
      var a = first[i], b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      var dx = a.left - b.left, dy = a.top - b.top, sx = a.width / b.width, sy = a.height / b.height;
      var inner = el.firstChild;
      var opts = { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' };
      if (Math.abs(dx) > .5 || Math.abs(dy) > .5 || Math.abs(sx - 1) > .01 || Math.abs(sy - 1) > .01) {
        el.animate([{ transformOrigin: 'top left', transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')' }, { transformOrigin: 'top left', transform: 'none' }], opts);
        inner.animate([{ transform: 'scale(' + (1 / sx) + ',' + (1 / sy) + ')' }, { transform: 'none' }], opts);
      }
      if (fade) inner.animate([{ opacity: 0 }, { opacity: 0, offset: .25 }, { opacity: 1 }], { duration: 520, easing: 'ease-out' });
    });
  }

  function say(t) { $('#lbLive').textContent = t; }
  function modName(slot) { return INDUSTRIES[state.ind].mods[SLOTS.indexOf(slot)][0]; }
  function swap(x, y) {
    var t = state.asg[x]; state.asg[x] = state.asg[y]; state.asg[y] = t;
    say(modName(x) + ' and ' + modName(y) + ' swapped.');
  }
  function setIndustry(i, fromTour) {
    i = (i + INDUSTRIES.length) % INDUSTRIES.length;
    if (i === state.ind && !fromTour) return;
    flip(function () {
      state.ind = i; state.asg = identity(); state.picked = null;
      fillBlocks(); apply();
    }, true);
    if (!fromTour) say(INDUSTRIES[i].label + ' layout.');
    markTour();
    if (fromTour && window.innerWidth < 992) {
      var t = tabs[i], box = tabsEl;
      if (t.offsetLeft < box.scrollLeft || t.offsetLeft + t.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollTo({ left: t.offsetLeft - 20, behavior: 'smooth' });
    }
  }

  /* ---------- tabs ---------- */
  tabsEl.addEventListener('click', function (e) {
    var t = e.target.closest('.lb-tab'); if (!t) return;
    stopTour(); setIndustry(+t.getAttribute('data-i'));
  });
  tabsEl.addEventListener('keydown', function (e) {
    var k = e.key, n = null;
    if (k === 'ArrowRight' || k === 'ArrowDown') n = state.ind + 1;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') n = state.ind - 1;
    else if (k === 'Home') n = 0; else if (k === 'End') n = INDUSTRIES.length - 1;
    if (n === null) return;
    e.preventDefault(); stopTour(); setIndustry(n);
    tabs[state.ind].focus();
  });

  /* ---------- controls ---------- */
  $('#lbFrUp').addEventListener('click', function () { stopTour(); if (state.fr < 3) flip(function () { state.fr++; apply(); }); });
  $('#lbFrDown').addEventListener('click', function () { stopTour(); if (state.fr > 1) flip(function () { state.fr--; apply(); }); });
  $('#lbGap').addEventListener('input', function (e) { stopTour(); state.gap = +e.target.value; apply(); });
  $('#lbReset').addEventListener('click', function () {
    stopTour();
    flip(function () { state.asg = identity(); state.fr = 2; state.gap = 12; state.picked = null; apply(); });
    say('Layout reset.');
  });
  $('#lbTour').addEventListener('click', function () { if (state.tour) stopTour(); else startTour(true); });
  $('#lbNext').addEventListener('click', function () {
    var live = document.getElementById('dashLive'), box = document.querySelector('.content');
    var how = reduce ? 'auto' : 'smooth';
    if (box && getComputedStyle(box).overflowY === 'auto' && box.scrollHeight > box.clientHeight) {
      // laptop / iPad landscape: the content area is the scroller
      box.scrollTo({ top: box.scrollTop + live.getBoundingClientRect().top - box.getBoundingClientRect().top - parseFloat(getComputedStyle(box).paddingTop), behavior: how });
    } else {
      var bar = document.querySelector('.topbar');
      window.scrollTo({ top: window.pageYOffset + live.getBoundingClientRect().top - (bar ? bar.offsetHeight : 0) - 12, behavior: how });
    }
  });

  /* panel: Your system / layout.css */
  function view(css) {
    $('#lbTabSum').classList.toggle('on', !css); $('#lbTabSum').setAttribute('aria-selected', !css);
    $('#lbTabCss').classList.toggle('on', css); $('#lbTabCss').setAttribute('aria-selected', css);
    $('#lbSum').hidden = css; $('#lbCss').hidden = !css;
  }
  $('#lbTabSum').addEventListener('click', function () { view(false); });
  $('#lbTabCss').addEventListener('click', function () { stopTour(); view(true); });
  $('#lbSee').addEventListener('click', function () {
    if (window.LR && window.LR.openDesign) window.LR.openDesign(INDUSTRIES[state.ind].design);
  });
  // "Ask about this system" fills in the contact form (only fields still empty)
  $('#lbAsk').addEventListener('click', function () {
    var f = document.getElementById('contactForm'); if (!f) return;
    var it = INDUSTRIES[state.ind];
    if (f.type && !f.type.value) f.type.value = it.label;
    if (f.message && !f.message.value) f.message.value = 'I am interested in a system with: ' + it.mods.map(function (m) { return m[0]; }).join(', ') + '.';
  });

  /* ---------- tap / keyboard to swap ---------- */
  var suppressClick = false;
  grid.addEventListener('click', function (e) {
    var el = e.target.closest('.lb-b'); if (!el) return;
    if (suppressClick) { suppressClick = false; return; }
    stopTour();
    var s = el.getAttribute('data-slot');
    if (!state.picked) { state.picked = s; apply(); say(modName(s) + ' selected. Select another module to swap.'); }
    else if (state.picked === s) { state.picked = null; apply(); say('Selection cleared.'); }
    else { var p = state.picked; flip(function () { swap(p, s); state.picked = null; apply(); }); }
  });
  grid.addEventListener('contextmenu', function (e) { if (e.target.closest('.lb-b')) e.preventDefault(); });

  /* ---------- drag and drop (pointer events) ---------- */
  var ds = null;
  function targetAt(x, y, self) {
    var list = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
    for (var i = 0; i < list.length; i++) {
      var b = list[i] && list[i].closest && list[i].closest('.lb-b');
      if (b && b !== self && grid.contains(b)) return b;
    }
    return null;
  }
  function clearTarget() { blocks.forEach(function (b) { b.classList.remove('is-target'); }); }
  function endDrag() {
    if (!ds) return;
    clearTimeout(ds.timer);
    ds.el.classList.remove('is-lift', 'is-dragging');
    ds = null;
  }
  grid.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.lb-b');
    if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    ds = { el: el, slot: el.getAttribute('data-slot'), x: e.clientX, y: e.clientY, id: e.pointerId, active: false, armed: e.pointerType !== 'touch', target: null };
    if (!ds.armed) {
      ds.timer = setTimeout(function () {
        if (!ds) return;
        ds.armed = true; el.classList.add('is-lift');
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
      }, 260);
    }
  });
  window.addEventListener('pointermove', function (e) {
    if (!ds || e.pointerId !== ds.id) return;
    var dx = e.clientX - ds.x, dy = e.clientY - ds.y;
    if (!ds.active) {
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!ds.armed) { endDrag(); return; } // touch moved before long-press: let the page scroll
      ds.active = true; stopTour();
      state.picked = null; apply();
      ds.el.classList.add('is-dragging');
      try { ds.el.setPointerCapture(e.pointerId); } catch (err) {}
    }
    ds.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    var t = targetAt(e.clientX, e.clientY, ds.el);
    if (t !== ds.target) { clearTarget(); if (t) t.classList.add('is-target'); ds.target = t; }
  });
  // stop the page from scrolling while a touch drag is in progress
  grid.addEventListener('touchmove', function (e) { if (ds && ds.armed) e.preventDefault(); }, { passive: false });
  window.addEventListener('pointerup', function (e) {
    if (!ds || e.pointerId !== ds.id) return;
    if (ds.active) {
      var d = ds, t = d.target;
      suppressClick = true; setTimeout(function () { suppressClick = false; }, 0);
      flip(function () {
        d.el.style.transform = '';
        if (t) swap(d.slot, t.getAttribute('data-slot'));
        apply();
      });
      clearTarget();
    }
    endDrag();
  });
  window.addEventListener('pointercancel', function (e) {
    if (!ds || e.pointerId !== ds.id) return;
    ds.el.style.transform = ''; clearTarget(); endDrag();
  });

  /* ---------- auto tour: cycles the industries until the visitor takes over ---------- */
  var tourTimer = null, heroVisible = true, onDashboard = true;
  function markTour() {
    tabs.forEach(function (t) { t.classList.remove('is-touring'); });
    if (!state.tour) return;
    var t = tabs[state.ind]; void t.offsetWidth; t.style.setProperty('--tour', TOUR_MS + 'ms'); t.classList.add('is-touring');
  }
  function tick() {
    if (!state.tour) return;
    if (heroVisible && onDashboard && !document.hidden && !ds) setIndustry(state.ind + 1, true);
    else markTour();
  }
  function startTour(now) {
    state.tour = true; $('#lbTour').setAttribute('aria-pressed', 'true');
    clearInterval(tourTimer); tourTimer = setInterval(tick, TOUR_MS);
    if (now) tick(); else markTour();
  }
  function stopTour() {
    if (!state.tour) return;
    state.tour = false; clearInterval(tourTimer);
    $('#lbTour').setAttribute('aria-pressed', 'false'); markTour();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }, { threshold: .35 }).observe(grid);
  }
  document.addEventListener('lr:tab', function (e) { onDashboard = e.detail === 'dashboard'; });

  /* ---------- start ---------- */
  fillBlocks(); apply();
  if (state.tour) startTour(false); else $('#lbTour').setAttribute('aria-pressed', 'false');
})();
