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
  const platformBaseAnnualCost = 10000;
  const platformAdditionalAnnualCostPerBlock = 5000;
  const enterpriseThreshold = 120000;
  const annualDiscountStepValue = 100000;
  const annualDiscountPercentPerStep = 0.035;
  const annualDiscountMaxRate = 0.42;
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
  const totalHeading = zaproCalculator.querySelector('[data-total-heading]');
  const totalPrimary = zaproCalculator.querySelector('[data-total-primary]');
  const totalSecondary = zaproCalculator.querySelector('[data-total-secondary]');
  const totalTercier = zaproCalculator.querySelector('[data-total-tercier]');
  const pricingNote = zaproCalculator.querySelector('[data-pricing-note]');
  const enterprisePriceButton = zaproCalculator.querySelector('[data-enterprise-price]');
  const l1SupportBasis = zaproCalculator.querySelector('[data-l1-support-basis]');
  const platformFeeLabel = zaproCalculator.querySelector('[data-platform-fee-label]');
  const platformFeeBasis = zaproCalculator.querySelector('[data-platform-fee-basis]');

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

  function platformAdditionalBlocks() {
    const users = totalUserCount();
    return users > 250 ? Math.ceil((users - 250) / 250) : 0;
  }

  function platformAnnualCost() {
    return platformBaseAnnualCost + (platformAdditionalBlocks() * platformAdditionalAnnualCostPerBlock);
  }

  function l1SupportBlocks() {
    const users = totalUserCount();
    return users > 0 ? Math.ceil(users / 100) : 0;
  }

  function isOptionSelected(optionKey) {
    const input = optionInputs.find((item) => item.dataset.calcOption === optionKey);
    return Boolean(input && input.checked);
  }

  function l1SupportCost(billingMode) {
    if (!isOptionSelected('l1Support')) return 0;
    const supportBlocks = l1SupportBlocks();
    if (supportBlocks === 0) return 0;
    return billingMode === 'monthly'
      ? supportBlocks * l1SupportMonthlyPrice * 12
      : supportBlocks * l1SupportAnnualPrice;
  }

  function annualModuleCost(moduleKey, quantity, billingMode) {
    const price = modulePrices[moduleKey];
    if (!price) return 0;
    if (price.billingIndependent) return quantity * price.annual;
    return billingMode === 'monthly' ? quantity * price.monthly * 12 : quantity * price.annual;
  }

  function calculatePreDiscountTotal(billingMode) {
    const inputTotal = quantityInputs.reduce((sum, input) => {
      const moduleKey = input.dataset.calcInput;
      return sum + annualModuleCost(moduleKey, safeQuantity(input), billingMode);
    }, platformAnnualCost());

    return inputTotal + l1SupportCost(billingMode);
  }

  function annualDiscountSteps(preDiscountAnnualValue) {
    return preDiscountAnnualValue > 0 ? Math.floor(preDiscountAnnualValue / annualDiscountStepValue) : 0;
  }

  function annualDiscountRate(preDiscountAnnualValue) {
    return Math.min(annualDiscountSteps(preDiscountAnnualValue) * annualDiscountPercentPerStep, annualDiscountMaxRate);
  }

  function annualDiscountRateLabel(discountRate, discountSteps) {
    const discountPercent = Math.round(discountRate * 1000) / 10;
    const uncappedPercent = Math.round(discountSteps * annualDiscountPercentPerStep * 1000) / 10;
    return uncappedPercent > discountPercent
      ? `${discountPercent}% annual discount`
      : `${discountPercent}% annual discount`;
  }

  function annualDiscountAmount(billingMode, preDiscountAnnualValue) {
    if (billingMode !== 'annual') return 0;
    return Math.round(preDiscountAnnualValue * annualDiscountRate(preDiscountAnnualValue));
  }

  function calculateTotal(billingMode) {
    const preDiscountAnnualValue = calculatePreDiscountTotal(billingMode);
    return preDiscountAnnualValue - annualDiscountAmount(billingMode, preDiscountAnnualValue);
  }

  function updateRateLabels(billingMode) {
    Object.entries(modulePrices).forEach(([moduleKey, price]) => {
      const label = zaproCalculator.querySelector(`[data-rate-label="${moduleKey}"]`);
      if (!label) return;
      if (moduleKey === 'l1Support') {
        label.textContent = billingMode === 'monthly'
          ? `${euroFormatter.format(price.monthly)} per month per 100 users`
          : `${euroFormatter.format(price.annual)} per year per 100 users`;
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
    const currentPlatformAnnualCost = platformAnnualCost();
    let annualTotalValue = currentPlatformAnnualCost;

    updateRateLabels(billingMode);

    const platformOutput = zaproCalculator.querySelector('[data-total="platform"]');
    if (platformOutput) platformOutput.textContent = euroFormatter.format(currentPlatformAnnualCost);

    if (platformFeeLabel) platformFeeLabel.textContent = `${euroFormatter.format(currentPlatformAnnualCost)} / year`;

    if (platformFeeBasis) {
      const users = totalUserCount();
      const extraBlocks = platformAdditionalBlocks();
      platformFeeBasis.textContent = extraBlocks > 0
        ? `${users} users require ${extraBlocks} performance pack${extraBlocks === 1 ? '' : 's'} (+ ${euroFormatter.format(extraBlocks * platformAdditionalAnnualCostPerBlock)}).`
        : `Covers up to the first 250 total users.`;
    }

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
      const users = totalUserCount();
      const supportBlocks = l1SupportBlocks();
      l1SupportBasis.textContent = isOptionSelected('l1Support')
        ? supportBlocks > 0
          ? `For ${users} total user${users === 1 ? '' : 's'}, the support service is calculated as ${supportBlocks} pack${supportBlocks === 1 ? '' : 's'}, covering up to ${supportBlocks*100} users, with an annual cost of ${euroFormatter.format(currentL1SupportCost)}`
          : 'Selected, but no user quantities entered yet'
        : 'Optional service: if selected, pricing is calculated per started block of 100 users based on the total number of users.';
    }

    const preDiscountAnnualValue = annualTotalValue;
    const discountSteps = annualDiscountSteps(preDiscountAnnualValue);
    const discountRate = annualDiscountRate(preDiscountAnnualValue);
    const discountAmount = annualDiscountAmount(billingMode, preDiscountAnnualValue);
    const netAnnualValue = preDiscountAnnualValue - discountAmount;

    const discountOutput = zaproCalculator.querySelector('[data-total="discount"]');
    const discountRow = zaproCalculator.querySelector('[data-discount-row]');
    if (discountOutput) discountOutput.textContent = discountAmount > 0 ? `-${euroFormatter.format(discountAmount)}` : euroFormatter.format(0);
    if (discountRow) {
      const showDiscountRow = billingMode === 'annual' && discountAmount > 0;
      discountRow.hidden = !showDiscountRow;
      discountRow.setAttribute('aria-hidden', String(!showDiscountRow));
    }

    const annualBillingTotal = calculateTotal('annual');
    const monthlyBillingTotal = calculateTotal('monthly');
    const annualSaving = monthlyBillingTotal - annualBillingTotal;

    const estimatedMonthlyValue = Math.round(netAnnualValue / 12);

    if (billingMode === 'annual') {
      if (totalHeading) totalHeading.textContent = 'Estimated annual value';
      if (totalPrimary) totalPrimary.textContent = `${euroFormatter.format(netAnnualValue)} / year`;
      if (totalSecondary) {
        totalSecondary.textContent = discountAmount > 0
          ? `After ${annualDiscountRateLabel(discountRate, discountSteps)}.`
          : ``;
      }
      if (totalTercier) totalTercier.textContent = `Equivalent to ${euroFormatter.format(estimatedMonthlyValue)} / month`;
    } else {
      if (totalHeading) totalHeading.textContent = 'Estimated monthly value';
      if (totalPrimary) totalPrimary.textContent = `${euroFormatter.format(estimatedMonthlyValue)} / month`;
      if (totalSecondary) totalSecondary.textContent = ``;
      if (totalTercier) totalTercier.textContent = `Annualised value ${euroFormatter.format(netAnnualValue)} / year`;
    }

    if (enterprisePriceButton) {
      const shouldShowEnterpriseButton = netAnnualValue > enterpriseThreshold;
      enterprisePriceButton.hidden = !shouldShowEnterpriseButton;
      enterprisePriceButton.setAttribute('aria-hidden', String(!shouldShowEnterpriseButton));
    }

    if (pricingNote) {
      if (billingMode === 'annual' && discountAmount > 0) {
        pricingNote.textContent = `Annual billing discount: ${annualDiscountRateLabel(discountRate, discountSteps)} on the pre-discount annual value of ${euroFormatter.format(preDiscountAnnualValue)}, reducing the estimate by ${euroFormatter.format(discountAmount)}.`;
      } else if (annualSaving > 0) {
        pricingNote.textContent = billingMode === 'annual'
          ? `Annual rates save ${euroFormatter.format(annualSaving)} per year compared with paying monthly and annualising the spend. A 3.5% annual discount applies for each full ${euroFormatter.format(annualDiscountStepValue)} of pre-discount annual value, capped at ${Math.round(annualDiscountMaxRate * 100)}%.`
          : `Switching to annual rates would reduce the annualised subscription by ${euroFormatter.format(annualSaving)}. Annual-rate discounts are applied only when Annual rates are selected.`;
      } else {
        pricingNote.textContent = `Add user quantities to compare monthly annualised and annual subscription values. Annual-rate discounts are applied only when Annual rates are selected, the pre-discount annual value reaches ${euroFormatter.format(annualDiscountStepValue)}, and the discount cap is ${Math.round(annualDiscountMaxRate * 100)}%.`;
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
