# Release workflow matrix

This document records what each GitHub Actions workflow proves. A successful CI workflow is build/test evidence only; it never substitutes for independent QA, and it never grants visual QA acceptance by itself.

| Workflow | Primary trigger | Purpose | Evidence / gate |
|---|---|---|---|
| `code-quality.yml` | PR, main | JavaScript/repository quality checks | Automated implementation evidence |
| `release-preflight.yml` | PR, main, manual | Repository/release configuration preflight | Automated release-readiness evidence |
| `flutter-quality.yml` | Flutter PR/main changes | Flutter analyze, test, Android debug build/toolchain guards | Automated Flutter implementation evidence |
| `flutter-ui-preview.yml` | Flutter PR, manual | PR preview readiness check | Confirms Flutter source is analyzable/testable; not a deployed visual QA artifact |
| `flutter-preview-pages.yml` | Flutter changes on main, manual | Build Flutter Web preview and publish into Pages source | Creates deployed preview evidence tied to `SOURCE_REVISION` and `release-evidence.json` |
| `android-release.yml` | Repository-defined release trigger | Android release foundation/build checks | Platform release evidence; see workflow for signing/publishing boundary |
| `ios-release-foundation.yml` | Repository-defined release trigger | iOS unsigned/release-foundation checks | Platform release evidence; not App Store publication |
| `dependency-security.yml` | Repository-defined trigger | Dependency/security checks | Security automation evidence |
| `sync-adpick.yml` | Schedule/manual as defined | Product/provider sync | Data pipeline operational evidence |
| `sync-adpick-biz.yml` | Schedule/manual as defined | AdPick Biz sync | Data pipeline operational evidence |

## Visual release evidence

For a deployed Flutter Preview, verify all of the following before visual QA:

1. `flutter-preview/SOURCE_REVISION` equals the source commit intended for review.
2. `flutter-preview/release-evidence.json` records the source SHA, source ref, and workflow run ID.
3. GitHub Pages deployment completed successfully for the generated preview commit.
4. Independent QA reviews the deployed URL at required viewport/text-scale cases and records `QA_PASS`, `QA_FAIL`, or `QA_BLOCKED`.
5. CI success alone must never be reported as visual acceptance.

## Rollback

Preview rollback is source-driven: revert or fix the source commit on `main`, then allow `flutter-preview-pages.yml` to publish a new traceable preview. Generated `flutter-preview/` content is disposable and must not be treated as source-of-truth application code.

## Cost classification

Current workflow hardening adds only tiny text evidence files to the existing preview output and no new service, schedule, runner class, polling frequency, or recurring paid dependency. Cost impact: negligible.
