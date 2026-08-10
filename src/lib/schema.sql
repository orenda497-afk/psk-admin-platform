-- PSK Safaris Admin Platform — Database Schema
-- Run this in Supabase SQL Editor

-- VEHICLES
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  reg text not null unique,
  make text not null,
  model text not null,
  year integer not null,
  colour text,
  seats integer,
  fuel_type text default 'Petrol',
  transmission text default 'Automatic',
  drive_type text default '4WD',
  vehicle_class text,
  branch text not null check (branch in ('eldoret','kisumu')),
  owner_id uuid references vehicle_owners(id),
  date_joined date,
  status text not null default 'available' check (status in ('available','chauffeured','safari','self-drive','service','overdue','grounded')),
  odometer integer,
  next_service_km integer,
  insurance_expiry date,
  inspection_expiry date,
  road_licence_expiry date,
  psv_expiry date,
  condition_notes text
);

-- VEHICLE OWNERS (Partners)
create table if not exists vehicle_owners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  branch text not null check (branch in ('eldoret','kisumu')),
  national_id text,
  mpesa_number text,
  bank_name text,
  bank_account text,
  bank_account_name text,
  notes text
);

-- CLIENTS
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text not null check (type in ('individual','corporate','agency','government')),
  name text not null,
  phone text not null,
  secondary_phone text,
  email text,
  id_type text,
  id_number text,
  id_photo_url text,
  address text,
  city text,
  kra_pin text,
  contact_person text,
  credit_limit numeric(12,2) default 0,
  payment_terms integer default 0,
  branch text not null check (branch in ('eldoret','kisumu')),
  notes text
);

-- DRIVERS
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  branch text not null check (branch in ('eldoret','kisumu')),
  national_id text,
  licence_number text,
  licence_class text,
  licence_expiry date,
  licence_photo_url text,
  psv_badge_number text,
  psv_expiry date,
  psv_photo_url text,
  good_conduct_expiry date,
  good_conduct_url text,
  medical_expiry date,
  medical_url text,
  status text default 'available' check (status in ('available','on_trip','on_safari','off_duty')),
  notes text
);

-- BOOKINGS
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  booking_ref text unique,
  branch text not null check (branch in ('eldoret','kisumu')),
  client_id uuid references clients(id),
  vehicle_id uuid references vehicles(id),
  driver_id uuid references drivers(id),
  trip_type text check (trip_type in ('chauffeured','safari','self-drive','airport')),
  pickup_date timestamptz not null,
  return_date timestamptz not null,
  pickup_location text,
  dropoff_location text,
  distance_band text,
  status text default 'confirmed' check (status in ('confirmed','active','completed','cancelled','overdue')),
  amount numeric(12,2),
  amount_paid numeric(12,2) default 0,
  notes text
);

-- EXPENSES
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  branch text not null check (branch in ('eldoret','kisumu')),
  vehicle_id uuid references vehicles(id),
  category text not null,
  vendor text,
  description text,
  amount numeric(12,2) not null,
  receipt_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  expense_date date not null,
  logged_by text,
  approved_by text,
  notes text
);

-- REMINDERS
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  branch text check (branch in ('eldoret','kisumu')),
  type text not null,
  entity_type text,
  entity_id uuid,
  title text not null,
  detail text,
  due_date date,
  priority text default 'amber' check (priority in ('red','amber','grey')),
  resolved boolean default false
);

-- Enable Row Level Security (allow all for now — add policies later)
alter table vehicles enable row level security;
alter table vehicle_owners enable row level security;
alter table clients enable row level security;
alter table drivers enable row level security;
alter table bookings enable row level security;
alter table expenses enable row level security;
alter table reminders enable row level security;

-- Temporary open policies (restrict later when auth is set up)
create policy "Allow all" on vehicles for all using (true) with check (true);
create policy "Allow all" on vehicle_owners for all using (true) with check (true);
create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on drivers for all using (true) with check (true);
create policy "Allow all" on bookings for all using (true) with check (true);
create policy "Allow all" on expenses for all using (true) with check (true);
create policy "Allow all" on reminders for all using (true) with check (true);

-- RENTAL AGREEMENTS
create table if not exists rental_agreements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  agreement_ref text unique,
  booking_id uuid references bookings(id),
  branch text not null check (branch in ('eldoret','kisumu')),
  client_name text not null,
  client_id_number text,
  client_phone text,
  vehicle_reg text not null,
  vehicle_make text,
  vehicle_model text,
  pickup_date date,
  return_date date,
  pickup_location text,
  dropoff_location text,
  daily_rate numeric(10,2),
  total_amount numeric(12,2),
  deposit_amount numeric(10,2),
  trip_type text,
  special_conditions text,
  status text default 'draft' check (status in ('draft','sent','signed','expired','cancelled')),
  client_signed boolean default false,
  staff_signed boolean default false
);
alter table rental_agreements enable row level security;
create policy "open" on rental_agreements for all using (true) with check (true);

-- PSK DOCUMENTS (invoices, quotations, receipts, credit notes, debit notes)
create table if not exists psk_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  doc_ref text unique,
  doc_type text not null check (doc_type in ('quotation','invoice','receipt','credit_note','debit_note')),
  branch text not null check (branch in ('eldoret','kisumu')),
  client_id uuid,
  client_name text not null,
  client_phone text,
  client_email text,
  client_address text,
  booking_ref text,
  issue_date date not null,
  due_date date,
  valid_until date,
  line_items jsonb default '[]',
  subtotal numeric(12,2) default 0,
  vat_rate numeric(5,2) default 0,
  vat_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  amount_paid numeric(12,2) default 0,
  balance numeric(12,2) default 0,
  notes text,
  status text default 'draft',
  linked_doc_ref text
);
alter table psk_documents enable row level security;
create policy "open" on psk_documents for all using (true) with check (true);

-- MAINTENANCE LOGS
create table if not exists maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  vehicle_id uuid references vehicles(id),
  service_type text,
  service_date date,
  odometer_at_service integer,
  vendor text,
  next_service_km integer,
  notes text,
  receipt_url text
);
alter table maintenance_logs enable row level security;
create policy "open" on maintenance_logs for all using (true) with check (true);

-- FUEL LOGS
create table if not exists fuel_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  vehicle_id uuid references vehicles(id),
  driver_id uuid,
  fuel_date date,
  litres numeric(8,2),
  amount_kes numeric(10,2),
  odometer integer,
  station text,
  km_driven integer,
  kes_per_100km numeric(8,2),
  receipt_url text
);
alter table fuel_logs enable row level security;
create policy "open" on fuel_logs for all using (true) with check (true);

-- EXPENSES
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date date not null,
  category text not null,
  description text not null,
  amount numeric(12,2) not null,
  vehicle_id uuid,
  branch text,
  receipt_url text,
  notes text
);
alter table expenses enable row level security;
create policy "open" on expenses for all using (true) with check (true);

-- MPESA TRANSACTIONS
create table if not exists mpesa_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date date not null,
  mpesa_ref text unique not null,
  type text,
  amount numeric(12,2) not null,
  phone text,
  name text not null,
  matched boolean default false,
  invoice_ref text,
  booking_ref text,
  branch text,
  notes text,
  receipt_sent boolean default false
);
alter table mpesa_transactions enable row level security;
create policy "open" on mpesa_transactions for all using (true) with check (true);

-- OWNER PAYOUTS
create table if not exists owner_payouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_id uuid,
  owner_name text not null,
  vehicle_id uuid,
  period text not null,
  gross_revenue numeric(12,2) default 0,
  expenses numeric(12,2) default 0,
  net_revenue numeric(12,2) default 0,
  owner_share numeric(12,2) default 0,
  psk_share numeric(12,2) default 0,
  paid boolean default false,
  paid_date date,
  method text,
  notes text
);
alter table owner_payouts enable row level security;
create policy "open" on owner_payouts for all using (true) with check (true);
