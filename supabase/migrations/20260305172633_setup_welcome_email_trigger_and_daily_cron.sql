/*
  # Setup Welcome Email Trigger and Daily Fact Cron Job

  1. Welcome Email Trigger
    - Creates a function `notify_welcome_email` that fires after a new row is inserted into the `profiles` table
    - Uses `pg_net` to call the `send-welcome-email` edge function asynchronously
    - Passes the new profile record as the payload

  2. Daily Animal Fact Cron Job
    - Schedules a pg_cron job to run every day at 8:00 AM EST (13:00 UTC)
    - Calls the `send-daily-fact` edge function via pg_net
    - Rotates through 60 animal facts, prioritizing least-recently-sent facts

  3. Notes
    - pg_net sends HTTP requests asynchronously so it won't block the insert
    - EST is UTC-5, so 8am EST = 1pm UTC (13:00)
    - During daylight saving (EDT = UTC-4), this would fire at 9am local -- 
      using America/New_York offset of 13:00 UTC covers standard EST
*/

-- Function to trigger welcome email on new profile insert
CREATE OR REPLACE FUNCTION notify_welcome_email()
RETURNS trigger AS $$
DECLARE
  edge_function_url text;
  service_role_key text;
BEGIN
  edge_function_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1);
  service_role_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1);

  IF edge_function_url IS NULL THEN
    edge_function_url := current_setting('app.settings.supabase_url', true);
  END IF;

  IF service_role_key IS NULL THEN
    service_role_key := current_setting('app.settings.service_role_key', true);
  END IF;

  PERFORM net.http_post(
    url := edge_function_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
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

-- Drop trigger if it already exists, then create
DROP TRIGGER IF EXISTS on_profile_created_welcome_email ON profiles;

CREATE TRIGGER on_profile_created_welcome_email
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_welcome_email();

-- Schedule daily animal fact email at 8am EST (13:00 UTC)
SELECT cron.schedule(
  'send-daily-animal-fact',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1) || '/functions/v1/send-daily-fact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
