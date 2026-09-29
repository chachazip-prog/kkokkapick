# Mobile release foundation

Android/iOS native projects are release artifacts, not disposable generated output.

## Current batch

Android project scaffolding is committed first so CI can build an installable debug artifact. The application ID is an engineering placeholder until Product Owner approves the final store identifier. Release signing MUST NOT use debug signing for external distribution; the current release block is a build scaffold only.

iOS requires Xcode project artifacts generated from a Flutter-capable macOS environment. Do not hand-author an incomplete pbxproj. Add iOS in the release-signing batch and validate with xcodebuild/Flutter on macOS CI.

## Gates before external beta

- final Android applicationId and iOS bundle identifier approved;
- real launcher icons/splash assets;
- Android release keystore held only in protected CI/store credentials;
- iOS distribution signing through Apple developer credentials;
- Android release build and iOS archive both pass;
- deep-link/auth callback schemes match enabled login providers;
- no production secrets compiled into the app;
- privacy/support/account-deletion URLs are production reachable.
