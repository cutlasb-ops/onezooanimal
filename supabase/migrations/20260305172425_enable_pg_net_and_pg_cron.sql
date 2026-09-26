/*
  # Enable pg_net and pg_cron Extensions

  1. Extensions
    - `pg_net` - Async HTTP requests from within PostgreSQL (for calling edge functions)
    - `pg_cron` - Job scheduler for recurring tasks (for daily 8am EST emails)

  2. Purpose
    - pg_net: Used to call edge functions from database triggers/webhooks
    - pg_cron: Used to schedule daily animal fact emails at 8am EST
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
