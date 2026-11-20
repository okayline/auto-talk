// auto-talk: the street's day, worked out from a seed. No page code here, so it can be tested in node.

// The 10 neighbours (8 types; Pluto and the Moon share GRUFF and DREAMY): a planet, its personality type, and a look (head colour).
export const PLANETS = {
  mercury: { name: 'Mercury', type: 'SLY',      color: '#9a948c' },
  venus:   { name: 'Venus',   type: 'HAUGHTY',  color: '#e3c27a' },
  earth:   { name: 'Earth',   type: 'PRIM',     color: '#3f8fd0' },
  mars:    { name: 'Mars',    type: 'TSUNDERE', color: '#d0603c' },
  jupiter: { name: 'Jupiter', type: 'JOCK',     color: '#c99a6b' },
  saturn:  { name: 'Saturn',  type: 'GRUFF',    color: '#e6d39a' },
  uranus:  { name: 'Uranus',  type: 'PEPPY',    color: '#7fd6e0' },
  neptune: { name: 'Neptune', type: 'DREAMY',   color: '#3450c8' },
  pluto:   { name: 'Pluto',   type: 'GRUFF',    color: '#c9a98a' },
  moon:    { name: 'Moon',    type: 'DREAMY',   color: '#d8d8d0' },
};

// Animal Crossing: New Leaf's personality compatibility points (Nookipedia, "Compatibility"),
// with Normal=PRIM, Lazy=DREAMY, Snooty=HAUGHTY, Cranky=GRUFF, Smug=SLY, Big sister=TSUNDERE.
const ORDER = ['PRIM', 'DREAMY', 'PEPPY', 'JOCK', 'HAUGHTY', 'GRUFF', 'SLY', 'TSUNDERE'];
const POINTS = [
  [3, 1, 1, 2, 5, 3, 5, 2],
  [1, 5, 2, 1, 3, 2, 3, 5],
  [1, 2, 5, 5, 2, 1, 3, 3],
  [2, 1, 5, 5, 1, 3, 2, 3],
  [5, 3, 2, 1, 3, 5, 2, 1],
  [3, 2, 1, 3, 5, 5, 1, 2],
  [5, 3, 3, 2, 2, 1, 5, 1],
  [2, 5, 3, 3, 1, 2, 1, 5],
];
export function points(typeA, typeB) {
  return POINTS[ORDER.indexOf(typeA)][ORDER.indexOf(typeB)];
}

// Equal-warmth shared moments: 5 = extroverted joy, 1 = calm emotional connection.
export const OUTCOME = {
  5: { kind: 'sparkle', emote: '✨', label: 'shared a big laugh',     meter: 'liveliness', gain: 18 },
  3: { kind: 'music',   emote: '🎵', label: 'hummed a tune together', meter: 'liveliness', gain: 12 },
  2: { kind: 'warm',    emote: '☀️', label: 'had a sweet catch-up',   meter: 'tenderness', gain: 12 },
  1: { kind: 'hug',     emote: '💗', label: 'shared a calm hug',      meter: 'tenderness', gain: 18 },
};

// Hours asleep, local time [fall asleep, wake up]. New Leaf's hours (Nookipedia, personality pages).
export const SLEEP = {
  PRIM:     [0, 6],
  JOCK:     [0, 7],
  DREAMY:   [23, 9],
  PEPPY:    [1, 9],
  HAUGHTY:  [2, 9.5],
  GRUFF:    [4, 10],
  SLY:      [2, 8.5],
  TSUNDERE: [3, 11],
};
export function isAsleep(type, hour) {
  if (!SLEEP[type]) return false;
  const [a, b] = SLEEP[type];
  return a < b ? hour >= a && hour < b : hour >= a || hour < b;
}

export const OUT_CHANCE = 0.6;     // awake neighbours outside for an hour
export const MEET_CHANCE = 0.5;    // a meeting in a given minute, when 2 or more are out

// Small seeded random (mulberry32) from a string.
export function seeded(seedText) { return rng(seedText); }
function rng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Where a neighbour is at a given time: asleep, in (awake at home) or out (wandering the solar system).
export function whereIs(id, date, hour, minute) {
  if (isAsleep(PLANETS[id].type, hour + minute / 60)) return 'asleep';
  return rng(`${date}|${hour}|${id}`)() < OUT_CHANCE ? 'out' : 'in';
}

// The street's hour so far: minute by minute, two neighbours who are out may meet.
export function streetHour(ids, date, hour, nowMinute) {
  const meetings = [];
  let liveliness = 0;
  let tenderness = 0;
  for (let m = 0; m <= nowMinute; m++) {
    const out = ids.filter((id) => whereIs(id, date, hour, m) === 'out');
    const rand = rng(`${date}|${hour}|${m}|meet`);
    if (out.length < 2 || rand() >= MEET_CHANCE) continue;
    const a = out[Math.floor(rand() * out.length)];
    let b = a;
    while (b === a) b = out[Math.floor(rand() * out.length)];
    const score = points(PLANETS[a].type, PLANETS[b].type);
    const outcome = OUTCOME[score];
    if (outcome.meter === 'liveliness') liveliness = Math.min(100, liveliness + outcome.gain);
    else tenderness = Math.min(100, tenderness + outcome.gain);
    meetings.push({ minute: m, a, b, score, ...outcome });
  }
  const where = {};
  for (const id of ids) where[id] = whereIs(id, date, hour, nowMinute);
  return { meetings, where, liveliness, tenderness };
}
