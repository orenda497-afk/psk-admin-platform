-- Temporary Finance PINs (Ken: 1234, Miriam: 226688)
-- Run this in Supabase SQL editor
-- Staff can change via Profile -> Finance PIN tab after logging in

update public.profiles
set finance_pin_hash = crypt('1234', gen_salt('bf')),
    pin_attempts = 0,
    pin_locked_until = null
where email = 'kmulanya@psksafaris.com';

update public.profiles
set finance_pin_hash = crypt('226688', gen_salt('bf')),
    pin_attempts = 0,
    pin_locked_until = null
where email = 'mmutoko@psksafaris.com';

-- Verify
select email, role, (finance_pin_hash is not null) as pin_set
from public.profiles
where role in ('owner','finance');
