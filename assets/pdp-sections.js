const initInlineTabs = (scope) => {
  const buttons = scope.querySelectorAll('[data-tab-button]');
  const panels = scope.querySelectorAll('[data-tab-panel]');
  const indicator = scope.querySelector('[data-tab-indicator]');
  if (!buttons.length || !panels.length || scope.dataset.pdpTabsInitialized === 'true') return;

  const updateIndicator = (button) => {
    if (!indicator || !button) return;
    const navRect = button.parentElement?.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    if (!navRect.width || !buttonRect.width) return;

    indicator.style.width = `${buttonRect.width}px`;
    indicator.style.transform = `translateX(${buttonRect.left - navRect.left}px)`;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-tab-target');

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === target);
      });

      updateIndicator(button);
    });
  });

  const activeButton = [...buttons].find((button) => button.classList.contains('is-active')) || buttons[0];
  updateIndicator(activeButton);

  window.addEventListener('resize', () => {
    const currentActiveButton = [...buttons].find((button) => button.classList.contains('is-active')) || buttons[0];
    updateIndicator(currentActiveButton);
  });

  scope.dataset.pdpTabsInitialized = 'true';
};

const initBenefitRotator = (scope) => {
  const triggers = [...scope.querySelectorAll('[data-rotator-trigger]')];
  const panels = [...scope.querySelectorAll('[data-rotator-panel]')];
  const mobileActive = scope.querySelector('[data-rotator-mobile-active]');
  const prevButton = scope.querySelector('[data-rotator-prev]');
  const nextButton = scope.querySelector('[data-rotator-next]');
  if (!triggers.length || !panels.length || scope.dataset.pdpRotatorInitialized === 'true') return;

  let index = 0;
  const delay = Math.max(1, Number(scope.dataset.rotateSeconds || 10)) * 1000;
  let timerId;

  const activate = (nextIndex) => {
    index = nextIndex;
    const targetId = triggers[index]?.dataset.target;
    if (!targetId) return;

    triggers.forEach((trigger, triggerIndex) => {
      const active = triggerIndex === index;
      trigger.classList.toggle('is-active', active);
      trigger.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === targetId);
    });

    if (mobileActive && triggers[index]) {
      mobileActive.innerHTML = triggers[index].outerHTML;
      const activeButton = mobileActive.querySelector('.pdp-benefit-rotator__pill');
      if (activeButton) {
        activeButton.classList.add('is-active');
        activeButton.setAttribute('aria-selected', 'true');
        activeButton.setAttribute('tabindex', '-1');
        activeButton.disabled = true;
      }
    }
  };

  const start = () => {
    window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      activate((index + 1) % triggers.length);
    }, delay);
  };

  triggers.forEach((trigger, triggerIndex) => {
    trigger.addEventListener('click', () => {
      activate(triggerIndex);
      start();
    });
  });

  prevButton?.addEventListener('click', () => {
    activate((index - 1 + triggers.length) % triggers.length);
    start();
  });

  nextButton?.addEventListener('click', () => {
    activate((index + 1) % triggers.length);
    start();
  });

  scope.addEventListener('mouseenter', () => window.clearInterval(timerId));
  scope.addEventListener('mouseleave', start);
  start();

  scope.dataset.pdpRotatorInitialized = 'true';
};

const initComparison = (scope) => {
  const cards = scope.querySelector('[data-comparison-cards]');
  const dots = [...scope.querySelectorAll('[data-comparison-dot]')];
  if (!cards || !dots.length || scope.dataset.pdpComparisonInitialized === 'true') return;

  const cardEls = [...cards.querySelectorAll('.pdp-comparison__card')];
  const mobileWrapper = scope.querySelector('.pdp-comparison__mobile');
  const firstFeaturedValue = cards.querySelector('.pdp-comparison__mobile-featured-value');

  const positionBand = () => {
    if (!mobileWrapper || !firstFeaturedValue) return;
    const wrapperRect = mobileWrapper.getBoundingClientRect();
    const featuredRect = firstFeaturedValue.getBoundingClientRect();
    mobileWrapper.style.setProperty('--band-top', `${featuredRect.top - wrapperRect.top}px`);
    mobileWrapper.style.setProperty('--band-height', `${featuredRect.height}px`);
  };

  positionBand();
  window.addEventListener('resize', positionBand);

  const updateDots = () => {
    if (!cardEls.length) return;

    const left = cards.scrollLeft;
    let bestIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    cardEls.forEach((el, i) => {
      const dist = Math.abs(el.offsetLeft - left);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });

    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === bestIndex));
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const targetCard = cardEls[index];
      if (!targetCard) return;
      cards.scrollTo({ left: targetCard.offsetLeft, behavior: 'smooth' });
    });
  });

  cards.addEventListener(
    'scroll',
    () => window.requestAnimationFrame(updateDots),
    { passive: true }
  );

  scope.dataset.pdpComparisonInitialized = 'true';
};

const initPdpSections = (root = document) => {
  root.querySelectorAll('[data-pdp-inline-tabs]').forEach(initInlineTabs);
  root.querySelectorAll('[data-pdp-benefit-rotator]').forEach(initBenefitRotator);
  root.querySelectorAll('[data-pdp-comparison]').forEach(initComparison);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initPdpSections(), { once: true });
} else {
  initPdpSections();
}
