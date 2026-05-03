drop policy if exists "voice_requirements_insert_authenticated" on public.voice_requirements;

alter table public.voice_requirements
alter column recipient_email set default 'summit@bncglobal.in';

create policy "voice_requirements_insert_authenticated"
on public.voice_requirements
for insert
to authenticated
with check (
  lower(partner_email) = lower(auth.jwt() ->> 'email')
  and lower(recipient_email) = 'summit@bncglobal.in'
  and (partner_id is null or partner_id = auth.uid())
);
