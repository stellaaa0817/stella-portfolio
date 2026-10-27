const badge = document.querySelector('.hero .badge');
const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

function setFlipped(flipped) {
  badge.classList.toggle('is-flipped', flipped);
  badge.setAttribute('aria-pressed', String(flipped));
  badge.setAttribute('aria-label', flipped ? 'Stella 工牌背面：比耶。点击恢复工作状态' : 'Stella 工牌正面：工作中。悬停或点击查看比耶');
}

badge.addEventListener('click', () => {
  if (coarsePointer.matches) setFlipped(!badge.classList.contains('is-flipped'));
});
badge.addEventListener('pointerleave', () => {
  if (!coarsePointer.matches) setFlipped(false);
});

const sourceStage = document.querySelector('.hero .badge-stage');
document.querySelectorAll('.state-card').forEach((card, index) => {
  const clone = sourceStage.cloneNode(true);
  clone.querySelectorAll('[id]').forEach(element => {
    const oldId = element.id;
    const newId = `${oldId}-preview-${index}`;
    clone.querySelectorAll('[href], [fill], [stroke]').forEach(ref => {
      for (const attribute of ['href', 'fill', 'stroke']) {
        if (ref.getAttribute(attribute)?.includes(`#${oldId}`)) {
          ref.setAttribute(attribute, ref.getAttribute(attribute).replace(`#${oldId}`, `#${newId}`));
        }
      }
    });
    element.id = newId;
  });
  clone.querySelector('.badge').setAttribute('tabindex', '-1');
  clone.querySelector('.badge').setAttribute('aria-hidden', 'true');
  card.querySelector('.state-stage').append(clone);
});
