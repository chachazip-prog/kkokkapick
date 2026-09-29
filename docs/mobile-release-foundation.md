# Mobile release foundation

Android/iOS native projects are release artifacts, not disposable generated output.

## Current batch

Android project scaffolding is committed first so CI can build an installable debug artifact. The application ID is an engineering placeholder until Product Owner approves the final store identifier. Release signing MUST NOT use debug signing for external distribution; the current release block is a build scaffold only.

iOS native project generation is now exercised on macOS CI from the Flutter source using `flutter create --platforms=ios`, followed by an unsigned release build. This deliberately avoids hand-authoring an incomplete pbxproj. The generated project is disposable until the Product Owner settles the final bundle identifier; at that gate, commit the native iOS artifacts and configure Apple signing/capabilities.

## Gates before external beta

- final Android applicationId and iOS bundle identifier approved;
- real launcher icons/splash assets;
- Android release keystore held only in protected CI/store credentials;
- iOS distribution signing through Apple developer credentials;
- Android release build and iOS archive both pass;
- deep-link/auth callback schemes match enabled login providers;
- no production secrets compiled into the app;
- privacy/support/account-deletion URLs are production reachable.
