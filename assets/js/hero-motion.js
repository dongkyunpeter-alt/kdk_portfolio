const heroCopy = document.querySelector('.hero-grid > div:first-child');

if (heroCopy) {
  heroCopy.classList.add('motion-ready');

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const heroObserver = new IntersectionObserver(
      entries => entries.forEach(entry => heroCopy.classList.toggle('is-visible', entry.isIntersecting)),
      { threshold: 0.3 }
    );

    heroObserver.observe(heroCopy);
  } else {
    heroCopy.classList.add('is-visible');
  }
}
