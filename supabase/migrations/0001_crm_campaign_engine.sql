-- Lead Re-engagement campaign engine — state + scheduler tables.
-- Engagement signal = SendGrid opens/clicks (no Inbound Parse). Scheduler = pg_cron + Edge Function.

-- Published flow snapshot (the browser builder edits localStorage; "Activate" snapshots flow JSON here).
create table if not exists public.crm_campaign_flows (
  id          text primary key,            -- campaign id (e.g. 'lead-re-engagement')
  name        text not null,
  status      text not null default 'Active',
  flow        jsonb not null,              -- { nodes: [...], edges: [...] }
  published_at timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per lead enrolled in a campaign.
create table if not exists public.crm_enrollments (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   text not null references public.crm_campaign_flows(id) on delete cascade,
  lead_id       uuid not null,             -- references crm_leads(id) logically
  current_node_id text not null,
  status        text not null default 'active',  -- active|engaged|cold|suppressed|completed
  context       jsonb not null default '{}'::jsonb,
  enrolled_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_crm_enrollments_status on public.crm_enrollments(status);

-- Durable timer queue. campaign-tick processes rows where status='pending' and run_at<=now().
create table if not exists public.crm_scheduled_jobs (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.crm_enrollments(id) on delete cascade,
  node_id       text not null,             -- node to execute when due
  run_at        timestamptz not null,
  status        text not null default 'pending',  -- pending|done|failed
  attempts      int not null default 0,
  last_error    text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_crm_jobs_due on public.crm_scheduled_jobs(status, run_at);

-- Each email we send (so webhook events can be correlated back to a step).
create table if not exists public.crm_email_sends (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.crm_enrollments(id) on delete cascade,
  node_id       text not null,
  lead_id       uuid not null,
  sg_message_id text,                       -- SendGrid X-Message-Id (prefix of webhook sg_message_id)
  subject       text,
  sent_at       timestamptz not null default now()
);
create index if not exists idx_crm_sends_msgid on public.crm_email_sends(sg_message_id);

-- Raw engagement events from the SendGrid Event Webhook.
create table if not exists public.crm_email_events (
  id            uuid primary key default gen_random_uuid(),
  send_id       uuid references public.crm_email_sends(id) on delete set null,
  enrollment_id uuid references public.crm_enrollments(id) on delete set null,
  sg_message_id text,
  event_type    text not null,             -- delivered|open|click|bounce|dropped|spamreport|unsubscribe
  url           text,                       -- for click events
  occurred_at   timestamptz not null,
  raw           jsonb not null,
  created_at    timestamptz not null default now()
);
-- Dedupe SendGrid retries (it may resend the same event).
create unique index if not exists uq_crm_events
  on public.crm_email_events(sg_message_id, event_type, occurred_at);

-- Leads we must never email again.
create table if not exists public.crm_suppressions (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  lead_id     uuid,
  reason      text not null,               -- unsub|bounce|spam|dropped
  created_at  timestamptz not null default now()
);

-- Lock everything down: engine + webhook use the service role (which bypasses RLS).
-- No anon/auth policies are added, so the browser cannot read/write these directly.
alter table public.crm_campaign_flows  enable row level security;
alter table public.crm_enrollments     enable row level security;
alter table public.crm_scheduled_jobs  enable row level security;
alter table public.crm_email_sends     enable row level security;
alter table public.crm_email_events    enable row level security;
alter table public.crm_suppressions    enable row level security;
