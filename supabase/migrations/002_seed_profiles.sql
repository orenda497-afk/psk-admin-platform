-- =====================================================================
-- PSK Admin Platform — seed staff profiles
--
-- RUN THIS SECOND, only AFTER creating users in Auth.
-- Matches on email — emails must match exactly what was entered in Auth.
--
-- Staff roster (real inboxes used as login emails):
--   kmulanya@psksafaris.com   — Ken Mulanya, Owner
--   mmutoko@psksafaris.com    — Miriam Wanjiku, Finance Manager
--   faith@psksafaris.com      — Faith, Kisumu Branch Manager
--   evans@psksafaris.com      — Evans, Operations
--   brenda@psksafaris.com     — Brenda, Operations Assistant
--   intern@psksafaris.com     — Intern (shared, no real inbox — Kevin resets)
-- =====================================================================

insert into public.profiles (id, email, name, title, role, branch, must_change_pw)
select u.id, u.email, v.name, v.title, v.role, v.branch, true
from auth.users u
join (values
  ('kmulanya@psksafaris.com', 'Ken Mulanya',    'Owner',                 'owner',   'eldoret'),
  ('mmutoko@psksafaris.com',  'Miriam Wanjiku', 'Finance Manager',       'finance', 'eldoret'),
  ('faith@psksafaris.com',    'Faith',          'Kisumu Branch Manager', 'manager', 'kisumu'),
  ('evans@psksafaris.com',    'Evans',          'Operations',            'ops',     'eldoret'),
  ('brenda@psksafaris.com',   'Brenda',         'Operations Assistant',  'ops',     'eldoret'),
  ('intern@psksafaris.com',   'Intern',         'Intern',                'intern',  'eldoret')
) as v(email, name, title, role, branch)
  on lower(u.email) = v.email
on conflict (id) do update
  set name   = excluded.name,
      title  = excluded.title,
      role   = excluded.role,
      branch = excluded.branch;

-- Should return 6 rows. If fewer, the missing person's Auth email
-- doesn't match the list above — check for typos.
select email, name, role, branch, must_change_pw
from public.profiles order by role;
