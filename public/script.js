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


const zaproCalculator = document.querySelector('[data-zapro-calculator]');

if (zaproCalculator) {
  const platformAnnualCost = 10000;
  const enterpriseThreshold = 120000;
  const l1SupportMonthlyPrice = 1000;
  const l1SupportAnnualPrice = 11000;
  const userModuleKeys = ['o2c', 's2cp2p', 'inventory', 'te'];
  const modulePrices = {
    o2c: { monthly: 50, annual: 550, label: 'O2C users', unit: 'user' },
    s2cp2p: { monthly: 50, annual: 550, label: 'S2C + P2P users', unit: 'user' },
    inventory: { monthly: 25, annual: 275, label: 'Inventory management add-on users', unit: 'user' },
    te: { monthly: 10, annual: 110, label: 'T&E add-on users', unit: 'user' },
    vendorOnboarding: { annual: 7, label: 'Vendor onboarding support', unit: 'vendor', billingIndependent: true },
    l1Support: { monthly: l1SupportMonthlyPrice, annual: l1SupportAnnualPrice, label: 'L1 support', unit: 'service', optionalService: true }
  };

  const euroFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  const billingInputs = Array.from(zaproCalculator.querySelectorAll('input[name="zapro-billing"]'));
  const quantityInputs = Array.from(zaproCalculator.querySelectorAll('[data-calc-input]'));
  const optionInputs = Array.from(zaproCalculator.querySelectorAll('[data-calc-option]'));
  const resetButton = zaproCalculator.querySelector('[data-calc-reset]');
  const totalAnnual = zaproCalculator.querySelector('[data-total-annual]');
  const totalMonthly = zaproCalculator.querySelector('[data-total-monthly]');
  const pricingNote = zaproCalculator.querySelector('[data-pricing-note]');
  const enterprisePriceButton = zaproCalculator.querySelector('[data-enterprise-price]');
  const l1SupportBasis = zaproCalculator.querySelector('[data-l1-support-basis]');

  function currentBillingMode() {
    return billingInputs.find((input) => input.checked)?.value || 'annual';
  }

  function safeQuantity(input) {
    const value = Number.parseInt(input.value, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function quantityForModule(moduleKey) {
    const input = quantityInputs.find((item) => item.dataset.calcInput === moduleKey);
    return input ? safeQuantity(input) : 0;
  }

  function totalUserCount() {
    return userModuleKeys.reduce((sum, moduleKey) => sum + quantityForModule(moduleKey), 0);
  }

  function isOptionSelected(optionKey) {
    const input = optionInputs.find((item) => item.dataset.calcOption === optionKey);
    return Boolean(input && input.checked);
  }

  function l1SupportCost(billingMode) {
    if (!isOptionSelected('l1Support')) return 0;
    return billingMode === 'monthly' ? l1SupportMonthlyPrice * 12 : l1SupportAnnualPrice;
  }

  function annualModuleCost(moduleKey, quantity, billingMode) {
    const price = modulePrices[moduleKey];
    if (!price) return 0;
    if (price.billingIndependent) return quantity * price.annual;
    return billingMode === 'monthly' ? quantity * price.monthly * 12 : quantity * price.annual;
  }

  function calculateTotal(billingMode) {
    const inputTotal = quantityInputs.reduce((sum, input) => {
      const moduleKey = input.dataset.calcInput;
      return sum + annualModuleCost(moduleKey, safeQuantity(input), billingMode);
    }, platformAnnualCost);

    return inputTotal + l1SupportCost(billingMode);
  }

  function updateRateLabels(billingMode) {
    Object.entries(modulePrices).forEach(([moduleKey, price]) => {
      const label = zaproCalculator.querySelector(`[data-rate-label="${moduleKey}"]`);
      if (!label) return;
      if (moduleKey === 'l1Support') {
        label.textContent = billingMode === 'monthly'
          ? `${euroFormatter.format(price.monthly)} per month`
          : `${euroFormatter.format(price.annual)} per year`;
        return;
      }
      if (price.billingIndependent) {
        label.textContent = `${euroFormatter.format(price.annual)} per ${price.unit}`;
        return;
      }
      label.textContent = billingMode === 'monthly'
        ? `${euroFormatter.format(price.monthly)} per ${price.unit} / month`
        : `${euroFormatter.format(price.annual)} per ${price.unit} / year`;
    });
  }

  function updateCalculator() {
    const billingMode = currentBillingMode();
    let annualTotalValue = platformAnnualCost;

    updateRateLabels(billingMode);

    const platformOutput = zaproCalculator.querySelector('[data-total="platform"]');
    if (platformOutput) platformOutput.textContent = euroFormatter.format(platformAnnualCost);

    quantityInputs.forEach((input) => {
      const moduleKey = input.dataset.calcInput;
      const quantity = safeQuantity(input);
      const cost = annualModuleCost(moduleKey, quantity, billingMode);
      annualTotalValue += cost;

      const output = zaproCalculator.querySelector(`[data-total="${moduleKey}"]`);
      if (output) output.textContent = euroFormatter.format(cost);
    });

    const currentL1SupportCost = l1SupportCost(billingMode);
    annualTotalValue += currentL1SupportCost;

    const l1SupportOutput = zaproCalculator.querySelector('[data-total="l1Support"]');
    if (l1SupportOutput) l1SupportOutput.textContent = euroFormatter.format(currentL1SupportCost);

    if (l1SupportBasis) {
      l1SupportBasis.textContent = isOptionSelected('l1Support')
        ? `Included as optional service → ${euroFormatter.format(currentL1SupportCost)} annual cost`
        : 'Optional service excluded from the estimate unless selected';
    }

    const annualBillingTotal = calculateTotal('annual');
    const monthlyBillingTotal = calculateTotal('monthly');
    const annualSaving = monthlyBillingTotal - annualBillingTotal;

    totalAnnual.textContent = euroFormatter.format(annualTotalValue);
    totalMonthly.textContent = `Equivalent to ${euroFormatter.format(Math.round(annualTotalValue / 12))} / month`;

    if (enterprisePriceButton) {
      const shouldShowEnterpriseButton = annualTotalValue > enterpriseThreshold;
      enterprisePriceButton.hidden = !shouldShowEnterpriseButton;
      enterprisePriceButton.setAttribute('aria-hidden', String(!shouldShowEnterpriseButton));
    }

    if (pricingNote) {
      if (annualSaving > 0) {
        pricingNote.textContent = billingMode === 'annual'
          ? `Annual rates save ${euroFormatter.format(annualSaving)} per year compared with paying monthly and annualising the spend. L1 support is optional and added only when selected.`
          : `Switching to annual rates would reduce the annualised subscription by ${euroFormatter.format(annualSaving)}. L1 support is optional and added only when selected.`;
      } else {
        pricingNote.textContent = `Add user quantities to compare monthly annualised and annual subscription values. Optional services are added only when selected or when quantities are entered.`;
      }
    }
  }

  quantityInputs.forEach((input) => {
    input.addEventListener('input', updateCalculator);
    input.addEventListener('blur', () => {
      if (safeQuantity(input) !== Number.parseInt(input.value, 10)) input.value = safeQuantity(input);
      updateCalculator();
    });
  });

  optionInputs.forEach((input) => input.addEventListener('change', updateCalculator));

  billingInputs.forEach((input) => input.addEventListener('change', updateCalculator));

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      quantityInputs.forEach((input) => { input.value = '0'; });
      optionInputs.forEach((input) => { input.checked = false; });
      updateCalculator();
    });
  }

  updateCalculator();
}
