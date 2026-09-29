# Account data inventory

This inventory defines data directly owned by a KKOKKAPICK customer account for deletion review. It intentionally excludes operator/admin/commercial-partner identities even when those schemas contain an owner/actor user reference.

| Table | Customer relationship | Account deletion |
| --- | --- | --- |
| `profiles` | account profile | explicit delete by `id = auth.uid()` |
| `child_profiles` | child fit/profile data | explicit delete by `user_id` |
| `favorites` | saved products | explicit delete by `user_id` |
| `price_alerts` | user price-alert rules | explicit delete by `user_id`; delivery ledger cascades through alert |
| `push_devices` | account-bound push token registration | explicit delete by `user_id` before identity deletion |

## Review rule

Any new table that stores customer-account personal data must be added to this inventory and either explicitly deleted by `delete_my_account()` or documented with a verified foreign-key cascade. Operator/admin audit data and commercial partner ownership references require separate retention/legal review and must not be silently treated as customer-owned deletion data.

Production E2E must still verify that deleting an account removes the identity, invalidates access, removes/cascades the rows above, and does not leave an active push token.
