const badge = document.querySelector('.stella-hero .stella-badge');
const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

function setFlipped(flipped) {
  badge.classList.toggle('stella-is-flipped', flipped);
  badge.setAttribute('aria-pressed', String(flipped));
  badge.setAttribute('aria-label', flipped ? 'Stella 工牌背面：比耶。点击恢复工作状态' : 'Stella 工牌正面：工作中。悬停或点击查看比耶');
}

badge.addEventListener('click', () => {
  if (coarsePointer.matches) setFlipped(!badge.classList.contains('stella-is-flipped'));
});
badge.addEventListener('pointerleave', () => {
  if (!coarsePointer.matches) setFlipped(false);
});

