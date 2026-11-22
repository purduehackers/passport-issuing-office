/**
 * Pixel airport: an animated pixel-art departure gate on a <canvas>.
 * Travelers queue, show their passports, get stamped and board through the jet bridge
 * while planes take off and land outside the windows.
 * No dependencies. Works in any framework or in a plain HTML page.
 */

// ---------------------------------------------------------------------------
// Palette

const C = {
  ceiling: "#0d0820",
  ceilingLine: "#170f33",
  lamp: "#fff3c4",
  frame: "#1a1036",
  frameLight: "#33255f",
  floorTop: "#24164a",
  floorMid: "#170e33",
  floorBottom: "#0a0617",
  wall: "#1b1239",
  wallLight: "#2a1d55",
  doorDark: "#07040f",
  doorGlow: "#ff9300",
  skyline: "#150a31",
  skylineEdge: "#1f1043",
  windowLit: "#d9a520",
  windowWarm: "#ff9a3c",
  ground: "#0c061d",
  runway: "#221846",
  runwayMark: "#8f86b8",
  edgeLight: "#fff1b0",
  taxiLight: "#2f8cff",
  moon: "#fbf3d8",
  moonShade: "#c9b98f",
  star: "#ffffff",
  starDim: "#8f86c9",
  fuselage: "#ece6f7",
  fuselageShade: "#b7acd6",
  belly: "#8e83b4",
  tail: "#7d3bff",
  glider: "#fcd202",
  cockpit: "#1b1240",
  planeWindow: "#ffd76a",
  engine: "#6f6795",
  wing: "#4c4378",
  navRed: "#ff3b3b",
  navGreen: "#3bff7a",
  strobe: "#ffffff",
  bridge: "#3a2d66",
  bridgeDark: "#2a2050",
  bridgeLight: "#ffb347",
  boardBg: "#050208",
  boardFrame: "#2c2250",
  boardText: "#fcd202",
  boardDest: "#f4f0ff",
  boarding: "#a5e209",
  delayed: "#ff9300",
  dim: "#6d6590",
  desk: "#2b1f55",
  deskTop: "#4a3b7a",
  deskEdge: "#5c4b94",
  screen: "#01beb2",
  uniform: "#23205e",
  epaulette: "#fcd202",
  cap: "#191650",
  stampInk: "#ff3b6b",
  post: "#3d3466",
  postTop: "#fcd202",
  rope: "#c0306b",
  seat: "#2d2156",
  seatLight: "#43357a",
  seatDark: "#1a1236",
  plant: "#2f8a4a",
  plantDark: "#1d5c31",
  pot: "#a0522d",
  eye: "#1b0f3a",
  passport: "#7d3bff",
  bubble: "#fbf7ec",
  bubbleText: "#1b0f3a",
  laptop: "#8fe8ff",
  book: "#ff9300",
};

const SKY = [
  [0, "#05010f"],
  [0.32, "#110430"],
  [0.56, "#25094f"],
  [0.74, "#491878"],
  [0.86, "#86318a"],
  [0.94, "#d0587c"],
  [1, "#ff9a5c"],
];

const SKIN = ["#f8d7b9", "#e8b48a", "#c68857", "#965f37", "#5f3b22"];
const HAIR = ["#1b1020", "#3b2414", "#6b3e1e", "#c9a04a", "#d65f2a", "#efe7d6", "#7d3bff", "#ff6fb5"];
const SHIRT = ["#fcd202", "#efb9ff", "#01beb2", "#a5e209", "#ff9300", "#0084ff", "#7688ff", "#fbf7ec", "#7d3bff", "#ff5a5a"];
const PANTS = ["#24305e", "#1b1b24", "#8a7650", "#3b2a66", "#2f4a3a", "#5a2a2a"];
const BAGS = ["#ff9300", "#01beb2", "#efb9ff", "#fcd202", "#7688ff", "#ff5a5a", "#a5e209"];

/** Hack Night venues, oldest first, then the offices. The gate row stays at the top of the board. */
const GATE_ROUTE = ["HN 7.3", "HIVE", "BOARDING"];
const ROUTES = [
  ["HN 0.1", "WALC 1087", "DEPARTED"],
  ["HN 0.2", "WALC 1121", "DEPARTED"],
  ["HN 0.3", "WALC 2124", "DEPARTED"],
  ["HN 0.4", "WALC 1087", "DEPARTED"],
  ["HN 1.3", "WALC 2124", "DEPARTED"],
  ["HN 2.0", "BECHTEL", "DEPARTED"],
  ["LAWFICE", "LWSN B138", "LOUNGE"],
  ["LAMBFICE", "LMBS 1240", "LOUNGE"],
];
const STATUS_COLORS = { BOARDING: C.boarding, DEPARTED: C.dim, LOUNGE: C.screen };
const BOARD_COLUMNS = [8, 9, 8];
const GREETINGS = ["NEXT!", "WELCOME", "ENJOY!", "BON VOYAGE", "NICE CAT", "STAMPED!"];

// ---------------------------------------------------------------------------
// Pixel font, 3 × 5

const GLYPHS = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", 0: "111101101101111", 1: "010110010010111",
  2: "110001010100111", 3: "110001010001110", 4: "101101111001001", 5: "111100110001110",
  6: "011100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001110",
  "!": "010010010000010", "-": "000000111000000", ".": "000000000000010", ":": "000010000010000",
  " ": "000000000000000",
  "←": "001010111010001", "→": "100010111010100",
};
const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// ---------------------------------------------------------------------------
// Helpers

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (random, list) => list[Math.floor(random() * list.length)];

function hexMix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** A drawing surface with pixel helpers. */
function surface(context) {
  return {
    context,
    px(x, y, color) {
      context.fillStyle = color;
      context.fillRect(x | 0, y | 0, 1, 1);
    },
    rect(x, y, w, h, color) {
      if (w <= 0 || h <= 0) return;
      context.fillStyle = color;
      context.fillRect(x | 0, y | 0, w | 0, h | 0);
    },
    text(x, y, string, color) {
      context.fillStyle = color;
      let cx = x | 0;
      for (const char of string) {
        const glyph = GLYPHS[char] ?? GLYPHS[" "];
        for (let i = 0; i < 15; i++) if (glyph[i] === "1") context.fillRect(cx + (i % 3), (y | 0) + Math.floor(i / 3), 1, 1);
        cx += 4;
      }
    },
    /** Draws rows of characters. `map` gives each character a color; "." is empty. */
    sprite(x, y, rows, map, flip = false, width = 0) {
      const w = width || Math.max(...rows.map((r) => r.length));
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        for (let c = 0; c < row.length; c++) {
          const color = map[row[c]];
          if (!color) continue;
          context.fillStyle = color;
          context.fillRect((x + (flip ? w - 1 - c : c)) | 0, (y + r) | 0, 1, 1);
        }
      }
    },
  };
}

function offscreen(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas;
}

// ---------------------------------------------------------------------------
// Sprites

const PLANE = [
  "tt",
  "ttt",
  "tgtt",
  "ttttccccccccccccccccccccccc",
  ".tccwcwcwcwcwcwcwcwcwcwccckk",
  "..cccccccccccccccccccccccccccc",
  "...ssssssssssssssssssssssssss",
  "....bbbbbbbbbbbbbbbbbbbbbbb",
  "..........nnnnnnnnn",
  "...........eeee",
];
const PLANE_MAP = {
  t: C.tail, g: C.glider, c: C.fuselage, w: C.planeWindow, k: C.cockpit,
  s: C.fuselageShade, b: C.belly, n: C.wing, e: C.engine,
};

const TINY_PLANE = ["t......", "tcccccc", "..nn..."];

const DUCK = [
  "..WWW...",
  ".WWWEW..",
  ".WWWWOO.",
  "..WWW...",
  ".WWWWW..",
  "WWWWWWW.",
  "WWWWWWW.",
  ".WWWWW..",
];

const ROBOT = [
  "...L...",
  "...G...",
  ".GGGGG.",
  ".GVVVG.",
  ".GGGGG.",
  "..GGG..",
  ".MMMMM.",
  "GMMMMMG",
  "GMYMMMG",
  ".MMMMM.",
];

// Walk cycle. Each leg has a stance half (the foot is planted and moves back at ground speed)
// and a swing half (the foot lifts and comes forward). The phase advances with distance walked,
// so planted feet do not slide.
const STRIDE = { person: 2.5, duck: 1.5, robot: 2 };
const stepOf = (kind) => Math.PI / (2 * STRIDE[kind]);

function footAt(phase, stride) {
  const p = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (p < Math.PI) return { x: stride - (2 * stride * p) / Math.PI, lift: 0 };
  const q = (p - Math.PI) / Math.PI;
  return { x: -stride + 2 * stride * q, lift: Math.sin(q * Math.PI) * 2 };
}

function line(put, x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    put(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** Draws a two-pixel leg from the hip to the foot, with the knee bent forward while the foot is up. */
function drawLeg(put, hipX, hipY, foot, footY, color, shoe, { bend = 1, footWidth = 3 } = {}) {
  const lift = Math.round(foot.lift);
  const fx = Math.round(hipX + foot.x);
  const fy = footY - lift;
  const kx = Math.round(hipX + foot.x / 2 + (lift > 0 ? bend : 0));
  const ky = Math.round((hipY + fy) / 2);
  const leg = (x, y) => {
    put(x, y, color);
    put(x + 1, y, color);
  };
  line(leg, hipX, hipY, kx, ky);
  line(leg, kx, ky, fx, fy - 1);
  for (let i = 0; i < footWidth; i++) put(fx + i, fy, shoe);
}

const HEADS = {
  short: ["..HHH..", ".HHHHH.", ".HHSSS.", ".HSSES.", "..SSS.."],
  long: ["..HHH..", ".HHHHH.", ".HHSSS.", "HHSSES.", "HH.SS.."],
  bun: ["..HH...", ".HHHH..", ".HHHHH.", ".HHSES.", "..SSS.."],
  cap: ["..CCC..", ".CCCCCC", ".HHSSS.", ".HSSES.", "..SSS.."],
  bald: ["..SSS..", ".SSSSS.", ".SSSSS.", ".SSSES.", "..SSS.."],
  curly: [".HHHHH.", "HHHHHHH", "HHHSSS.", ".HSSES.", "..SSS.."],
};
const TORSO = ["..TTT..", ".TTTTT.", ".TTTTT.", ".TTTTT.", ".TTTTT.", ".PPPPP."];

// ---------------------------------------------------------------------------
// Scene

/**
 * @typedef {object} PixelAirportOptions
 * @property {number} [cell]               Size of one pixel, in CSS pixels. The default fits the canvas.
 * @property {number} [seed=7]             Seed for the skyline, stars and travelers.
 * @property {boolean} [interactive=true]  The view through the windows shifts with the pointer.
 * @property {number} [boardMinWidth=0]    Hides the departures board when the scene is narrower than this, in scene pixels.
 */

/**
 * Starts the airport on a canvas. The canvas fills its own CSS box.
 * Give it `image-rendering: pixelated` so the pixels stay sharp.
 * @param {HTMLCanvasElement} canvas
 * @param {PixelAirportOptions} [options]
 * @returns {() => void} Stops the animation and removes the listeners.
 */
export function pixelAirport(canvas, options = {}) {
  const { seed = 7, interactive = true } = options;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const context = canvas.getContext("2d");
  const g = surface(context);

  let W = 0;
  let H = 0;
  let L = null;
  let layers = null;
  let frame = 0;
  let last = 0;
  let time = 0;
  const pointer = { target: 0, x: 0 };

  // Dynamic state
  let stars = [];
  let twinkles = [];
  let planes = [];
  let travelers = [];
  let strollers = [];
  let boarders = [];
  let sparks = [];
  let board = [];
  let boardOffset = 0;
  let bubble = null;
  let random = rng(seed);
  const officer = { stamp: -1, look: 0 };
  const tug = { x: -40, dir: 1, wait: 0 };
  const timers = { traveler: 0.5, plane: 2, stroller: 4, board: 4, tiny: 6 };

  // -------------------------------------------------------------------------
  // Layout

  function layout() {
    const floorY = Math.round(H * 0.8);
    const top = Math.max(6, Math.round(H * 0.07));
    const glassH = floorY - top;
    const horizon = floorY - Math.round(glassH * 0.24);
    const wallX = W - Math.min(30, Math.max(22, Math.round(W * 0.08)));
    const deskX = wallX - (W < 200 ? 30 : 46);
    const laneY = floorY + Math.max(12, Math.round((H - floorY) * 0.42));
    const noseX = wallX - 6;
    const planeY = floorY - 24;
    return {
      floorY, top, glassH, horizon, wallX, deskX, laneY, noseX, planeY,
      transomY: top + Math.round(glassH * 0.3),
      mullion: W < 200 ? 40 : 56,
      doorX: wallX + 6,
      deskSpot: deskX - 10,
      bridgeY: planeY + 8,
      bridgeLeft: noseX - 26,
      runwayY: horizon + 5,
      pad: 8,
    };
  }

  // -------------------------------------------------------------------------
  // Static layers

  function buildSky() {
    const { horizon, top, floorY, pad } = L;
    const width = W + pad * 2;
    const canvas = offscreen(width, floorY);
    const s = surface(canvas.getContext("2d"));
    const r = rng(seed * 31 + 1);

    for (let y = top; y < horizon; y++) {
      const f = (y - top) / (horizon - top);
      let i = 0;
      while (i < SKY.length - 2 && f > SKY[i + 1][0]) i++;
      const [a, ca] = SKY[i];
      const [b, cb] = SKY[i + 1];
      const t = (f - a) / (b - a);
      for (let x = 0; x < width; x++) s.px(x, y, bayer(x, y) < t ? cb : ca);
    }

    // Moon with a dithered halo.
    const mx = Math.round(width * 0.14);
    const my = top + Math.round((horizon - top) * 0.2);
    for (let y = -12; y <= 12; y++)
      for (let x = -12; x <= 12; x++) {
        const d = Math.hypot(x, y);
        if (d <= 5) s.px(mx + x, my + y, Math.hypot(x + 2, y - 1) < 4.2 ? C.moonShade : C.moon);
        else if (d < 11 && bayer(mx + x, my + y) < (11 - d) / 18) s.px(mx + x, my + y, "#3a1f6e");
      }
    s.px(mx + 1, my - 2, C.moonShade);
    s.px(mx - 2, my + 2, C.moonShade);

    // Ground and runway.
    s.rect(0, horizon, width, floorY - horizon, C.ground);
    s.rect(0, L.runwayY, width, 3, C.runway);
    for (let x = 0; x < width; x += 8) s.rect(x, L.runwayY + 1, 4, 1, C.runwayMark);
    s.rect(0, L.runwayY + 8, width, 1, "#160d30");

    // Skyline.
    let x = 0;
    while (x < width) {
      const w = 5 + Math.floor(r() * 12);
      const tall = r() < 0.18;
      const h = Math.round((tall ? 14 + r() * 16 : 3 + r() * 11) * Math.min(1, (horizon - top) / 110));
      const y0 = horizon - h;
      s.rect(x, y0, w, h, C.skyline);
      s.rect(x, y0, w, 1, C.skylineEdge);
      for (let wy = y0 + 2; wy < horizon - 1; wy += 2)
        for (let wx = x + 1; wx < x + w - 1; wx += 2) {
          const v = r();
          if (v < 0.22) s.px(wx, wy, v < 0.05 ? C.windowWarm : hexMix(C.windowLit, C.skyline, 0.35 + r() * 0.3));
          else if (v < 0.24) twinkles.push({ x: wx, y: wy, phase: r() * 10, speed: 0.2 + r() * 0.5 });
        }
      if (tall && h > 16) {
        s.rect(x + (w >> 1), y0 - 3, 1, 3, C.skylineEdge);
        twinkles.push({ x: x + (w >> 1), y: y0 - 4, phase: r() * 6, speed: 1.4, beacon: true });
      }
      x += w + (r() < 0.3 ? 1 + Math.floor(r() * 4) : 0);
    }

    // Control tower.
    const tx = Math.round(width * 0.3);
    const tTop = horizon - Math.round((horizon - top) * 0.42);
    s.rect(tx, tTop + 8, 4, horizon - tTop - 8, "#1d1040");
    s.rect(tx - 1, tTop + 8, 6, 1, "#2a1859");
    s.rect(tx - 3, tTop + 3, 10, 5, "#24134d");
    s.rect(tx - 2, tTop + 4, 8, 2, "#7fe3ff");
    s.rect(tx - 3, tTop + 2, 10, 1, "#2f1b63");
    s.rect(tx + 1, tTop - 1, 2, 3, "#24134d");
    twinkles.push({ x: tx + 1, y: tTop - 2, phase: 0, speed: 1, beacon: true, color: C.navGreen, w: 2 });

    // Stars.
    stars = [];
    const count = Math.round((width * (horizon - top)) / 70);
    for (let i = 0; i < count; i++) {
      const sy = top + Math.floor(r() * r() * (horizon - top - 14));
      const sx = Math.floor(r() * width);
      if (Math.hypot(sx - mx, sy - my) < 12) continue;
      const bright = r() < 0.12;
      if (!bright) s.px(sx, sy, r() < 0.5 ? C.starDim : "#5d538f");
      else stars.push({ x: sx, y: sy, phase: r() * 6.28, speed: 0.8 + r() * 2 });
    }
    return canvas;
  }

  function buildOutside() {
    const { floorY, noseX, planeY, bridgeY, bridgeLeft, wallX, pad } = L;
    const width = W + pad * 2;
    const canvas = offscreen(width, floorY);
    const s = surface(canvas.getContext("2d"));
    const nose = noseX + pad;
    const length = Math.min(230, Math.round(W * 0.6));
    const tail = nose - length;
    const cy = planeY + 11;

    // Tail fin with the glider.
    const finBase = cy - 9;
    const finH = 17;
    for (let k = 0; k <= finH; k++) {
      const t = k / finH;
      const left = tail + 1 + Math.round(t * 7);
      const right = tail + 26 - Math.round(t * 15);
      s.rect(left, finBase - k, right - left, 1, k === finH ? "#9b6bff" : C.tail);
    }
    const gx = tail + 9;
    const gy = finBase - 12;
    s.rect(gx + 2, gy, 2, 4, C.glider);
    s.rect(gx + 4, gy + 2, 2, 4, C.glider);
    s.rect(gx, gy + 4, 2, 2, C.glider);

    // Fuselage, nose to the right.
    for (let x = Math.max(0, tail); x <= nose; x++) {
      const d = nose - x;
      const e = x - tail;
      let up = 10;
      let down = 10;
      if (d < 16) up = down = Math.round(10 * Math.sqrt(1 - ((16 - d) / 16) ** 2));
      if (e < 34) down = Math.max(2, 10 - Math.round(((34 - e) / 34) * 8));
      if (e < 8) up = Math.max(3, up - Math.round(((8 - e) / 8) * 4));
      for (let y = cy - up; y <= cy + down; y++) {
        let color = y > cy + 5 ? C.belly : y > cy + 2 ? C.fuselageShade : C.fuselage;
        if (y === cy - up) color = "#f8f4ff";
        s.px(x, y, color);
      }
      if (d > 6 && e > 6) {
        if (cy + 1 <= cy + down) s.px(x, cy + 1, C.tail);
        if (cy + 2 <= cy + down) s.px(x, cy + 2, C.tail);
        if (cy + 3 <= cy + down) s.px(x, cy + 3, C.glider);
      }
      if (d > 28 && e > 36 && (d - 28) % 3 === 0) s.px(x, cy - 3, C.planeWindow);
    }

    // Horizontal stabilizer.
    s.rect(Math.max(0, tail), cy - 3, 16, 2, C.wing);
    s.rect(Math.max(0, tail), cy - 3, 16, 1, "#6a5fa0");

    // Cockpit and door.
    s.rect(nose - 9, cy - 6, 2, 1, C.cockpit);
    s.rect(nose - 6, cy - 6, 3, 2, C.cockpit);
    s.px(nose - 5, cy - 6, "#5d6fd6");
    s.rect(nose - 24, cy - 8, 1, 12, C.fuselageShade);
    s.rect(nose - 19, cy - 8, 1, 12, C.fuselageShade);

    // Wing and engine.
    const mid = tail + Math.round(length * 0.52);
    s.rect(mid - 34, cy + 5, 54, 2, C.wing);
    s.rect(mid - 34, cy + 5, 54, 1, "#6a5fa0");
    for (let y = 0; y < 7; y++) {
      const inset = y === 0 || y === 6 ? 2 : y === 1 || y === 5 ? 1 : 0;
      s.rect(mid - 12 + inset, cy + 7 + y, 20 - inset * 2, 1, y < 2 ? "#8b84b0" : C.engine);
    }
    s.rect(mid + 6, cy + 8, 2, 5, "#2b2550");
    s.rect(mid - 13, cy + 9, 2, 3, "#4a4373");

    // Landing gear.
    s.rect(mid - 2, cy + 14, 1, floorY - cy - 16, "#3a3160");
    s.rect(mid - 4, floorY - 3, 5, 3, "#120b25");
    s.rect(nose - 11, cy + 9, 1, floorY - cy - 11, "#3a3160");
    s.rect(nose - 12, floorY - 2, 3, 2, "#120b25");

    // Jet bridge from the terminal to the door.
    const left = bridgeLeft + pad;
    const right = wallX + pad + 2;
    s.rect(left, bridgeY, right - left, 11, C.bridge);
    s.rect(left, bridgeY, right - left, 1, "#4d3e84");
    s.rect(left, bridgeY + 10, right - left, 1, C.bridgeDark);
    s.rect(left + 1, bridgeY + 3, right - left - 2, 4, "#2a1d10");
    for (let x = left + 1; x < right - 1; x++) if ((x - left) % 5 !== 0) s.rect(x, bridgeY + 3, 1, 4, hexMix(C.bridgeLight, "#2a1d10", 0.45));
    for (let i = 0; i < 4; i++) s.rect(left + i * 2, bridgeY - 1, 1, 13, i % 2 ? C.bridge : C.bridgeDark);
    const col = right - Math.max(6, Math.round((right - left) * 0.35));
    s.rect(col, bridgeY + 11, 2, floorY - bridgeY - 11, "#2a2050");
    s.rect(col - 2, floorY - 3, 6, 3, "#120b25");
    return canvas;
  }

  function buildInterior() {
    const { top, floorY, transomY, mullion, wallX, doorX, deskX, laneY } = L;
    const canvas = offscreen(W, H);
    const s = surface(canvas.getContext("2d"));

    // Ceiling.
    s.rect(0, 0, W, top, C.ceiling);
    for (let x = 0; x < W; x += 24) s.rect(x, 0, 1, top, C.ceilingLine);
    for (let x = 12; x < W; x += 48) {
      s.rect(x, top - 2, 6, 1, C.lamp);
      s.rect(x - 1, top - 1, 8, 1, "#3a2f5a");
    }

    // Glass reflections.
    s.context.fillStyle = "rgba(255,255,255,0.035)";
    for (let x = 0; x < W + floorY; x += mullion) {
      for (let i = 0; i < floorY - top; i++) s.context.fillRect(x - i * 0.5, top + i, 6, 1);
      for (let i = 0; i < floorY - top; i++) s.context.fillRect(x + 14 - i * 0.5, top + i, 2, 1);
    }

    // Window frames.
    for (let x = mullion >> 1; x < wallX; x += mullion) {
      s.rect(x - 1, top, 3, floorY - top, C.frame);
      s.rect(x - 1, top, 1, floorY - top, C.frameLight);
    }
    s.rect(0, transomY, wallX, 2, C.frame);
    s.rect(0, transomY, wallX, 1, C.frameLight);
    s.rect(0, top, W, 2, C.frame);
    s.rect(0, floorY - 2, W, 2, C.frame);

    // Floor with reflected window light.
    for (let y = floorY; y < H; y++) {
      const f = (y - floorY) / (H - floorY);
      for (let x = 0; x < W; x++) {
        let color = f < 0.5 ? (bayer(x, y) < f * 2 ? C.floorMid : C.floorTop) : bayer(x, y) < (f - 0.5) * 2 ? C.floorBottom : C.floorMid;
        if (y - floorY < 7 && (x - (mullion >> 1) + 1) % mullion < 3 && x < wallX && bayer(x, y) < 0.5) color = C.frame;
        s.px(x, y, color);
      }
    }
    for (let y = floorY + 3; y < H; y += 4 + Math.floor((y - floorY) / 6)) s.rect(0, y, W, 1, "rgba(0,0,0,0.12)");

    // Wall with the gate door.
    s.rect(wallX, 0, W - wallX, floorY, C.wall);
    s.rect(wallX, 0, 1, floorY, C.wallLight);
    for (let y = top + 6; y < floorY; y += 10) s.rect(wallX + 1, y, W - wallX, 1, "#160e30");
    const doorTop = laneY - 22;
    const doorW = Math.min(13, W - doorX - 2);
    s.rect(doorX - 1, doorTop - 1, doorW + 2, laneY - doorTop + 1, "#3a2d6b");
    for (let y = doorTop; y < laneY; y++) {
      const f = (y - doorTop) / (laneY - doorTop);
      s.rect(doorX, y, doorW, 1, hexMix(C.doorDark, "#2a1608", f * 0.8));
    }
    s.rect(doorX + 3, doorTop + 4, doorW - 6, laneY - doorTop - 6, "#3d220b");
    s.rect(doorX + 4, doorTop + 6, doorW - 8, laneY - doorTop - 9, hexMix(C.doorGlow, "#3d220b", 0.4));
    // Gate sign.
    s.rect(doorX - 3, doorTop - 15, 19, 13, "#0b0718");
    s.rect(doorX - 3, doorTop - 15, 19, 1, "#3a2d6b");
    s.text(doorX - 1, doorTop - 13, "BHEE", C.boardText);
    s.text(doorX + 1, doorTop - 7, "270", C.boardText);
    // Glider on the wall.
    const gx = wallX + Math.round((W - wallX) / 2) - 1;
    const gy = top + 8;
    s.rect(gx + 1, gy, 1, 2, C.glider);
    s.rect(gx + 2, gy + 1, 1, 2, C.glider);
    s.rect(gx, gy + 2, 1, 1, C.glider);

    // Wayfinding sign to the offices.
    const box = boardBox();
    const label = "← LAWFICE   LAMBFICE →";
    const signW = label.length * 4 + 3;
    const signX = box ? box.x - signW - 14 : -1;
    if (signX >= 6) {
      s.rect(signX + 6, top, 1, 6, "#3a3160");
      s.rect(signX + signW - 7, top, 1, 6, "#3a3160");
      s.rect(signX, top + 6, signW, 9, C.glider);
      s.rect(signX, top + 14, signW, 1, "#c9a400");
      s.text(signX + 2, top + 8, label, "#141020");
    }

    // Floor runner under the queue.
    s.rect(0, laneY - 2, deskX + 4, 3, "rgba(125,59,255,0.14)");
    return canvas;
  }

  function buildDesk() {
    const canvas = offscreen(24, 14);
    const s = surface(canvas.getContext("2d"));
    s.rect(0, 2, 22, 2, C.deskTop);
    s.rect(0, 2, 22, 1, C.deskEdge);
    s.rect(1, 4, 20, 10, C.desk);
    s.rect(1, 4, 20, 1, "#1d153d");
    s.rect(10, 7, 1, 2, C.glider);
    s.rect(11, 8, 1, 2, C.glider);
    s.rect(9, 9, 1, 1, C.glider);
    // Monitor seen from behind, with its glow on the officer's side.
    s.rect(15, -1 + 1, 5, 2, "#12102a");
    s.rect(15, 0, 1, 2, C.screen);
    s.rect(17, 1, 1, 2, "#12102a");
    // Lamp.
    s.rect(3, 0, 1, 2, "#3a3160");
    s.rect(2, 0, 3, 1, C.lamp);
    return canvas;
  }

  function buildSeats() {
    const { laneY } = L;
    const seatsRight = Math.min(Math.round(W * 0.42), L.deskSpot - 60);
    const canvas = offscreen(W, H);
    if (seatsRight < 30) return { canvas, seats: [] };
    const s = surface(canvas.getContext("2d"));
    const base = H - 2;
    const seats = [];
    s.rect(6, base - 1, seatsRight - 6, 1, C.seatDark);
    for (let x = 8; x + 8 < seatsRight; x += 9) {
      s.rect(x, base - 9, 8, 6, C.seat);
      s.rect(x, base - 9, 8, 1, C.seatLight);
      s.rect(x - 1, base - 4, 10, 2, C.seatLight);
      s.rect(x, base - 2, 1, 2, C.seatDark);
      s.rect(x + 7, base - 2, 1, 2, C.seatDark);
      seats.push(x);
    }
    // Plant.
    const px = seatsRight + 2;
    if (px + 8 < L.deskSpot - 40) {
      s.rect(px + 1, base - 5, 6, 5, C.pot);
      s.rect(px, base - 5, 8, 1, "#c0703f");
      const leaves = ["..g.g...", ".ggggg..", "gggGggg.", ".gGgGgg.", "ggggGgg.", ".gg.gg.."];
      s.sprite(px, base - 11, leaves, { g: C.plant, G: C.plantDark });
    }
    void laneY;
    return { canvas, seats };
  }

  // -------------------------------------------------------------------------
  // Characters

  function makeTraveler() {
    const r = random;
    const roll = r();
    if (roll < 0.06) return { kind: "duck", x: -12, back: 0, speed: 9 + r() * 3, state: "walk", phase: 0 };
    if (roll < 0.1) return { kind: "robot", x: -12, back: 0, speed: 11, state: "walk", phase: 0 };
    const bag = r();
    const acc = bag < 0.35 ? "suitcase" : bag < 0.6 ? "backpack" : null;
    return {
      kind: "person",
      head: pick(r, Object.keys(HEADS)),
      skin: pick(r, SKIN),
      hair: pick(r, HAIR),
      cap: pick(r, SHIRT),
      shirt: pick(r, SHIRT),
      pants: pick(r, PANTS),
      shoes: r() < 0.5 ? "#f4f0ff" : "#141020",
      bag: pick(r, BAGS),
      acc,
      x: acc === "suitcase" ? -18 : -12,
      back: acc === "suitcase" ? 7 : acc === "backpack" ? 1 : 0,
      speed: 12 + r() * 6,
      state: "walk",
      phase: r() * 2,
    };
  }

  function drawTraveler(t, feetY, s = g, dark = 0) {
    const walking = t.state === "walk" || t.state === "leave";
    const flip = t.dir === -1;
    const tint = (color) => (dark ? hexMix(color, "#0d0820", dark) : color);
    const shade = (color, amount) => tint(hexMix(color, "#000000", amount));
    // Local coordinates face right. `put` mirrors them when the traveler faces left.
    const put = (x, y, color) => s.px(t.x + (flip ? 6 - x : x), y, color);
    const stride = STRIDE[t.kind];
    const near = walking ? footAt(t.phase, stride) : { x: 0, lift: 0 };
    const far = walking ? footAt(t.phase + Math.PI, stride) : { x: 0, lift: 0 };
    const spread = walking && Math.abs(near.x) > stride * 0.6;

    if (t.kind === "duck") {
      const y = feetY - 9 - (walking && !spread ? 1 : 0);
      const orange = tint("#ff9300");
      put(3 + Math.round(far.x), feetY - 1 - Math.round(far.lift / 2), shade("#ff9300", 0.3));
      s.sprite(t.x, y, DUCK, { W: tint("#fbf7ec"), E: tint(C.eye), O: orange }, flip);
      put(3 + Math.round(near.x), feetY - 1 - Math.round(near.lift / 2), orange);
      put(4 + Math.round(near.x), feetY - 1 - Math.round(near.lift / 2), orange);
      if (t.state === "present") s.rect(flip ? t.x - 2 : t.x + 7, y + 2, 2, 2, C.passport);
      return;
    }

    if (t.kind === "robot") {
      const y = feetY - 14;
      const metal = tint("#a9a3c9");
      const stiff = { bend: 0, footWidth: 2 };
      drawLeg(put, 2, y + 9, { x: far.x, lift: far.lift * 0.6 }, feetY - 1, shade("#a9a3c9", 0.35), shade("#3a3355", 0.3), stiff);
      const blink = Math.floor(time * 3) % 2 ? "#ff3b3b" : "#5a1a1a";
      s.sprite(t.x, y, ROBOT, { L: blink, G: metal, V: tint("#01beb2"), M: tint("#7a739f"), Y: tint(C.glider) }, flip);
      drawLeg(put, 3, y + 9, { x: near.x, lift: near.lift * 0.6 }, feetY - 1, metal, tint("#3a3355"), stiff);
      if (t.state === "present") {
        put(7, y + 7, metal);
        put(8, y + 7, metal);
        for (let r = 6; r < 9; r++) for (let c = 9; c < 11; c++) put(c, y + r, C.passport);
      }
      return;
    }

    const y = feetY - 16 + (spread ? 1 : 0);
    const hipY = y + 10;
    const footY = feetY - 1;
    drawLeg(put, 2, hipY, far, footY, shade(t.pants, 0.35), shade(t.shoes, 0.4));

    let arm = walking ? Math.max(-2, Math.min(2, Math.round((-near.x / stride) * 1.6))) : 0;
    if (t.acc === "suitcase") {
      arm = -2;
      const top = feetY - 6;
      for (let r = 0; r < 5; r++) for (let c = -7; c < -2; c++) put(c, top + r, r === 0 ? tint(hexMix(t.bag, "#ffffff", 0.3)) : tint(t.bag));
      put(-6, feetY - 1, tint("#141020"));
      put(-4, feetY - 1, tint("#141020"));
      line((x, yy) => put(x, yy, tint("#2a2340")), 3 + arm, y + 9, -3, top - 1);
    }

    s.sprite(t.x, y, [...HEADS[t.head], ...TORSO], {
      H: tint(t.hair), S: tint(t.skin), E: tint(C.eye), T: tint(t.shirt), P: tint(t.pants), C: tint(t.cap),
    }, flip, 7);
    drawLeg(put, 3, hipY, near, footY, tint(t.pants), tint(t.shoes));
    if (t.acc === "backpack") for (let r = 6; r < 10; r++) put(0, y + r, tint(t.bag));

    if (t.state === "present") {
      put(6, y + 7, tint(t.skin));
      put(7, y + 7, tint(t.skin));
      for (let r = 5; r < 8; r++) for (let c = 8; c < 10; c++) put(c, y + r, r === 6 && c === 8 ? C.glider : C.passport);
    } else {
      const sleeve = shade(t.shirt, 0.2);
      put(3 + Math.round(arm * 0.3), y + 7, sleeve);
      put(3 + Math.round(arm * 0.65), y + 8, sleeve);
      put(3 + arm, y + 9, tint(t.skin));
    }
  }

  function drawOfficer() {
    const x = L.deskX + 13;
    const feet = L.laneY - 3;
    const y = feet - 18;
    const rows = [".CCCC..", "CCCCCC.", ".SSSS..", ".SESS..", "..SS...", ".UUUUU.", "YUUUUUY", ".UUUUU.", ".UUUUU."];
    g.sprite(x, y, rows, { C: C.cap, S: SKIN[(seed + 1) % SKIN.length], E: C.eye, U: C.uniform, Y: C.epaulette });
    g.px(x + 2, y, C.glider);
    const t = officer.stamp;
    if (t >= 0 && t < 0.2) {
      g.rect(x - 1, y + 2, 1, 4, C.uniform);
      g.rect(x - 2, y, 2, 2, "#6b3e1e");
    } else if (t >= 0.2 && t < 0.45) {
      g.rect(x - 2, y + 6, 2, 1, C.uniform);
      g.rect(x - 4, y + 7, 3, 2, "#6b3e1e");
    } else {
      g.rect(x - 1, y + 7, 2, 1, C.uniform);
    }
  }

  // -------------------------------------------------------------------------
  // Planes

  function spawnPlane() {
    const r = random;
    const kind = r() < 0.5 ? "takeoff" : "landing";
    if (kind === "takeoff") planes.push({ kind, x: -40, y: L.runwayY - 9, speed: 6, climb: 0 });
    else planes.push({ kind, x: W + L.pad * 2 + 10, y: L.top + 4 + r() * 10, speed: 30, climb: 0 });
  }

  function spawnTiny() {
    const r = random;
    const dir = r() < 0.5 ? 1 : -1;
    planes.push({ kind: "tiny", dir, x: dir > 0 ? -10 : W + L.pad * 2 + 10, y: L.top + 6 + r() * (L.glassH * 0.3), speed: 5 + r() * 4, trail: [] });
  }

  function updatePlanes(dt) {
    const runwayTop = L.runwayY - 9;
    for (const p of planes) {
      if (p.kind === "takeoff") {
        p.speed = Math.min(42, p.speed + dt * 9);
        p.x += p.speed * dt;
        if (p.x > (W + L.pad * 2) * 0.4) p.climb = Math.min(0.3, p.climb + dt * 0.12);
        p.y -= p.climb * p.speed * dt;
      } else if (p.kind === "landing") {
        p.x -= p.speed * dt;
        const remaining = Math.max(1, p.x - (W + L.pad * 2) * 0.3);
        if (p.y < runwayTop) p.y = Math.min(runwayTop, p.y + ((runwayTop - p.y) / remaining) * p.speed * dt * 1.2);
        else p.speed = Math.max(6, p.speed - dt * 8);
        p.climb = p.y < runwayTop - 1 ? -0.12 : 0;
      } else {
        p.x += p.dir * p.speed * dt;
        if (Math.random() < 0.6) p.trail.push({ x: p.x + (p.dir > 0 ? 0 : 7), y: p.y + 1, life: 1 });
        for (const dot of p.trail) dot.life -= dt * 0.25;
        p.trail = p.trail.filter((dot) => dot.life > 0);
      }
    }
    planes = planes.filter((p) => p.x > -60 && p.x < W + L.pad * 2 + 60 && p.y > -20);
  }

  function drawPlane(s, p, ox) {
    const x = Math.round(p.x) + ox;
    const y = Math.round(p.y);
    const blink = Math.floor(time * 2 + p.x * 0.01) % 2 === 0;
    if (p.kind === "tiny") {
      for (const dot of p.trail) if (bayer(dot.x | 0, dot.y | 0) < dot.life * 0.6) s.px(dot.x + ox, dot.y, "#8e7fc4");
      s.sprite(x, y, TINY_PLANE, { t: C.tail, c: C.fuselageShade, n: C.wing }, p.dir < 0);
      if (blink) s.px(x + 3, y, C.navRed);
      return;
    }
    const flip = p.kind === "landing";
    const slope = p.climb;
    const width = 30;
    for (let r = 0; r < PLANE.length; r++) {
      const row = PLANE[r];
      for (let c = 0; c < row.length; c++) {
        const color = PLANE_MAP[row[c]];
        if (!color) continue;
        const cx = flip ? width - 1 - c : c;
        const lift = Math.round((flip ? width - 1 - cx : cx) * slope);
        s.px(x + cx, y + r - lift, color);
      }
    }
    const noseX = flip ? x : x + width - 1;
    const noseLift = Math.round((width - 1) * slope);
    if (blink) s.px(x + 14, y + 2 - Math.round(14 * slope), C.navRed);
    if (Math.floor(time * 3) % 3 === 0) s.px(flip ? x + width - 1 : x, y + 1 - (flip ? 0 : 0), C.strobe);
    if (p.kind === "landing" || p.speed < 30) {
      const dir = flip ? -1 : 1;
      for (let i = 1; i < 10; i++) if (bayer(noseX + dir * i, y + 6) < 1 - i / 10) s.px(noseX + dir * i, y + 6 - noseLift + (flip ? 0 : 0), "#fff6d8");
    }
  }

  // -------------------------------------------------------------------------
  // Board

  function buildBoard() {
    board = [GATE_ROUTE, ...ROUTES.slice(0, 3)].map((route) => ({ route, flipUntil: 0 }));
    boardOffset = 0;
  }

  /** Width in characters, and position, of the departures board. Null when it does not fit. */
  function boardBox() {
    const full = BOARD_COLUMNS[0] + BOARD_COLUMNS[1] + BOARD_COLUMNS[2] + 2;
    const chars = Math.min(full, Math.floor((Math.min(W - L.mullion, full * 4 + 4) - 4) / 4));
    if (chars < BOARD_COLUMNS[0] + BOARD_COLUMNS[2] + 1 || W < (options.boardMinWidth ?? 0)) return null;
    const w = chars * 4 + 3;
    return { chars, w, x: Math.max(4, L.wallX - w - 8), y: L.top + 6 };
  }

  /** The characters of one board row, with the color of each. */
  function boardLine([flight, place, status], chars) {
    const [a, , c] = BOARD_COLUMNS;
    const placeW = chars - a - c - 2;
    const parts = [[flight.padEnd(a), C.boardText]];
    if (placeW >= 4) parts.push([" " + place.slice(0, placeW).padEnd(placeW), C.boardDest]);
    parts.push([" " + status.padEnd(c), STATUS_COLORS[status] ?? C.boardDest]);
    return parts.flatMap(([text, color]) => [...text].map((char) => [char, color])).slice(0, chars);
  }

  function drawBoard() {
    const box = boardBox();
    if (!box) return;
    const { chars, w, x, y } = box;
    const h = board.length * 7 + 3;
    g.rect(x + 8, L.top, 1, 6, "#3a3160");
    g.rect(x + w - 9, L.top, 1, 6, "#3a3160");
    g.rect(x - 1, y - 1, w + 2, h + 2, C.boardFrame);
    g.rect(x, y, w, h, C.boardBg);
    board.forEach((row, i) => {
      const flipping = time < row.flipUntil;
      const ry = y + 2 + i * 7;
      const blink = row.route[2] === "BOARDING" && Math.floor(time * 2) % 2;
      boardLine(row.route, chars).forEach(([char, color], c) => {
        if (flipping && char !== " " && Math.random() < 0.7) char = FLAP[Math.floor(Math.random() * FLAP.length)];
        const dim = blink && c >= chars - BOARD_COLUMNS[2];
        g.text(x + 2 + c * 4, ry, char, dim ? hexMix(color, C.boardBg, 0.6) : color);
      });
      g.rect(x, ry + 5, w, 1, "#120c22");
    });
  }

  /** Scrolls the history rows up by one. The gate row stays. */
  function scrollBoard() {
    boardOffset = (boardOffset + 1) % ROUTES.length;
    for (let i = 1; i < board.length; i++) {
      board[i].route = ROUTES[(boardOffset + i - 1) % ROUTES.length];
      board[i].flipUntil = time + 0.5 + i * 0.12;
    }
  }

  // -------------------------------------------------------------------------
  // Update

  function line() {
    return travelers.filter((t) => t.state === "walk" || t.state === "wait" || t.state === "present");
  }

  function updateTravelers(dt) {
    timers.traveler -= dt;
    const queue = line();
    if (timers.traveler <= 0 && queue.length < Math.max(3, Math.floor((L.deskSpot - 20) / 13))) {
      const last = queue[queue.length - 1];
      if (!last || last.x > 6) {
        travelers.push(makeTraveler());
        timers.traveler = 1.6 + random() * 3.4;
      }
    }

    queue.forEach((t, i) => {
      const prev = queue[i - 1];
      const target = i === 0 ? L.deskSpot : prev.x - prev.back - 9;
      if (t.state === "present") return;
      // A waiting traveler starts again only when the gap is clear, so the legs do not flicker.
      const gap = target - t.x;
      if (t.state === "walk" ? gap > 0.01 : gap > 4) {
        t.state = "walk";
        const before = t.x;
        t.x = Math.min(target, t.x + t.speed * dt);
        t.phase += (t.x - before) * stepOf(t.kind);
      } else {
        t.state = "wait";
        if (i === 0) {
          t.state = "present";
          t.timer = 0;
        }
      }
    });

    for (const t of travelers) {
      if (t.state === "present") {
        t.timer += dt;
        if (t.timer > 0.6 && officer.stamp < 0) officer.stamp = 0;
        if (t.timer > 1.5) {
          t.state = "leave";
          bubble = { text: pick(random, GREETINGS), until: time + 1.1 };
        }
      } else if (t.state === "leave") {
        t.x += t.speed * dt;
        t.phase += t.speed * dt * stepOf(t.kind);
        if (t.x > L.doorX + 2) {
          t.state = "gone";
          boarders.push({ x: L.wallX + L.pad - 2, speed: 8 + random() * 3, hair: t.kind === "person" ? t.hair : "#fbf7ec" });
        }
      }
    }
    travelers = travelers.filter((t) => t.state !== "gone");

    if (officer.stamp >= 0) {
      const before = officer.stamp;
      officer.stamp += dt;
      if (before < 0.2 && officer.stamp >= 0.2) {
        for (let i = 0; i < 6; i++)
          sparks.push({ x: L.deskX + 10, y: L.laneY - 13, vx: (random() - 0.5) * 30, vy: -10 - random() * 20, life: 0.5 });
      }
      if (officer.stamp > 0.7) officer.stamp = -1;
    }
    for (const sp of sparks) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 60 * dt;
      sp.life -= dt;
    }
    sparks = sparks.filter((sp) => sp.life > 0);

    for (const b of boarders) b.x -= b.speed * dt;
    boarders = boarders.filter((b) => b.x > L.bridgeLeft + L.pad + 2);

    timers.stroller -= dt;
    if (timers.stroller <= 0) {
      const t = makeTraveler();
      t.dir = random() < 0.5 ? 1 : -1;
      t.x = t.dir > 0 ? -12 : L.wallX - 2;
      t.state = "walk";
      strollers.push(t);
      timers.stroller = 5 + random() * 8;
    }
    for (const t of strollers) {
      const distance = t.speed * 0.8 * dt;
      t.x += t.dir * distance;
      t.phase += distance * stepOf(t.kind);
    }
    strollers = strollers.filter((t) => t.x > -24 && t.x < L.wallX - 1);
  }

  function update(dt) {
    time += dt;
    pointer.x += (pointer.target - pointer.x) * Math.min(1, dt * 4);

    timers.plane -= dt;
    if (timers.plane <= 0) {
      spawnPlane();
      timers.plane = 7 + random() * 7;
    }
    timers.tiny -= dt;
    if (timers.tiny <= 0) {
      spawnTiny();
      timers.tiny = 9 + random() * 10;
    }
    timers.board -= dt;
    if (timers.board <= 0) {
      scrollBoard();
      timers.board = 3.5;
    }
    updatePlanes(dt);
    updateTravelers(dt);
    if (tug.wait > 0) tug.wait -= dt;
    else {
      tug.x += tug.dir * 11 * dt;
      if (tug.x > L.wallX + L.pad + 30 || tug.x < -40) {
        tug.dir *= -1;
        tug.wait = 3 + random() * 6;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Draw

  function draw() {
    const { pad, floorY, top } = L;
    const skyShift = Math.round(-pad + pointer.x * 5);
    const nearShift = Math.round(-pad + pointer.x * 2.5);

    context.clearRect(0, 0, W, H);
    context.save();
    context.beginPath();
    context.rect(0, top, L.wallX, floorY - top);
    context.clip();
    context.drawImage(layers.sky, skyShift, 0);

    for (const star of stars) {
      const v = Math.sin(time * star.speed + star.phase);
      if (v > -0.3) g.px(star.x + skyShift, star.y, v > 0.6 ? C.star : C.starDim);
      if (v > 0.92) {
        g.px(star.x + skyShift - 1, star.y, C.starDim);
        g.px(star.x + skyShift + 1, star.y, C.starDim);
      }
    }
    for (const tw of twinkles) {
      const on = tw.beacon ? Math.floor(time * tw.speed + tw.phase) % 2 === 0 : Math.sin(time * tw.speed + tw.phase) > 0.3;
      if (on) g.rect(tw.x + skyShift, tw.y, tw.w ?? 1, 1, tw.color ?? (tw.beacon ? C.navRed : C.windowLit));
    }
    // Runway lights.
    const rw = W + pad * 2;
    for (let x = 0; x < rw; x += 6) {
      g.px(x + skyShift, L.runwayY - 1, (Math.floor(time * 12) - x / 6) % 18 === 0 ? "#ffffff" : C.edgeLight);
      g.px(x + skyShift, L.runwayY + 3, C.edgeLight);
    }
    for (let x = 3; x < rw; x += 9) if (Math.sin(time * 1.5 + x) > -0.6) g.px(x + skyShift, L.runwayY + 7, C.taxiLight);

    for (const p of planes) drawPlane(g, p, skyShift);
    context.drawImage(layers.outside, nearShift, 0);
    drawTug(nearShift);
    // Boarders in the jet bridge windows.
    for (const b of boarders) {
      const bx = Math.round(b.x) + nearShift;
      const by = L.bridgeY + 3;
      if (Math.floor(b.x) % 5 === 0) continue;
      g.rect(bx, by + 1, 2, 3, "#140a1e");
      g.px(bx, by, "#140a1e");
    }
    context.restore();

    context.drawImage(layers.interior, 0, 0);
    drawBoard();

    for (const t of strollers) drawTraveler(t, L.laneY - 6, g, 0.45);

    drawOfficer();
    context.drawImage(layers.desk, L.deskX, L.laneY - 14);
    if (officer.stamp >= 0.2 && officer.stamp < 0.32) g.rect(L.deskX + 8, L.laneY - 13, 3, 1, C.stampInk);

    // Reflections, then travelers.
    context.save();
    context.globalAlpha = 0.16;
    context.translate(0, L.laneY * 2 + 1);
    context.scale(1, -1);
    for (const t of travelers) drawTraveler(t, L.laneY);
    context.restore();
    for (const t of travelers) drawTraveler(t, L.laneY);

    // Stanchions along the queue.
    const ropeY = L.laneY - 7;
    let prevPost = null;
    for (let x = L.deskSpot - 2; x > 10; x -= 15) {
      g.rect(x, ropeY, 1, 7, C.post);
      g.px(x, ropeY - 1, C.postTop);
      g.rect(x - 1, L.laneY, 3, 1, C.post);
      if (prevPost !== null)
        for (let rx = x + 1; rx < prevPost; rx++) {
          const sag = Math.round(Math.sin(((rx - x) / (prevPost - x)) * Math.PI) * 2);
          g.px(rx, ropeY + sag, C.rope);
        }
      prevPost = x;
    }

    // Foreground seats and the people on them.
    context.drawImage(layers.seats.canvas, 0, 0);
    drawSitters();

    for (const sp of sparks) g.px(sp.x, sp.y, Math.random() < 0.5 ? C.glider : C.stampInk);
    if (bubble && time < bubble.until) {
      const w = bubble.text.length * 4 + 3;
      const bx = Math.min(W - w - 2, L.deskX + 10 - (w >> 1));
      const by = L.laneY - 31;
      g.rect(bx, by, w, 8, C.bubble);
      g.rect(bx + (w >> 1), by + 8, 2, 1, C.bubble);
      g.px(bx + (w >> 1), by + 9, C.bubble);
      g.text(bx + 2, by + 2, bubble.text, C.bubbleText);
    }
  }

  function drawTug(shift) {
    const tx = Math.round(tug.x) + shift;
    const by = L.floorY - 3;
    const front = tug.dir > 0;
    g.rect(tx, by - 4, 8, 4, "#fcd202");
    g.rect(tx, by - 4, 8, 1, "#ffe86b");
    g.rect(tx + (front ? 4 : 1), by - 7, 3, 3, "#2a2340");
    g.rect(tx + (front ? 5 : 2), by - 6, 1, 1, "#7fe3ff");
    if (Math.floor(time * 4) % 2) g.px(tx + (front ? 5 : 2), by - 8, "#ff9300");
    g.rect(tx + 1, by, 2, 1, "#120b25");
    g.rect(tx + 5, by, 2, 1, "#120b25");
    for (let i = 0; i < 2; i++) {
      const cx = front ? tx - 9 - i * 9 : tx + 10 + i * 9;
      g.rect(cx, by - 2, 8, 2, "#5a5480");
      g.rect(cx + 1, by - 6, 3, 4, BAGS[(i * 2) % BAGS.length]);
      g.rect(cx + 4, by - 5, 3, 3, BAGS[(i * 2 + 3) % BAGS.length]);
      g.rect(cx + 1, by, 1, 1, "#120b25");
      g.rect(cx + 6, by, 1, 1, "#120b25");
      g.rect(front ? cx + 8 : cx - 1, by - 1, 1, 1, "#3a3160");
    }
  }

  function drawSitters() {
    const seats = layers.seats.seats;
    const base = H - 2;
    const sitters = [
      { seat: 0, hair: HAIR[1], skin: SKIN[2], shirt: SHIRT[2], prop: "laptop" },
      { seat: 2, hair: HAIR[3], skin: SKIN[0], shirt: SHIRT[1], prop: "book" },
      { seat: 4, hair: HAIR[0], skin: SKIN[4], shirt: SHIRT[4], prop: "sleep" },
      { seat: 6, hair: HAIR[6], skin: SKIN[1], shirt: SHIRT[0], prop: null },
    ];
    for (const s of sitters) {
      const x = seats[s.seat];
      if (x === undefined) continue;
      const y = base - 16;
      const nod = s.prop === "sleep" ? 1 : 0;
      g.sprite(x + 1, y + nod, ["..HHH.", ".HHHHH", ".HSSSS", ".HSSES", "..SSS."], { H: s.hair, S: s.skin, E: C.eye });
      g.rect(x + 1, y + 5, 5, 5, s.shirt);
      g.rect(x + 4, y + 9, 5, 2, "#24305e");
      g.rect(x + 8, y + 9, 1, 5, "#24305e");
      if (s.prop === "laptop") {
        const glow = Math.sin(time * 7) > -0.8 ? C.laptop : "#5fb8d0";
        g.rect(x + 6, y + 5, 1, 4, "#2a2340");
        g.rect(x + 5, y + 8, 4, 1, "#3a3355");
        g.px(x + 5, y + 6, glow);
        g.px(x + 5, y + 7, glow);
      } else if (s.prop === "book") {
        g.rect(x + 5, y + 6, 3, 3, C.book);
        g.px(x + 6, y + 6, "#fbf7ec");
      } else if (s.prop === "sleep") {
        const k = (time * 0.6) % 1;
        g.text(x + 6, Math.round(y - 4 - k * 8), "Z", hexMix("#fbf7ec", "#0d0820", k));
      }
    }
  }

  // -------------------------------------------------------------------------
  // Lifecycle

  function resize() {
    const box = canvas.getBoundingClientRect();
    const cell = options.cell ?? Math.max(3, Math.round(Math.min(box.width / 320, box.height / 215)));
    const nextW = Math.max(64, Math.ceil(box.width / cell));
    const nextH = Math.max(64, Math.ceil(box.height / cell));
    if (nextW === W && nextH === H) return;
    // When only the height changes (a phone toolbar, for example), the people and planes stay.
    const keep = nextW === W && L !== null;
    W = nextW;
    H = nextH;
    canvas.width = W;
    canvas.height = H;
    context.imageSmoothingEnabled = false;
    L = layout();
    twinkles = [];
    layers = { sky: buildSky(), outside: buildOutside(), interior: buildInterior(), desk: buildDesk(), seats: buildSeats() };
    if (keep) {
      draw();
      return;
    }
    random = rng(seed);
    buildBoard();
    travelers = [];
    strollers = [];
    boarders = [];
    planes = [];
    sparks = [];
    if (still) {
      for (let i = 0; i < 4; i++) {
        const t = makeTraveler();
        t.x = L.deskSpot - i * 16;
        t.state = i === 0 ? "present" : "wait";
        t.timer = 0;
        travelers.push(t);
      }
      planes.push({ kind: "takeoff", x: (W + L.pad * 2) * 0.55, y: L.runwayY - 22, speed: 40, climb: 0.25 });
      draw();
    } else {
      // Warm up so the scene starts busy.
      for (let i = 0; i < 400; i++) update(0.05);
      draw();
    }
  }

  const loop = (now) => {
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    update(dt);
    draw();
    frame = requestAnimationFrame(loop);
  };
  const toggle = () => {
    cancelAnimationFrame(frame);
    last = 0;
    if (!document.hidden && !still) frame = requestAnimationFrame(loop);
  };
  const move = (event) => (pointer.target = (event.clientX / innerWidth) * 2 - 1);
  const leave = () => (pointer.target = 0);

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  document.addEventListener("visibilitychange", toggle);
  // Touch scrolling also sends pointer events, so only a real mouse moves the view.
  if (interactive && !still && matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
  }
  toggle();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", toggle);
    removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
  };
}
