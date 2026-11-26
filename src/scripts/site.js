const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('#intro');
const introAnimations = new Set();
const introEvents = new AbortController();
let introTimer;
let introFailsafe;
function endIntro() {
 document.querySelector('.hero').classList.remove('hero-arriving');
 clearIntro();
}
function clearIntro() {
 introEvents.abort();
 clearTimeout(introTimer); clearTimeout(introFailsafe);
 intro.hidden = true;
 introAnimations.forEach(animation => animation.cancel());
 introAnimations.clear();
}
function animateIntro(element, frames, options) {
 const animation = element.animate(frames, {fill:'forwards', ...options});
 introAnimations.add(animation);
 return animation;
}
if (!intro.hidden && !reduced.matches) {
 try { sessionStorage.setItem('excel-intro-v2', 'seen'); } catch {}
 const logo = intro.querySelector('.intro-logo');
 const ease = 'cubic-bezier(.65,0,.35,1)';
 const roofs = [...logo.querySelectorAll('.intro-roof')].reverse();
 const letters = [...logo.querySelectorAll('.intro-letter')].sort((a,b) => {
  const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
  return Math.abs(ar.top-br.top)>25 ? ar.top-br.top : ar.left-br.left;
 });
 [...roofs, ...letters, logo.querySelector('.intro-underline')].forEach((path,i) => {
  const delay=i<2 ? i*70 : 160+(i-2)*28;
  animateIntro(path,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:900,delay,easing:ease});
  animateIntro(path,[{fillOpacity:0},{fillOpacity:1}],{duration:350,delay:1150,easing:ease});
  animateIntro(path,[{strokeOpacity:1},{strokeOpacity:0}],{duration:220,delay:1450,easing:ease});
 });
 logo.querySelectorAll('.intro-tagline').forEach(path=>animateIntro(path,[{opacity:0},{opacity:1}],{duration:400,delay:1100,easing:ease}));
 introTimer = setTimeout(() => {
  const from = logo.getBoundingClientRect();
  const to = document.querySelector('#header-logo').getBoundingClientRect();
  intro.classList.add('leaving');
  const heroSection = document.querySelector('.hero');
  heroSection.classList.add('hero-arriving');
  logo.style.transformOrigin = 'top left';
  const animation = animateIntro(logo,[{transform:'translate(0, 0) scale(1)'},{transform:`translate(${to.left-from.left}px, ${to.top-from.top}px) scale(${to.width/from.width})`}],{duration:800,easing:'cubic-bezier(.65,0,.2,1)'});
  animation.finished.then(() => {
   if (intro.hidden) return;
   clearIntro();
   if (reduced.matches) return;
   const line = heroSection.querySelector('.hero-established');
   const text = line.querySelector('.established-full').textContent;
   const typed = line.querySelector('.established-typing');
   line.classList.add('is-typing');
   let count = 0;
   function finishTyping() {
    line.classList.remove('is-typing', 'typing-finished');
    typed.textContent = '';
   }
   function typeCharacter() {
    if (reduced.matches) {
     finishTyping();
     return;
    }
    if (count === 0) heroSection.classList.add('headline-started');
    typed.textContent = text.slice(0, ++count);
    if (count === text.lastIndexOf('9') + 1) heroSection.classList.add('date-revealed');
    if (count === text.length) {
     line.classList.add('typing-finished');
     setTimeout(finishTyping, 1000);
     return;
    }
    setTimeout(typeCharacter, text[count - 1] === ' ' ? 70 : 42);
   }
   setTimeout(typeCharacter, 90);
  }).catch(endIntro);
 },1750);
 window.addEventListener('keydown',endIntro,{once:true,signal:introEvents.signal});
 // A mobile browser toolbar changing height should not interrupt the drawing.
 const initialWidth = innerWidth;
 window.addEventListener('resize',()=>{if(innerWidth!==initialWidth)endIntro();},{signal:introEvents.signal});
 window.addEventListener('scroll',()=>{if(scrollY>40)endIntro();},{passive:true,signal:introEvents.signal});
 introFailsafe = setTimeout(endIntro,3600);
}
const floatingCall = document.querySelector('.floating-call');
const hero = document.querySelector('.hero');
const siteHeader = document.querySelector('.header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map(link => ({link, section: document.querySelector(link.hash)}));
const contact = document.querySelector('#contact');
const desktop = matchMedia('(min-width: 761px)');
const brand = siteHeader.querySelector('.brand');
let returningHome = false;
let updatePending = false;
const heroTrack = hero.parentElement;
const pinnedPanels = document.querySelectorAll('.overlap-track > section');
const panelSizes = new ResizeObserver(entries => {
 for (const {target} of entries) {
  target.style.setProperty('--panel-height', target.offsetHeight + 'px');
 }
 scheduleNavigation();
});
pinnedPanels.forEach(panel => panelSizes.observe(panel));

function sectionBounds(section) {
 return (section.closest('.overlap-track') || section).getBoundingClientRect();
}

function updateNavigation() {
 updatePending = false;
 const headerBottom = siteHeader.getBoundingClientRect().bottom;
 const heroBottom = heroTrack.getBoundingClientRect().top + hero.offsetHeight;
 const contactBounds = contact.getBoundingClientRect();
 let active;
 for (const item of sections) {
  if (sectionBounds(item.section).top <= headerBottom + 24) active = item.link;
 }
 const markerLeft = active && desktop.matches ? active.offsetLeft + active.offsetWidth / 2 - 11 : null;
 const contactInView = contactBounds.top < innerHeight && contactBounds.bottom > headerBottom;
 const hideCall = heroBottom > headerBottom || contactInView;
 if (floatingCall.hidden !== hideCall) floatingCall.hidden = hideCall;
 siteHeader.classList.toggle('over-contact', contactBounds.top <= headerBottom + 1 && contactBounds.bottom > headerBottom);
 for (const link of sectionLinks) {
  if ((link === active) === link.hasAttribute('aria-current')) continue;
  if (link === active) link.setAttribute('aria-current', 'location');
  else link.removeAttribute('aria-current');
 }
 nav.classList.toggle('has-current', Boolean(active));
 if (markerLeft !== null) nav.style.setProperty('--marker-left', markerLeft + 'px');
 if (returningHome && scrollY <= 1) {
  returningHome = false;
  brand.focus({preventScroll:true});
  if (!reduced.matches) brand.classList.add('roof-accent');
 }
}
function scheduleNavigation() {
 if (updatePending) return;
 updatePending = true;
 requestAnimationFrame(updateNavigation);
}
for (const event of ['scroll', 'resize', 'pageshow']) window.addEventListener(event, scheduleNavigation, {passive:true});
updateNavigation();

// Only a slow, user-driven vertical gesture can request one alignment.
const snapSections = [...document.querySelectorAll('main section[id], main .overlap-track[id]')];
let eligible = false;
let touching = false;
let settleTimer;
let snapFrame;
let lastWheel = -Infinity;
let touchStart;
let lastTouch;

function cancelAlignment() {
 eligible = false;
 clearTimeout(settleTimer);
 cancelAnimationFrame(snapFrame);
}
function alignNearbySection() {
 if (!eligible || touching || reduced.matches || nav.classList.contains('open')) return;
 cancelAlignment();
 const headerEdge = siteHeader.getBoundingClientRect().bottom;
 const limit = desktop.matches ? 48 : 24;
 const offset = snapSections.map(section => sectionBounds(section).top - headerEdge)
  .find(distance => Math.abs(distance) > 1 && Math.abs(distance) <= limit);
 if (offset === undefined) return;
 const start = scrollY;
 const began = performance.now();
 function advance(now) {
  const progress = Math.min(1, (now - began) / 180);
  window.scrollTo({top:start + offset * (1 - (1 - progress) ** 3), behavior:'instant'});
  if (progress < 1) snapFrame = requestAnimationFrame(advance);
 }
 snapFrame = requestAnimationFrame(advance);
}
function waitForRest() {
 clearTimeout(settleTimer);
 if (eligible && !touching) settleTimer = setTimeout(alignNearbySection, 160);
}
window.addEventListener('wheel', event => {
 const now = performance.now();
 const newGesture = now - lastWheel > 180;
 const delta = Math.abs(event.deltaY) * [1, 16, innerHeight][event.deltaMode];
 const slowVertical = delta > 0 && delta < 75 && Math.abs(event.deltaY) > Math.abs(event.deltaX) && !event.ctrlKey;
 const allow = slowVertical && (newGesture || eligible);
 cancelAlignment();
 eligible = allow;
 lastWheel = now;
}, {passive:true});
window.addEventListener('touchstart', event => {
 cancelAlignment();
 touching = true;
 eligible = event.touches.length === 1;
 const point = event.touches[0];
 touchStart = lastTouch = {x:point.clientX, y:point.clientY, time:event.timeStamp};
}, {passive:true});
window.addEventListener('touchmove', event => {
 if (!eligible || !lastTouch) return;
 const point = event.touches[0];
 const dy = Math.abs(point.clientY - lastTouch.y);
 const dt = Math.max(1, event.timeStamp - lastTouch.time);
 if (dy > 6 && dy / dt > 1.2 || Math.abs(point.clientX-touchStart.x) > Math.abs(point.clientY-touchStart.y) + 6) eligible = false;
 lastTouch = {x:point.clientX, y:point.clientY, time:event.timeStamp};
}, {passive:true});
window.addEventListener('touchend', () => {
 touching = false;
 if (!touchStart || Math.abs(lastTouch.y-touchStart.y) < 4) eligible = false;
 waitForRest();
}, {passive:true});
window.addEventListener('scroll', waitForRest, {passive:true});
for (const event of ['pointerdown','keydown','click','touchcancel','resize','pagehide']) window.addEventListener(event, cancelAlignment, {passive:true});
reduced.addEventListener('change', cancelAlignment);

function setMenu(open) {
 menu.setAttribute('aria-expanded', String(open));
 nav.classList.toggle('open', open);
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && nav.classList.contains('open')) {
  setMenu(false);
  menu.focus();
 }
});
document.addEventListener('click', event => {
 if (!siteHeader.contains(event.target)) setMenu(false);
});
desktop.addEventListener('change', () => { setMenu(false); scheduleNavigation(); });
document.querySelector('footer [aria-label="Back to top"]').addEventListener('click', () => {
 returningHome = true;
 scheduleNavigation();
});
for (const event of ['wheel','touchstart','keydown']) window.addEventListener(event, () => { returningHome = false; }, {passive:true});
brand.addEventListener('animationend', () => brand.classList.remove('roof-accent'));
if (document.documentElement.classList.contains('js-motion')) {
 let previousY = scrollY;
 let previousTime = performance.now();
 let fastUntil = 0;
 window.addEventListener('scroll', () => {
  const now = performance.now();
  if (Math.abs(scrollY - previousY) / Math.max(16, now - previousTime) > 1.25) fastUntil = now + 180;
  previousY = scrollY;
  previousTime = now;
 }, {passive:true});
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   if (performance.now() < fastUntil) entry.target.classList.add('quick-reveal');
   entry.target.classList.add('visible');
   observer.unobserve(entry.target);
  }
 }, {threshold:.07});
 document.querySelectorAll('.reveal, .material-specs, .project-0 .project-image').forEach(el => observer.observe(el));

 // Observe each print after decoding so slow images cannot miss their entrance.
 const photoObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (entry.intersectionRatio < 0.18) continue;
   if (entry.target.matches('.archive-print')) entry.target.closest('.van-story').querySelector('.modern-frame').classList.add('visible');
   entry.target.classList.add('visible');
   photoObserver.unobserve(entry.target);
  }
 }, {threshold: 0.18, rootMargin: '0px 0px -6% 0px'});
 document.querySelectorAll('.van-story img').forEach(async image => {
  const target = image.parentElement;
  try {
   await image.decode();
   if (target.matches('.archive-print')) await document.querySelector('.modern-frame img').decode().catch(() => {});
   photoObserver.observe(target);
  } catch {
   target.classList.add('visible');
  }
 });
}
clearTimeout(window.excelMotionFallback);
reduced.addEventListener('change',()=>{if(reduced.matches){endIntro();document.documentElement.classList.remove('js-motion');}});

// Native horizontal scrolling preserves normal vertical touch scrolling.
const projectGallery = document.querySelector('#project-grid');
const projectCards = [...projectGallery.querySelectorAll('.project')];
const galleryCounter = document.querySelector('.gallery-counter');
const controls = document.querySelector('.gallery-controls');
let galleryTimer;
function currentProject() {
 const left = projectGallery.getBoundingClientRect().left;
 return projectCards.reduce((best,card,index) => Math.abs(card.getBoundingClientRect().left-left) < Math.abs(projectCards[best].getBoundingClientRect().left-left) ? index : best,0);
}
function updateProjectCounter() {
 const index = currentProject();
 const digit = galleryCounter.querySelector('.gallery-digit');
 const value = String(index + 1);
 if (digit.textContent !== value) {
  if (!reduced.matches) {
   const old = digit.cloneNode(true);
   old.className = 'gallery-digit-old';
   old.setAttribute('aria-hidden','true');
   galleryCounter.querySelector('.gallery-digit-old')?.remove();
   galleryCounter.prepend(old);
   old.animate([{opacity:1},{opacity:0}], 160).finished.then(() => old.remove());
   digit.animate([{opacity:0},{opacity:1}], 160);
  }
  digit.textContent = value;
 }
 controls.firstElementChild.disabled = index === 0;
 controls.lastElementChild.disabled = index === projectCards.length - 1;
}
function configureGallery() {
 projectGallery.tabIndex = 0;
 controls.hidden = false;
 galleryCounter.hidden = false;
 updateProjectCounter();
}
projectGallery.addEventListener('scroll',()=>{
 clearTimeout(galleryTimer);
 galleryTimer = setTimeout(updateProjectCounter,100);
},{passive:true});
projectGallery.addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();
 const index = event.key==='Home' ? 0 : event.key==='End' ? projectCards.length-1 : Math.max(0,Math.min(projectCards.length-1,currentProject()+(event.key==='ArrowRight'?1:-1)));
 goToProject(index);
});
function goToProject(index) {
 const target = projectCards[index];
 projectGallery.scrollTo({left:projectGallery.scrollLeft+target.getBoundingClientRect().left-projectGallery.getBoundingClientRect().left,behavior:reduced.matches?'instant':'smooth'});
}
for (const button of controls.querySelectorAll('button')) {
 button.addEventListener('click', () => goToProject(Math.min(projectCards.length - 1, Math.max(0, currentProject() + Number(button.dataset.step)))));
}
window.addEventListener('resize',updateProjectCounter);
configureGallery();

document.addEventListener('click', event => {
 const link = event.target.closest?.('a[href]');
 if (!link) return;
 const types = {
  'tel:07973673255': 'mobile',
  'tel:01543433289': 'landline'
 };
 const type = link.origin === 'https://wa.me' ? 'whatsapp' : types[link.href];
 if (type) navigator.sendBeacon('/.netlify/functions/contact-tap', type);
});
