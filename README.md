# RemindMeUp

Appointment management application built with Next.js and Supabase.

## Local Development

1. Copy the environment variables from `.env.example` into `.env.local`.
2. Add the Supabase project URL and keys.
3. Run:

```bash
npm install
npm run dev
```

The local application opens at [http://localhost:3000](http://localhost:3000).

## Production Pilot For The Dental Office

Do not enter real patient or client data before completing these steps.

1. Create a dedicated Supabase production project in an EU region.
2. Run the SQL migrations in order from `supabase/migrations/` in the Supabase SQL Editor.
3. In Supabase Authentication, enable email confirmation and create or invite the office user.
4. Deploy the project to Vercel and add the production environment variables.
5. Set `ALLOW_PUBLIC_SIGNUP=false` in Vercel for the initial pilot.
6. Connect a custom domain, for example `app.remindmeup.gr`.
7. Enable an appropriate Supabase backup plan and test downloading an export from Settings.
8. Test sign-in, creation of a client, creation/editing of an appointment, exports, and the mobile layout before daily use.

## Data Protection

The app stores names, mobile phone numbers, appointments, and notes. For a dental practice these can involve sensitive personal data. Use client notes only for minimal administrative information until legal/GDPR requirements for clinical or health-related notes have been addressed.

The migration `20260526090000_secure_user_data.sql` enables Row Level Security policies so authenticated users can access only their own profiles, clients, appointments, and message logs.

## Accounts And Platform Administration

For the first office pilot, registration is invitation-only: keep `ALLOW_PUBLIC_SIGNUP=false` and create the office account through Supabase Authentication. The platform owner manages deployments through the Git repository, Vercel, and Supabase, without needing routine access to client data.

Before selling the app to another business, the database must be expanded to support organizations/clinics and staff membership roles so multiple people at the same office can collaborate while separate businesses remain isolated.

## Reminders

The interface is configured for SMS reminders, but the current server sender is still email-based and does not deliver SMS. An SMS provider and delivery testing must be completed before SMS reminders are used operationally.
