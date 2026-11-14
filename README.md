# Crib Log

Cribbage match tracker PWA (vanilla HTML/CSS/JS, localStorage `crib.v1`, offline service worker).

Live: https://mikeradical72.github.io/cribbage-tracker/

Stage 1: dashboard (win rate, streak, record, avg win/loss margin, skunks), log a match (final totals only, 121 validation, auto margin, skunk flags, win/loss animations), history with filters (All/Wins/Losses/Close<=10/Blowouts>=30, by opponent, delete), per-opponent records, JSON export/import.

Data model already has `status: pending|final`, `scheduled {date,time,location}` and `invite` fields for stage 3 calendar invites.

Stage 2 (study guide, **Guide** tab; Setup moved to the gear on the Board header):
- Rules: dealer vs pone discard principles, hand-vs-crib tradeoffs, cheat sheet of average crib values.
- Counting: show scoring table (15s, pairs, runs, double/triple runs, hand vs crib flush, nobs, his heels), famous hands, pegging refresher.
- Examples: 14 worked 6-card hands (dealer/pone) with tap-to-reveal answers.
- Trainer: random 6-card deal, pick 2 to throw, scored by brute force — exact average hand over all 46 cuts ± average crib value of the throw.
- `engine.js` = scorer + discard analyzer; `crib-table.js` = exact average crib value for every 2-card throw (other 2 crib cards + cut random over the remaining 50 cards), built by `node build-crib-table.js`.
- `node test-engine.js` verifies the scorer (known hands + full 12,994,800-hand distribution) and re-derives every number shown in the guide.
