const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const backToTop = document.querySelector('.back-to-top');
const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const splitHeading = document.querySelector('[data-split]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (splitHeading) {
  const words = splitHeading.textContent.trim().split(/\s+/);
  splitHeading.textContent = '';
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.setProperty('--word-index', index);
    span.textContent = word;
    splitHeading.appendChild(span);
  });
}

requestAnimationFrame(() => {
  hero.classList.add('ready');
  heroVisual.classList.add('loaded');
});

const updateScrollState = () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  backToTop.classList.toggle('visible', window.scrollY > 400);
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

menuButton.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  menuButton.querySelector('i').className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menü öffnen');
    menuButton.querySelector('i').className = 'bi bi-list';
  });
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

const revealSections = document.querySelectorAll('.reveal-section');
revealSections.forEach(section => {
  section.querySelectorAll('.reveal-child').forEach((child, index) => child.style.setProperty('--stagger', index));
});

if (reducedMotion) {
  revealSections.forEach(section => section.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealSections.forEach(section => observer.observe(section));
}

const follower = document.querySelector('.cursor-follower');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (follower && finePointer && !reducedMotion) {
  let mouseX = -20;
  let mouseY = -20;
  let currentX = -20;
  let currentY = -20;
  let scale = 1;
  let targetScale = 1;
  const lerp = 0.2;

  window.addEventListener('mousemove', event => {
    mouseX = event.clientX - 4;
    mouseY = event.clientY - 4;
    follower.classList.add('visible');
  }, { passive: true });

  document.querySelectorAll('a, button, .hover-target, .class-card, .bento-cell').forEach(target => {
    target.addEventListener('mouseenter', () => { targetScale = 2.5; });
    target.addEventListener('mouseleave', () => { targetScale = 1; });
  });

  const animateFollower = () => {
    currentX += (mouseX - currentX) * lerp;
    currentY += (mouseY - currentY) * lerp;
    scale += (targetScale - scale) * lerp;
    follower.style.transform = `translate3d(${currentX}px,${currentY}px,0) scale(${scale})`;
    requestAnimationFrame(animateFollower);
  };
  animateFollower();
}

document.addEventListener('DOMContentLoaded', function(){
  const NAMESPACE = "ACADEMY Fahrschule Drive In";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  if(!launcher || !panel || !form || !input || !messages){ return; }

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setOpen(false); }); }

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
});
