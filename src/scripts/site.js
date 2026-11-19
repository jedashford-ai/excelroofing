const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
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

function updateNavigation() {
 updatePending = false;
 const headerBottom = siteHeader.getBoundingClientRect().bottom;
 const heroBottom = hero.getBoundingClientRect().bottom;
 floatingCall.hidden = heroBottom > headerBottom;
 const contactBounds = contact.getBoundingClientRect();
 siteHeader.classList.toggle('over-contact', contactBounds.top <= headerBottom + 1 && contactBounds.bottom > headerBottom);

 let active;
 let nearest = -Infinity;
 for (const item of sections) {
  const top = item.section.getBoundingClientRect().top;
  if (top <= headerBottom + 24 && top > nearest) {
   active = item.link;
   nearest = top;
  }
 }
 for (const link of sectionLinks) {
  if (link === active) link.setAttribute('aria-current', 'location');
  else link.removeAttribute('aria-current');
 }
 nav.classList.toggle('has-current', Boolean(active));
 if (active && desktop.matches) {
  nav.style.setProperty('--marker-left', (active.offsetLeft + active.offsetWidth / 2 - 11) + 'px');
 }
 if (desktop.matches && !reduced.matches && heroBottom > 0) {
  hero.style.setProperty('--roof-offset', Math.min(24, Math.max(0, scrollY * 0.09)) + 'px');
 }
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
const snapSections = [...document.querySelectorAll('main > section[id]')];
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
 const offset = snapSections.map(section => section.getBoundingClientRect().top - headerEdge)
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
 const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.07});
 document.querySelectorAll('.reveal, .material-specs').forEach(el=>observer.observe(el));

 // Observe each print after decoding so slow images cannot miss their entrance.
 const photoObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (entry.intersectionRatio < 0.18) continue;
   entry.target.classList.add('visible');
   photoObserver.unobserve(entry.target);
  }
 }, {threshold: 0.18, rootMargin: '0px 0px -6% 0px'});
 document.querySelectorAll('.van-story img').forEach(async image => {
  const target = image.parentElement;
  try {
   await image.decode();
   photoObserver.observe(target);
  } catch {
   target.classList.add('visible');
  }
 });
}
clearTimeout(window.excelMotionFallback);
reduced.addEventListener('change',()=>{if(reduced.matches){document.documentElement.classList.remove('js-motion','header-opening');}});

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
 galleryCounter.textContent = `${index+1} of ${projectCards.length}`;
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
