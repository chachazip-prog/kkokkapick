# Release preflight

`Release preflight` is the repository-level release gate aggregator.

Normal PR/main runs validate the release artifacts, account-deletion/commercial-abuse/production-config contracts and reject tracked signing material without requiring production credentials.

For a real store candidate, manually run the workflow with **Require configured production public backend** enabled. The protected repository/environment values `PRODUCTION_SUPABASE_URL` and `PRODUCTION_SUPABASE_ANON_KEY` must then be configured; the run fails if they are absent or point to GitHub Pages.

A green preflight does not replace deployed Supabase E2E, signed mobile artifacts, provider-rights review, device/accessibility QA, backup/restore rehearsal, or Product Owner submission authorization.
