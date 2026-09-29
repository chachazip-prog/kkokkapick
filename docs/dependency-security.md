# Dependency security gate

The release pipeline treats dependency changes as reviewed code changes.

- `flutter/pubspec.lock` must remain reproducible after `flutter pub get`.
- Dependency changes run Flutter analysis in a clean CI environment.
- `flutter pub outdated` is recorded for maintainer review without automatically upgrading packages.
- Production secrets are not required by this workflow.
- Package upgrades remain explicit PRs; do not silently take major-version upgrades during release stabilization.

This gate is dependency hygiene, not a vulnerability-database guarantee. Before store submission, the release owner must still review any ecosystem advisories affecting the locked Flutter/Dart packages and the native toolchain.
