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
let seen = false;
try { seen = sessionStorage.getItem('excel-intro-v2') === 'seen'; sessionStorage.setItem('excel-intro-v2', 'seen'); } catch {}
const replayIntro = new URLSearchParams(window.location.search).get('intro') === 'replay';
if ((!seen || replayIntro) && !reduced.matches) {
 intro.hidden = false;
 document.querySelector('#skip-intro').tabIndex = 0;
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
  animation.finished.then(endIntro).catch(endIntro);
 },1750);
 document.querySelector('#skip-intro').addEventListener('click',endIntro);
 window.addEventListener('keydown',endIntro,{once:true});
 // A mobile browser toolbar changing height should not interrupt the drawing.
 const initialWidth = innerWidth;
 window.addEventListener('resize',()=>{if(innerWidth!==initialWidth)endIntro();});
 window.addEventListener('scroll',()=>{if(scrollY>40)endIntro();},{passive:true});
 introFailsafe = setTimeout(endIntro,3600);
}
const floatingCall = document.querySelector('.floating-call');
const hero = document.querySelector('.hero');
function updateFloatingCall() {
 const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
 const formRect = document.querySelector('.quote-form').getBoundingClientRect();
 const formVisible = formRect.top < innerHeight && formRect.bottom > headerBottom;
 floatingCall.hidden = hero.getBoundingClientRect().bottom > headerBottom || formVisible;
}
const heroObserver = new IntersectionObserver(updateFloatingCall, {rootMargin:`-${document.querySelector('.header').offsetHeight}px 0px 0px 0px`});
heroObserver.observe(hero);
heroObserver.observe(document.querySelector('.quote-form'));
window.addEventListener('resize',updateFloatingCall);
updateFloatingCall();
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.querySelector('span').textContent='＋';}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);menu.querySelector('span').textContent=open?'−':'＋';});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
if (!reduced.matches && 'IntersectionObserver' in window) {
 document.documentElement.classList.add('js-motion');
 const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.07});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
reduced.addEventListener('change',()=>{if(reduced.matches){endIntro();document.documentElement.classList.remove('js-motion');}});
const gallery = document.querySelector('#gallery');
document.querySelectorAll('.project').forEach(button=>button.addEventListener('click',()=>{gallery.querySelector('img').src=button.dataset.image;gallery.querySelector('img').alt=button.querySelector('img').alt;gallery.querySelector('p').textContent=button.dataset.caption;gallery.showModal();}));
gallery.querySelector('.gallery-close').addEventListener('click',()=>gallery.close());
gallery.addEventListener('click',e=>{if(e.target===gallery){const r=gallery.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)gallery.close();}});
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{document.querySelector('#service').value=link.dataset.service;}));
const form=document.querySelector('.quote-form');
form.addEventListener('submit',async e=>{
 e.preventDefault();
 const submit=form.querySelector('[type="submit"]');const status=document.querySelector('#form-status');
 submit.disabled=true;status.textContent='Sending your enquiry…';
 try {
  const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
  if(!response.ok)throw new Error('Submission failed');
  window.location.assign('/thank-you');
 } catch {status.textContent='Your enquiry could not be sent. Please try again, or call 07973 673255.';submit.disabled=false;}
});
