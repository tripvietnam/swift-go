(function(){
  const header = document.getElementById('site-header');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const onScroll = () => {
    if (window.scrollY > 8) header && header.classList.add('scrolled');
    else header && header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const dateInput = document.getElementById('date-range');
  if (window.flatpickr && dateInput) {
    window.flatpickr(dateInput, {
      mode: 'range',
      minDate: 'today',
      dateFormat: 'd/m/Y',
      allowInput: false,
      disableMobile: true
    });
  }

  const occBtn = document.getElementById('occupancy-toggle');
  const occDrop = document.getElementById('occupancy-dropdown');
  const occClose = document.getElementById('occupancy-close');
  const state = { adults: 2, children: 0, rooms: 1 };

  function formatOccupancy(){
    return `${state.adults} người lớn · ${state.children} trẻ em · ${state.rooms} phòng`;
  }

  function syncCounters(){
    if (!occDrop || !occBtn) return;
    const counters = occDrop.querySelectorAll('.counter');
    counters.forEach(c => {
      const key = c.getAttribute('data-key');
      const valEl = c.querySelector('.value');
      if (key && valEl) valEl.textContent = state[key];
    });
    occBtn.textContent = formatOccupancy();
  }

  function clamp(val, min){ return val < min ? min : val; }

  function attachCounterHandlers(){
    if (!occDrop) return;
    occDrop.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const wrap = target.closest('.counter');
      if (!wrap) return;
      const key = wrap.getAttribute('data-key');
      if (!key) return;
      if (target.classList.contains('plus')) {
        state[key] = state[key] + 1;
      } else if (target.classList.contains('minus')) {
        const minMap = { adults: 1, children: 0, rooms: 1 };
        state[key] = clamp(state[key] - 1, minMap[key]);
      } else {
        return;
      }
      syncCounters();
    });
  }

  function closeDropdown(){
    occDrop && occDrop.classList.remove('open');
    occBtn && occBtn.setAttribute('aria-expanded', 'false');
  }

  if (occBtn && occDrop){
    occBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      occDrop.classList.toggle('open');
      const expanded = occDrop.classList.contains('open');
      occBtn.setAttribute('aria-expanded', String(expanded));
    });

    occClose && occClose.addEventListener('click', closeDropdown);

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!occDrop.contains(t) && t !== occBtn) closeDropdown();
    });

    attachCounterHandlers();
    syncCounters();
  }

  // Deals carousel controls
  const carousel = document.getElementById('deals-carousel');
  const prev = document.getElementById('deals-prev');
  const next = document.getElementById('deals-next');
  const scrollAmount = () => (carousel ? Math.min(360, Math.round(carousel.clientWidth * 0.8)) : 300);
  if (carousel && prev && next){
    prev.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    next.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
  }

  // Search submit -> redirect to page-search.html
  const form = document.getElementById('search-form');
  const dest = document.getElementById('destination');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        destination: dest && dest.value ? dest.value : '',
        adults: state.adults,
        children: state.children,
        rooms: state.rooms,
      };
      const qs = new URLSearchParams(payload).toString();
      const base = 'page-search.html';
      const sep = base.includes('?') ? '&' : '?';
      window.location.href = `${base}${sep}${qs}`;
    });
  }

  // Filter chips toggle
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      // Có thể thêm logic lọc thực tế ở đây nếu cần
    });
  });

  // Quick tabs/chips in hero
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
})();

