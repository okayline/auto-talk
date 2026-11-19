import assert from 'node:assert/strict';
import { PLANETS, points, isAsleep, whereIs, streetHour } from './public/sim.js';

const types = Object.values(PLANETS).map((p) => p.type);
for (const a of types) for (const b of types) assert.equal(points(a, b), points(b, a), `${a}/${b} symmetric`);
assert.equal(points('GRUFF', 'PEPPY'), 1);
assert.equal(points('PRIM', 'DREAMY'), 1);
assert.equal(points('PEPPY', 'JOCK'), 5);

// Sleep hours, including DREAMY's that cross midnight (11 PM to 9 AM).
assert.ok(isAsleep('DREAMY', 23.5) && isAsleep('DREAMY', 3) && !isAsleep('DREAMY', 9));
assert.ok(isAsleep('GRUFF', 5) && !isAsleep('GRUFF', 3.9) && !isAsleep('GRUFF', 10));
assert.equal(whereIs('neptune', '2026-11-19', 3, 0), 'asleep');

const ids = Object.keys(PLANETS);
const day = '2026-11-19';
assert.deepEqual(streetHour(ids, day, 14, 59), streetHour(ids, day, 14, 59), 'same time, same street');

assert.ok(!isAsleep('SLY', 4) && !isAsleep('TSUNDERE', 4), 'no sleep hours found for these yet');

let meetings = 0, angry = 0;
for (let h = 0; h < 24; h++) {
  const s = streetHour(ids, day, h, 59);
  meetings += s.meetings.length;
  for (const m of s.meetings) {
    assert.notEqual(m.a, m.b);
    for (const id of [m.a, m.b]) assert.equal(whereIs(id, day, h, m.minute), 'out', 'only neighbours who are out meet');
    if (m.ends === 'angry') angry++;
  }
}
assert.ok(meetings > 100, `a lively day (${meetings} meetings)`);
console.log(`ok (${meetings} meetings, ${angry} angry on ${day})`);
