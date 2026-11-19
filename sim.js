// auto-talk: the street's day, worked out from a seed. No page code here, so it can be tested in node.

// The 8 neighbours: a planet, its personality type, and a placeholder look (head colour).
export const PLANETS = {
  mercury: { name: 'Mercury', type: 'SLY',      color: '#9a948c' },
  venus:   { name: 'Venus',   type: 'HAUGHTY',  color: '#e3c27a' },
  earth:   { name: 'Earth',   type: 'PRIM',     color: '#3f8fd0' },
  mars:    { name: 'Mars',    type: 'TSUNDERE', color: '#d0603c' },
  jupiter: { name: 'Jupiter', type: 'JOCK',     color: '#c99a6b' },
  saturn:  { name: 'Saturn',  type: 'GRUFF',    color: '#e6d39a' },
  uranus:  { name: 'Uranus',  type: 'PEPPY',    color: '#7fd6e0' },
  neptune: { name: 'Neptune', type: 'DREAMY',   color: '#3450c8' },
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

// What a meeting looks like for each score: the bubble over each neighbour and the reason shown.
export const OUTCOME = {
  5: { emote: '♥', reason: 'hit it off' },
  3: { emote: '♪', reason: 'had a nice chat' },
  2: { emote: '…', reason: 'had an awkward chat' },
  1: { emote: '💢', reason: 'clashed' },
};

export const MEETINGS_A_DAY = 10;

// Small seeded random (mulberry32) from a string such as "2026-11-19".
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

// One day on the street.
// residents: 5 planet ids. thinking: ids who stay in today (they clashed yesterday).
// Returns the meetings in order and who stays in tomorrow.
export function playDay(seedText, residents, thinking = []) {
  const rand = rng(seedText + '|' + residents.join(','));
  const out = residents.filter((id) => !thinking.includes(id));
  const meetings = [];
  const tomorrow = new Set();
  if (out.length < 2) return { meetings, thinking: [] };
  for (let i = 0; i < MEETINGS_A_DAY; i++) {
    const a = out[Math.floor(rand() * out.length)];
    let b = a;
    while (b === a) b = out[Math.floor(rand() * out.length)];
    const score = points(PLANETS[a].type, PLANETS[b].type);
    const meeting = { a, b, score, ...OUTCOME[score] };
    if (score === 1) {
      // After a clash one of the two sulks and stays in tomorrow ("thinking", like New Leaf).
      meeting.sulks = rand() < 0.5 ? a : b;
      tomorrow.add(meeting.sulks);
    }
    meetings.push(meeting);
  }
  return { meetings, thinking: [...tomorrow] };
}
