# Crib Log

Cribbage match tracker PWA (vanilla HTML/CSS/JS, localStorage `crib.v1`, offline service worker).

Live: https://mikeradical72.github.io/cribbage-tracker/

Stage 1: dashboard (win rate, streak, record, avg win/loss margin, skunks), log a match (final totals only, 121 validation, auto margin, skunk flags, win/loss animations), history with filters (All/Wins/Losses/Close<=10/Blowouts>=30, by opponent, delete), per-opponent records, JSON export/import.

Data model already has `status: pending|final`, `scheduled {date,time,location}` and `invite` fields for stage 3 calendar invites.
