const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }); }, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const directionCards = [...document.querySelectorAll('.direction')];
const usesTouchNavigation = window.matchMedia('(hover: none), (pointer: coarse)');
let directionFrame;

const updateActiveDirection = () => {
  directionFrame = undefined;
  if (!usesTouchNavigation.matches || directionCards.length === 0) return;

  const viewportCenter = window.innerHeight / 2;
  const visibleCards = directionCards.filter((card) => {
    const rect = card.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  });

  if (visibleCards.length === 0) {
    directionCards.forEach((card) => card.classList.remove('is-active'));
    return;
  }

  const activeCard = visibleCards.reduce((closest, card) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
    return distance < closest.distance ? { card, distance } : closest;
  }, { card: null, distance: Infinity }).card;

  directionCards.forEach((card) => card.classList.toggle('is-active', card === activeCard));
};

const queueDirectionUpdate = () => {
  if (directionFrame === undefined) directionFrame = requestAnimationFrame(updateActiveDirection);
};

const activateDirection = (activeCard) => {
  directionCards.forEach((card) => card.classList.toggle('is-active', card === activeCard));
};

directionCards.forEach((card) => {
  card.addEventListener('pointerdown', () => {
    if (usesTouchNavigation.matches) activateDirection(card);
  });
});

document.querySelector('.direction-list')?.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  const touchedCard = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.direction');
  if (touchedCard) activateDirection(touchedCard);
}, { passive: true });

window.addEventListener('scroll', queueDirectionUpdate, { passive: true });
window.addEventListener('resize', queueDirectionUpdate);
usesTouchNavigation.addEventListener('change', () => {
  directionCards.forEach((card) => card.classList.remove('is-active'));
  queueDirectionUpdate();
});
queueDirectionUpdate();
