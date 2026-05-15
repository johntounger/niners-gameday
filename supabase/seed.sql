-- Niners Gameday — Seed data
-- Run AFTER schema.sql.
-- Inserts the 8 home games for the 2026 49ers season and the host roster
-- (John, Marilyn for the Tounger crew; Justin for the Mendi crew) for each game.

-- ---------- GAMES ----------
-- Kickoff times converted to UTC.
-- Sep + Oct = Pacific Daylight Time (UTC-7).  Nov + Dec + Jan = Pacific Standard Time (UTC-8).
-- DST 2026: starts Mar 8, ends Nov 1.

with new_games as (
  insert into games (week, opponent, opponent_abbr, kickoff_at, tv_network, label)
  values
    (2,  'Dolphins',   'mia', timestamptz '2026-09-20 20:25:00+00', 'FOX', 'Home Opener'),
    (3,  'Cardinals',  'ari', timestamptz '2026-09-27 20:05:00+00', 'FOX', 'NFC West'),
    (4,  'Broncos',    'den', timestamptz '2026-10-04 20:25:00+00', 'CBS', null),
    (6,  'Commanders', 'wsh', timestamptz '2026-10-20 00:15:00+00', 'ABC', 'Monday Night'),
    (9,  'Raiders',    'lv',  timestamptz '2026-11-08 21:05:00+00', 'CBS', null),
    (12, 'Seahawks',   'sea', timestamptz '2026-11-29 21:25:00+00', 'FOX', 'NFC West'),
    (14, 'Rams',       'lar', timestamptz '2026-12-13 21:25:00+00', 'FOX', 'NFC West Rivalry'),
    (17, 'Eagles',     'phi', timestamptz '2027-01-04 01:20:00+00', 'NBC', 'Sunday Night')
  returning id, opponent_abbr
)
-- ---------- HOSTS ----------
-- Insert host rows for every newly inserted game.
insert into guests (game_id, crew, name, is_host, display_order)
select id, 'tounger', 'John Tounger',     true, 0 from new_games
union all
select id, 'tounger', 'Marilyn Tounger',  true, 1 from new_games
union all
select id, 'mendi',   'Justin Mendiola',  true, 0 from new_games;
