/*
  # Fix Welcome Email Trigger and Cron Job

  1. Changes
    - Updated trigger function to use hardcoded Supabase URL (not a secret, it's a public endpoint)
    - Edge functions have verify_jwt=false so no auth header needed
    - Updated cron job similarly

  2. Notes
    - The edge functions themselves use SUPABASE_SERVICE_ROLE_KEY internally
    - The trigger only needs to reach the public endpoint
*/

CREATE OR REPLACE FUNCTION notify_welcome_email()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://vbsxdxcexoejmjmsbhdv.supabase.co/functions/v1/send-welcome-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', jsonb_build_object(
        'id', NEW.id,
        'display_name', NEW.display_name
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_profile_created_welcome_email ON profiles;

CREATE TRIGGER on_profile_created_welcome_email
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome_email();

-- Unschedule existing job if it exists
SELECT cron.unschedule('send-daily-animal-fact');

-- Schedule daily animal fact email at 8am EST (13:00 UTC)
SELECT cron.schedule(
  'send-daily-animal-fact',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vbsxdxcexoejmjmsbhdv.supabase.co/functions/v1/send-daily-fact',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
