const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Header, back-to-top ---------- */
const header = document.querySelector<HTMLElement>('.header');
const toTop = document.querySelector<HTMLButtonElement>('.to-top');
const onScroll = () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);
  toTop?.classList.toggle('show', window.scrollY > 700);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ---------- Navigation ---------- */
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#main-nav');
function setMenu(open: boolean) {
  // The top bar scrolls away, so anchor the drawer to the header's current bottom edge.
  if (open && header && nav) nav.style.setProperty('--nav-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
});
document.addEventListener('click', (e) => {
  if (e.target instanceof Node && header && !header.contains(e.target)) setMenu(false);
});
matchMedia('(min-width: 1181px)').addEventListener('change', () => setMenu(false));
document.querySelectorAll<HTMLButtonElement>('.submenu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('li');
    const open = !item?.classList.contains('open');
    item?.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  });
});

/* ---------- Scroll reveal ---------- */
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => { el.classList.add('will-reveal'); observer.observe(el); });
}

/* ---------- Touch feedback for cards ---------- */
const TOUCH_HOLD_MS = 650;
document.querySelectorAll<HTMLElement>('.lift-card').forEach((card) => {
  let timer = 0;
  card.addEventListener('touchstart', () => {
    window.clearTimeout(timer);
    card.classList.add('is-touched');
  }, { passive: true });
  const release = () => { timer = window.setTimeout(() => card.classList.remove('is-touched'), TOUCH_HOLD_MS); };
  card.addEventListener('touchend', release, { passive: true });
  card.addEventListener('touchcancel', release, { passive: true });
});

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
  const COUNT_MS = 1600;
  const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target as HTMLElement;
    const target = Number(el.dataset.count) || 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / COUNT_MS, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  }), { threshold: 0.6 });
  counters.forEach((el) => { el.textContent = '0'; counterObserver.observe(el); });
}

/* ---------- Project filters ---------- */
document.querySelectorAll<HTMLElement>('[data-project-gallery]').forEach((gallery) => {
  const buttons = gallery.querySelectorAll<HTMLButtonElement>('[data-filter]');
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((b) => { b.setAttribute('aria-pressed', String(b === button)); b.classList.toggle('active', b === button); });
    let count = 0;
    gallery.querySelectorAll<HTMLElement>('[data-category]').forEach((card) => {
      card.hidden = button.dataset.filter !== 'All' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) { card.classList.add('visible'); count++; }
    });
    const status = gallery.querySelector('[data-filter-status]');
    if (status) status.textContent = `Showing ${count} ${count === 1 ? 'project' : 'projects'}.`;
  }));
});

/* ---------- Video modal ---------- */
const modal = document.querySelector<HTMLDialogElement>('#video-modal');
const player = modal?.querySelector('video');
let trigger: HTMLElement | null = null;
document.querySelectorAll<HTMLAnchorElement>('[data-video]').forEach((link) => link.addEventListener('click', (event) => {
  if (!modal || !player || typeof modal.showModal !== 'function') return;
  event.preventDefault();
  trigger = link;
  const title = modal.querySelector('#video-modal-title');
  if (title) title.textContent = link.dataset.title || 'Site video';
  modal.classList.toggle('portrait', link.dataset.landscape !== 'true');
  player.src = link.dataset.video || '';
  player.poster = link.querySelector('img')?.currentSrc || '';
  modal.showModal();
  player.play().catch(() => { /* Autoplay can be blocked; the controls remain available. */ });
}));
modal?.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
modal?.addEventListener('click', (event) => {
  if (event.target !== modal) return;
  const r = modal.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
});
modal?.addEventListener('close', () => {
  player?.pause();
  player?.removeAttribute('src');
  player?.load();
  trigger?.focus();
});
