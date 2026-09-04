-- Each reminder can have only one active or successful delivery for a due date.
-- Audit existing notification_logs for duplicates before applying this migration.
alter table public.notification_logs
  add constraint notification_logs_reminder_scheduled_for_key
  unique (reminder_id, scheduled_for);

create or replace function public.claim_reminder_notification(
  p_reminder_id uuid,
  p_user_id uuid,
  p_person_id uuid,
  p_event_id uuid,
  p_scheduled_for timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_log_id uuid;
begin
  insert into public.notification_logs (
    user_id,
    reminder_id,
    person_id,
    event_id,
    scheduled_for,
    status
  )
  values (
    p_user_id,
    p_reminder_id,
    p_person_id,
    p_event_id,
    p_scheduled_for,
    'processing'
  )
  on conflict (reminder_id, scheduled_for) do update
    set
      status = 'processing',
      sent_at = null,
      error_message = null
    where public.notification_logs.status = 'failed'
  returning id into v_notification_log_id;

  return v_notification_log_id;
end;
$$;

revoke all on function public.claim_reminder_notification(uuid, uuid, uuid, uuid, timestamptz) from public;
grant execute on function public.claim_reminder_notification(uuid, uuid, uuid, uuid, timestamptz) to service_role;
