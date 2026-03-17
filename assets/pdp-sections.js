const initInlineTabs = (scope) => {
  const buttons = scope.querySelectorAll('[data-tab-button]');
  const panels = scope.querySelectorAll('[data-tab-panel]');
  if (!buttons.length || !panels.length || scope.dataset.pdpTabsInitialized === 'true') return;

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
    });
  });

  scope.dataset.pdpTabsInitialized = 'true';
};

const initBenefitRotator = (scope) => {
  const triggers = [...scope.querySelectorAll('[data-rotator-trigger]')];
  const panels = [...scope.querySelectorAll('[data-rotator-panel]')];
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

  scope.addEventListener('mouseenter', () => window.clearInterval(timerId));
  scope.addEventListener('mouseleave', start);
  start();

  scope.dataset.pdpRotatorInitialized = 'true';
};

const initComparison = (scope) => {
  const cards = scope.querySelector('[data-comparison-cards]');
  const dots = [...scope.querySelectorAll('[data-comparison-dot]')];
  if (!cards || !dots.length || scope.dataset.pdpComparisonInitialized === 'true') return;

  const updateDots = () => {
    const index = Math.round(cards.scrollLeft / Math.max(cards.clientWidth, 1));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      cards.scrollTo({ left: cards.clientWidth * index, behavior: 'smooth' });
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

