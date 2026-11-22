export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export type Tilt = { x: number; y: number };

/**
 * Eases toward a target pointer position on each frame and calls `apply`.
 * `x` and `y` go from -0.5 to 0.5, with 0 at the center.
 */
export function smoothTilt(apply: (tilt: Tilt) => void, ease = 0.12) {
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let frame = 0;
  const step = () => {
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    apply(current);
    const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
    frame = settled ? 0 : requestAnimationFrame(step);
  };
  const kick = () => (frame ||= requestAnimationFrame(step));
  return {
    aim(x: number, y: number) {
      target.x = x;
      target.y = y;
      kick();
    },
    reset() {
      target.x = 0;
      target.y = 0;
      kick();
    },
  };
}

/** Tilts a data page toward the pointer while the pointer is over it. */
export function bindTilt(target: HTMLElement, max: number) {
  if (reducedMotion()) return;
  const tilt = smoothTilt(({ x, y }) => {
    target.style.setProperty("--rx", `${-y * max}deg`);
    target.style.setProperty("--ry", `${x * max}deg`);
    target.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    target.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  });
  target.addEventListener("pointermove", (event) => {
    const box = target.getBoundingClientRect();
    tilt.aim((event.clientX - box.left) / box.width - 0.5, (event.clientY - box.top) / box.height - 0.5);
  });
  target.addEventListener("pointerleave", () => tilt.reset());
}
