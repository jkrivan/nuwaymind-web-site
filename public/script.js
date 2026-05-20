const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');
const navItems = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const revealItems = document.querySelectorAll('.reveal');
const filterButtons = document.querySelectorAll('[data-filter]');
const capabilityCards = document.querySelectorAll('[data-tags]');
const contactForm = document.querySelector('[data-contact-form]');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 16);
}

function closeMenu() {
  document.body.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
}

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks.classList.toggle('open', !isOpen);
  document.body.classList.toggle('nav-open', !isOpen);
});

navItems.forEach((item) => item.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navItems.forEach((item) => {
      item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((current) => current.classList.toggle('active', current === button));

    capabilityCards.forEach((card) => {
      const tags = card.dataset.tags.split(' ');
      const shouldShow = filter === 'all' || tags.includes(filter);
      card.classList.toggle('is-hidden', !shouldShow);
    });
  });
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const emailValue = contactForm.querySelector('#email').value.trim();
  const goalValue = contactForm.querySelector('#goal').value.trim();
  const subject = encodeURIComponent('NuWayMind enquiry');
  const body = encodeURIComponent(`Hello NuWayMind,\n\nMy email: ${emailValue}\n\nWhat I am aiming to improve:\n${goalValue}\n\nRegards,`);

  window.location.href = `mailto:info@nuwaymind.com?subject=${subject}&body=${body}`;
});

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu();
});

updateHeader();
