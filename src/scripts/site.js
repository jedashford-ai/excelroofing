const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('#intro');
const introAnimations = new Set();
let introTimer;
let introFailsafe;
function endIntro() {
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
  logo.style.transformOrigin = 'top left';
  const animation = animateIntro(logo,[{transform:'translate(0, 0) scale(1)'},{transform:`translate(${to.left-from.left}px, ${to.top-from.top}px) scale(${to.width/from.width})`}],{duration:800,easing:'cubic-bezier(.65,0,.2,1)'});
  animation.finished.then(() => {
   if (intro.hidden) return;
   endIntro();
   document.querySelector('.hero').classList.add('hero-arriving');
  }).catch(endIntro);
 },1750);
 window.addEventListener('keydown',endIntro,{once:true});
 // A mobile browser toolbar changing height should not interrupt the drawing.
 const initialWidth = innerWidth;
 window.addEventListener('resize',()=>{if(innerWidth!==initialWidth)endIntro();});
 window.addEventListener('scroll',()=>{if(scrollY>40)endIntro();},{passive:true});
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
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

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
