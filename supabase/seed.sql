-- Seeds ~10 sample movies for local development and demos.
-- Run after schema.sql. Safe to re-run (upserts on title).

insert into public.movies (title, year, genres, poster_url, backdrop_url, synopsis, rating)
values
  ('Interstellar', 2014, array['Sci-Fi','Adventure'],
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    'A journey beyond time and space.', 8.6),
  ('The Dark Knight', 2008, array['Action','Drama'],
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', null,
    'Gotham''s hero faces its darkest test.', 9.0),
  ('Spirited Away', 2001, array['Animation','Fantasy'],
    'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', null,
    'A girl lost in a world of spirits.', 8.6),
  ('Inception', 2010, array['Sci-Fi','Thriller'],
    'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', null,
    'A thief who steals corporate secrets through dreams.', 8.8),
  ('The Martian', 2015, array['Sci-Fi','Drama'],
    'https://image.tmdb.org/t/p/w500/5aGhaIHIcAKr0kAgt6RXCFbjW1G.jpg', null,
    'Stranded on Mars, an astronaut must survive.', 8.0),
  ('Dune', 2021, array['Sci-Fi'],
    'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', null,
    'A hero''s journey on the desert planet Arrakis.', 8.0),
  ('The Matrix', 1999, array['Sci-Fi'],
    'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', null,
    'A hacker discovers the truth of his reality.', 8.7),
  ('Your Name.', 2016, array['Romance','Animation'],
    'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg', null,
    'Two strangers swap bodies across time.', 8.4),
  ('The Prestige', 2006, array['Drama','Mystery'],
    'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8TNEHPo.jpg', null,
    'Two rival magicians, one deadly obsession.', 8.5),
  ('Whiplash', 2014, array['Drama','Music'],
    'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', null,
    'A drummer pushed to his limits by a ruthless instructor.', 8.5),
  ('Parasite', 2019, array['Thriller','Drama'],
    'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', null,
    'Two families, one house, a class divide.', 8.5),
  ('The Grand Budapest Hotel', 2014, array['Comedy','Drama'],
    'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', null,
    'A concierge and his protege navigate a hotel''s mysteries.', 8.1),
  ('The Shawshank Redemption', 1994, array['Drama'],
    'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', null,
    'Hope is a dangerous, necessary thing.', 9.3)
on conflict do nothing;

-- NOTE: sample *users* are intentionally not seeded here because they must
-- exist in auth.users first (Supabase Auth owns that table). To create test
-- users + posts:
--   1. Sign up 2-3 test accounts through the app's Google login (or
--      Authentication > Add user in the Supabase dashboard).
--   2. A public.users row is created automatically via the
--      handle_new_user() trigger in schema.sql.
--   3. Then insert rows into public.posts referencing those real user ids,
--      e.g.:
--        insert into public.posts (user_id, image_urls)
--        values ('<uuid-from-public.users>', array['https://images.unsplash.com/photo-...']);
