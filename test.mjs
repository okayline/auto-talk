import assert from 'node:assert/strict';
import { PLANETS, points, playDay, MEETINGS_A_DAY } from './sim.js';

const types = Object.values(PLANETS).map((p) => p.type);
for (const a of types) for (const b of types) assert.equal(points(a, b), points(b, a), `${a}/${b} symmetric`);
assert.equal(points('GRUFF', 'PEPPY'), 1);
assert.equal(points('PRIM', 'DREAMY'), 1);
assert.equal(points('PEPPY', 'JOCK'), 5);

const street = ['saturn', 'uranus', 'earth', 'neptune', 'jupiter'];
const day = playDay('2026-11-19', street);
assert.deepEqual(playDay('2026-11-19', street), day, 'same seed, same day');
assert.equal(day.meetings.length, MEETINGS_A_DAY);
for (const m of day.meetings) assert.notEqual(m.a, m.b);

const inside = ['saturn', 'uranus'];
const next = playDay('2026-11-20', street, inside);
for (const m of next.meetings) assert.ok(!inside.includes(m.a) && !inside.includes(m.b), 'thinking neighbours stay in');
for (const id of day.thinking) assert.ok(day.meetings.some((m) => m.sulks === id), 'only clashers sulk');

console.log('ok');
