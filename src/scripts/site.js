const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector('#intro');
let introTimer;
function endIntro() { clearTimeout(introTimer); intro.hidden = true; }
let seen = false;
try { seen = sessionStorage.getItem('excel-intro') === 'seen'; sessionStorage.setItem('excel-intro', 'seen'); } catch {}
if (!seen && !reduced.matches) {
 intro.hidden = false;
 document.querySelector('#skip-intro').tabIndex = 0;
 const logo = intro.querySelector('.intro-logo');
 introTimer = setTimeout(() => {
  const from = logo.getBoundingClientRect();
  const to = document.querySelector('#header-logo').getBoundingClientRect();
  intro.classList.add('leaving');
  const animation = logo.animate([{transform:'translate(0, 0) scale(1)'},{transform:`translate(${to.left-from.left}px, ${to.top-from.top}px) scale(${to.width/from.width})`}],{duration:800,easing:'cubic-bezier(.65,0,.2,1)',fill:'forwards'});
  logo.style.transformOrigin = 'top left';
  animation.finished.then(endIntro).catch(endIntro);
 },850);
 document.querySelector('#skip-intro').addEventListener('click',endIntro);
 window.addEventListener('keydown',endIntro,{once:true});
 window.addEventListener('resize',endIntro,{once:true});
 setTimeout(endIntro,2400);
}
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
const motion = document.querySelector('.motion-toggle');
motion.addEventListener('click',()=>{const paused=document.querySelector('.hero').classList.toggle('paused');motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Play background motion':'Pause background motion');motion.textContent=paused?'Play':'Pause';});
if(reduced.matches)motion.hidden=true;
reduced.addEventListener('change',()=>{if(reduced.matches){endIntro();document.documentElement.classList.remove('js-motion');motion.hidden=true;}else{motion.hidden=false;}});
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
 } catch {status.textContent='Your enquiry could not be sent. Please try again, or call 01543 433289.';submit.disabled=false;}
});
