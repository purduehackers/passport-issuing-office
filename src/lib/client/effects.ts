import { reducedMotion } from "./tilt";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<";
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Flips the characters of `nodes` like a departures board until they show `text`. */
export function flap(nodes: Node[], text: string[], { stagger = 28, settle = 260 } = {}) {
  if (reducedMotion()) {
    nodes.forEach((node, i) => (node.textContent = text[i] ?? ""));
    return Promise.resolve();
  }
  return new Promise<void>((done) => {
    const start = performance.now();
    const tick = (now: number) => {
      let finished = true;
      nodes.forEach((node, i) => {
        const target = text[i] ?? "";
        if (now - start > settle + i * stagger) node.textContent = target;
        else {
          finished = false;
          node.textContent = target === " " || target === "" ? target : randomGlyph();
        }
      });
      if (finished) done();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Splits an element into one text node for each character, so `flap` can animate it. */
export function letters(element: Element, length: number) {
  const nodes = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
  if (nodes.length !== length) {
    element.replaceChildren(...Array.from({ length }, () => document.createTextNode("")));
  }
  return [...element.childNodes];
}

const COLORS = ["#fcd202", "#7d3bff", "#efb9ff", "#ff9300", "#a5e209", "#01beb2", "#0084ff"];
const GLIDER = '<svg viewBox="0 0 3 3" shape-rendering="crispEdges"><path d="M1 0h1v1H1zM2 1h1v1H2zM0 2h3v1H0z" fill="currentColor"/></svg>';

/** Throws pixel gliders out from a point on the screen. */
export function gliderBurst(x: number, y: number, count = 22) {
  if (reducedMotion()) return;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
  document.body.append(layer);
  const flights = Array.from({ length: count }, (_, i) => {
    const glider = document.createElement("div");
    const size = 10 + Math.random() * 14;
    glider.innerHTML = GLIDER;
    glider.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;color:${COLORS[i % COLORS.length]}`;
    layer.append(glider);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 120 + Math.random() * 220;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const spin = Math.round(Math.random() * 4 - 2) * 90;
    return glider.animate(
      [
        { transform: "translate(-50%, -50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy * 1.15 + 160}px)) rotate(${spin * 1.5}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" },
    ).finished;
  });
  Promise.all(flights).finally(() => layer.remove());
}
