-- =====================================================================
-- PSK Admin Platform — seed staff profiles
--
-- RUN THIS SECOND, and only AFTER creating the six users in the
-- Supabase dashboard under Authentication -> Users -> Add user.
--
-- When you create each user, tick "Auto Confirm User" and give each a
-- TEMPORARY password. Do not reuse the old PSKOwner2026! style passwords
-- anywhere — they have been published in the browser bundle since launch
-- and must be considered public. Generate fresh ones and hand them to
-- each person directly.
--
-- This script reads the users you created and attaches role + branch.
-- It matches on email, so the emails must be exactly as below.
-- =====================================================================

insert into public.profiles (id, email, name, title, role, branch, must_change_pw)
select u.id, u.email, v.name, v.title, v.role, v.branch, true
from auth.users u
join (values
  ('ken@psksafaris.com',    'Ken Mulanya',    'Owner',                 'owner',   'eldoret'),
  ('miriam@psksafaris.com', 'Miriam Wanjiku', 'Finance Manager',       'finance', 'eldoret'),
  ('faith@psksafaris.com',  'Faith',          'Kisumu Branch Manager', 'manager', 'kisumu'),
  ('evans@psksafaris.com',  'Evans',          'Operations',            'ops',     'eldoret'),
  ('brenda@psksafaris.com', 'Brenda',         'Operations Assistant',  'ops',     'eldoret'),
  ('intern@psksafaris.com', 'Intern',         'Intern',                'intern',  'eldoret')
) as v(email, name, title, role, branch)
  on lower(u.email) = v.email
on conflict (id) do update
  set name   = excluded.name,
      title  = excluded.title,
      role   = excluded.role,
      branch = excluded.branch;

-- Check it worked — should return six rows with the right roles.
select email, name, role, branch, must_change_pw from public.profiles order by role;

-- =====================================================================
-- Finance PINs are NOT seeded here on purpose.
-- Ken and Miriam each set their own on first entry to Finance, and it is
-- stored as a bcrypt hash. Nobody — including you — can read it back.
-- =====================================================================
