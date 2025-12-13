(function () {
  const toggle = document.querySelector('[data-pricing-toggle]');
  if (!toggle) return;

  const monthlyBtn = toggle.querySelector('[data-mode="monthly"]');
  const yearlyBtn = toggle.querySelector('[data-mode="yearly"]');
  if (!monthlyBtn || !yearlyBtn) return;

  const setMode = (mode) => {
    toggle.dataset.mode = mode;
    monthlyBtn.classList.toggle('active', mode === 'monthly');
    yearlyBtn.classList.toggle('active', mode === 'yearly');

    document.querySelectorAll('[data-price-monthly][data-price-yearly]').forEach((el) => {
      const value = mode === 'yearly' ? el.dataset.priceYearly : el.dataset.priceMonthly;
      el.textContent = value;
    });
  };

  monthlyBtn.addEventListener('click', () => setMode('monthly'));
  yearlyBtn.addEventListener('click', () => setMode('yearly'));

  setMode('yearly');
})();
