const heroCopy = document.querySelector('.hero-grid > div:first-child');

if (heroCopy) {
  heroCopy.classList.add('motion-ready');

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const heroObserver = new IntersectionObserver(
      entries => entries.forEach(entry => heroCopy.classList.toggle('is-visible', entry.isIntersecting)),
      { threshold: 0.3 }
    );

    const startHeroMotion = async () => {
      await document.fonts.ready;
      if (document.readyState !== 'complete') {
        await new Promise(resolve => addEventListener('load', resolve, { once: true }));
      }
      setTimeout(() => heroObserver.observe(heroCopy), 120);
    };

    startHeroMotion();
  } else {
    heroCopy.classList.add('is-visible');
  }
}
