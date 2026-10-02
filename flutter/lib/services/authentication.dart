enum AuthMethod { google, kakao, naver, apple, emailPassword }

extension AuthMethodMetadata on AuthMethod {
  String get label=>switch(this){
    AuthMethod.google=>'Google',
    AuthMethod.kakao=>'카카오',
    AuthMethod.naver=>'네이버',
    AuthMethod.apple=>'Apple',
    AuthMethod.emailPassword=>'이메일',
  };
  bool get isSocial=>this!=AuthMethod.emailPassword;
}

abstract interface class AuthenticationGateway {
  Future<void> signInWithSocial(AuthMethod method);
  Future<void> signInWithEmail({required String email,required String password});
  Future<void> createEmailAccount({required String email,required String password});
}

final class AuthenticationCoordinator {
  const AuthenticationCoordinator(this.gateway);
  final AuthenticationGateway gateway;

  // Target scope is broader than the methods that are actually wired into
  // the current release client. Do not expose a target method as enabled.
  static const targetMethods=<AuthMethod>{
    AuthMethod.google,AuthMethod.kakao,AuthMethod.naver,AuthMethod.apple,AuthMethod.emailPassword,
  };
  static const supportedMethods=<AuthMethod>{AuthMethod.emailPassword};

  Future<void> social(AuthMethod method) {
    if(!method.isSocial)throw ArgumentError.value(method,'method');
    if(!supportedMethods.contains(method)){
      throw UnsupportedError('Social authentication is not enabled in this release.');
    }
    return gateway.signInWithSocial(method);
  }

  Future<void> email({required String email,required String password,required bool create}) {
    final normalized=email.trim().toLowerCase();
    if(normalized.isEmpty||password.isEmpty)throw ArgumentError('Email and password are required');
    return create
      ? gateway.createEmailAccount(email:normalized,password:password)
      : gateway.signInWithEmail(email:normalized,password:password);
  }
}


abstract interface class SessionTokenStore {
  Future<StoredSessionTokens?> read();
  Future<void> write(StoredSessionTokens tokens);
  Future<void> clear();
}

final class StoredSessionTokens {
  const StoredSessionTokens({required this.accessToken,required this.refreshToken,this.userId});
  final String accessToken,refreshToken;
  final String? userId;
}
