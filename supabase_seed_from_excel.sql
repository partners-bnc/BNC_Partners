-- Seeded from C:/Users/rohan/Downloads/BnC Portal.xlsx
with partner_seed(first_name, last_name, email, phone, country, city, password, status, notes, registered_at) as (
  values
    ('Anshu', 'Prasad', 'anshukumarprasad565@gmail.com', '9304002266', 'uk', 'Leeds', 'Anshu@123', 'Email Sent', null, '2026-01-30T15:00:23.000Z'),
    ('Karan ', 'Aggarwal', 'karan@krishankaran.com', '9810228900', 'india', 'Delhi', 'Kanikaran1@', 'Email Sent', null, '2026-01-30T16:04:14.000Z'),
    ('Pranay', 'Baid', 'capranayjain@yahoo.com', '9516356317', 'india', 'Other', '2425867@Pb', 'Email Sent', null, '2026-02-01T12:54:30.000Z'),
    ('Ashok ', 'Nelakurthi ', 'ashokkumarn121@gmail.com', '9618907687', 'india', 'Hyderabad', 'Run@4win', 'Email Sent', null, '2026-02-01T16:48:51.000Z'),
    ('Harmeet', 'Pahuja', 'caharmeet@mail.ca.in', '8149839983', 'india', 'Nagpur', 'Pahuja@123456', 'Email Sent', null, '2026-02-04T17:17:24.000Z'),
    ('Nitish', 'Gupta', 'canitishgupta01@gmail.com', '9532822327', 'india', 'Other', 'Nitosh@9254', 'Email Sent', null, '2026-02-05T15:10:33.000Z'),
    ('Sumit ', 'Goyal ', 'summit.bnc@gmail.com', '9810575613', 'india', 'Delhi', '100Billion$', 'Email Sent', null, '2026-02-09T19:38:29.000Z'),
    ('harsh ', 'BalLyan', 'harsh25ballyan@gmail.com', '8700505181', 'india', 'Pune', '0123456789@aA', 'Email Sent', null, '2026-02-11T15:24:16.000Z'),
    ('Mohamed', 'Moafy', 'moafy_942@hotmail.com', '531598082', 'saudi', 'Riyadh', 'M00afy@2026', 'Email Sent', null, '2026-02-16T19:50:17.000Z'),
    ('Mohamed', 'Mowafi', 'm.mowafi@connectsaudi.com', '9665976131', 'japan', 'Tokyo', 'Mowafi@123', 'Email Sent', null, '2026-02-18T16:04:45.000Z')
),
admin_seed(admin_id, email, password) as (
  values
    ('Admin2266', 'admin2266@bncglobal.local', 'Bnc@2266')
),
all_auth_seed as (
  select email, password, 'partner'::text as user_role,
         jsonb_build_object('first_name', first_name, 'last_name', last_name) as user_meta,
         registered_at::timestamptz as created_at
  from partner_seed
  union all
  select email, password, 'admin'::text as user_role, '{}'::jsonb as user_meta, now()
  from admin_seed
),
inserted_users as (
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  select
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    s.email,
    crypt(s.password, gen_salt('bf')),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', s.user_role),
    coalesce(s.user_meta, '{}'::jsonb),
    coalesce(s.created_at, now()),
    now()
  from all_auth_seed s
  where not exists (
    select 1 from auth.users u where lower(u.email) = lower(s.email)
  )
  returning id, email
),
identities_insert as (
  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(),
    u.id,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email',
    u.email,
    now(),
    now(),
    now()
  from auth.users u
  join all_auth_seed s on lower(s.email) = lower(u.email)
  where not exists (
    select 1
    from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  )
  returning id
)
insert into public.partner_profiles (
  id, first_name, last_name, email, phone, country, city, status, notes, registered_at
)
select
  u.id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.country,
  p.city,
  p.status,
  p.notes,
  coalesce(p.registered_at::timestamptz, now())
from partner_seed p
join auth.users u on lower(u.email) = lower(p.email)
on conflict (id) do update
set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  phone = excluded.phone,
  country = excluded.country,
  city = excluded.city,
  status = excluded.status,
  notes = excluded.notes,
  registered_at = excluded.registered_at;

insert into public.admin_profiles (id, admin_id, email)
select u.id, a.admin_id, a.email
from admin_seed a
join auth.users u on lower(u.email) = lower(a.email)
on conflict (id) do update
set
  admin_id = excluded.admin_id,
  email = excluded.email;

with ai_seed(partner_email, partner_type, services, industries, experience_industries, experience_years, organisation_name, bio, created_at) as (
  values
    ('caharmeet@mail.ca.in', 'service-provider', 'cyber-security, esg, finance-advisory, internal-audit, data-privacy, virtual-cfo, other, ifrs, sop', 'Infrastructure Development, Project Management, Construction & Engineering, Consumer Electronics & Appliances, Textiles & Apparel, Food & Beverage, Business Support, Consulting, Research, Assurance', 'finance, retail, other', '3', null, 'I am a Chartered Accountant and CISA professional specializing in audit, risk assurance, IT controls, and financial advisory. I work at the intersection of finance and systems, helping organizations strengthen internal controls, improve reporting structures, and build reliable, decision-ready financial information. My experience spans internal, statutory, tax, and bank audits across diverse industries. I have worked on ICFR evaluations, Ind AS/IFRS transitions, MIS design, and accounting system implementation for growing businesses. I also support project finance documentation, government incentive compliance, and international accounting assignments, bringing a structured, analytical, and control-focused approach to audit, compliance, and financial transformation engagements.
', '2026-02-04T17:33:59.000Z'),
    ('anshukumar565@gmail.com', 'technology-partners', 'ifrs, finance-tax-compliance', 'Refining & Marketing (Downstream)', 'public-services', 'public services: 9', 'public services: gfhfgb', 'bfgbdgb', '2026-02-18T15:56:57.000Z'),
    ('m.mowafi@connectsaudi.com', 'international-partners', 'cyber-security, internal-audit', 'IT Consulting & Services, Communication Equipment', 'technology', 'technology: 10', 'technology: connect saudi ', 'any thing ', '2026-02-19T13:14:16.000Z')
)
insert into public.partner_ai_profiles (
  partner_id, partner_email, partner_type, services, industries,
  experience_industries, experience_years, organisation_name, bio, created_at
)
select
  p.id,
  a.partner_email,
  a.partner_type,
  a.services,
  a.industries,
  a.experience_industries,
  a.experience_years,
  a.organisation_name,
  a.bio,
  coalesce(a.created_at::timestamptz, now())
from ai_seed a
left join public.partner_profiles p on lower(p.email) = lower(a.partner_email)
on conflict ((lower(partner_email))) do update
set
  partner_id = excluded.partner_id,
  partner_type = excluded.partner_type,
  services = excluded.services,
  industries = excluded.industries,
  experience_industries = excluded.experience_industries,
  experience_years = excluded.experience_years,
  organisation_name = excluded.organisation_name,
  bio = excluded.bio,
  created_at = excluded.created_at;

with enquiry_seed(created_at, country, country_label, service, form_type, full_name, email, phone, company, message) as (
  values
    ('2026-02-16T15:03:11.000Z', 'india', 'India', 'Cybersecurity & Data Privacy', 'Manpower', 'Anshu jack', 'anshujack25@gmail.com', '7781085333', 'bnc', 'I want manpower almost 40 people. Who can build my business?'),
    ('2026-02-16T15:04:44.000Z', 'saudi-arabia', 'Saudi Arabia', 'Training & Workshop', 'Training', 'Anshu jack', 'anshujack25@gmail.com', '7781085333', 'chfg', 'I need training. For the accountant and services. For my employees.')
)
insert into public.service_enquiries (
  partner_id, country, country_label, service, form_type, full_name,
  email, phone, company, message, created_at
)
select
  p.id,
  e.country,
  e.country_label,
  e.service,
  e.form_type,
  e.full_name,
  e.email,
  e.phone,
  e.company,
  e.message,
  coalesce(e.created_at::timestamptz, now())
from enquiry_seed e
left join public.partner_profiles p on lower(p.email) = lower(e.email);

