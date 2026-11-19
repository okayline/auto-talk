# auto-talk

A street of 10 planet neighbours, 5 facing 5. Press New game to pick who lives on your side. The street runs on your real clock: each neighbour sleeps at their personality's hours, and when awake is home or out on the road. Neighbours who are out meet; Animal Crossing: New Leaf's personality table decides whether the talk ends happy, sad or angry.

Plain HTML and JavaScript, no dependencies. The page is `public/` (`index.html` loads `sim.js` as a module), served by the Worker in `wrangler.jsonc` at talk.88x31.app; locally, open it through any web server. Tests: `npm test`.
