-- Campaign engine: internal notifications + the pg_cron schedule that drives campaign-tick.

-- "Notify rep" action nodes write here; surface these in the CRM inbox later.
create table if not exists public.crm_notifications (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.crm_enrollments(id) on delete cascade,
  lead_id       uuid,
  kind          text not null,
  message       text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.crm_notifications enable row level security;

-- Scheduler plumbing.
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Store the shared tick secret in Vault so it is not hardcoded in this migration.
-- Run ONCE (replace the value), then the cron job below reads it back:
--   select vault.create_secret('REPLACE_WITH_CAMPAIGN_TICK_SECRET', 'campaign_tick_secret');
-- If it already exists, rotate with:
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'campaign_tick_secret'),
--     'NEW_SECRET');

-- Every minute: POST to campaign-tick with the secret header. pg_net runs it async.
select cron.unschedule('campaign-tick-every-min')
where exists (select 1 from cron.job where jobname = 'campaign-tick-every-min');

select cron.schedule(
  'campaign-tick-every-min',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://xsxiuvqgngikzvchjnxq.supabase.co/functions/v1/campaign-tick',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-tick-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'campaign_tick_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);
