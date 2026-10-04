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

## Current web guest storage (Release UI review branch)

- `kkokkapickChildProfiles`: version1, selected child id, profiles with local id, optional nickname (20characters), months, height and weight. Several children are supported; no gender, birthday, photo or new server upload.
- `months` / `height` / `weight`: compatibility mirror of the selected child. The primary profile store is authoritative; mirror-write failure does not duplicate or fail a successful primary save.
- Deleting one child removes its profile and, if needed, selects another child and updates mirrors. Deleting the final child removes legacy measurement keys. Favorites, recent products and target prices remain.
- All-site browser data deletion also removes the primary key and compatibility keys. Storage lasts until user deletion; this feature does not introduce cross-device sync or analytics.
- Existing account-table deletion contract above remains unchanged; the web demo does not claim that server account deletion is connected.
