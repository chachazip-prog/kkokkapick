import 'package:flutter/material.dart';
import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/favorites_repository.dart';
import 'repositories/child_profile_repository.dart';
import 'repositories/price_alert_repository.dart';
import 'repositories/commercial_repository.dart';
import 'repositories/popup_preference_repository.dart';
import 'repositories/commercial_attribution_repository.dart';
import 'models/commercial_content.dart';
import 'services/kkokkafit_engine.dart';
import 'package:url_launcher/url_launcher.dart';
import 'theme/kkokkapick_theme.dart';
import 'widgets/discovery_experience.dart';
import 'widgets/brand_identity.dart';
import 'services/overlay_coordinator.dart';
import 'services/local_account_data_store.dart';
import 'services/authentication.dart';
import 'services/app_session_orchestrator.dart';
import 'services/account_sync.dart';
import 'services/secure_session_token_store.dart';
import 'services/supabase_authentication_gateway.dart';

void main()=>runApp(const KkokkapickApp());

class KkokkapickApp extends StatelessWidget {
  const KkokkapickApp({super.key});
  @override
  Widget build(BuildContext context)=>MaterialApp(
    title:'꼬까픽',
    debugShowCheckedModeBanner:false,
    theme:KkokkapickTheme.light(),
    home:const CatalogScreen(),
  );
}

enum CatalogSort{recommended,low,high}

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});
  @override State<CatalogScreen> createState()=>_CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen>{
  static final _demoEndpoint=Uri.parse('https://chachazip-prog.github.io/kkokkapick/data/catalog.json');
  static const _supabaseUrl=String.fromEnvironment('SUPABASE_URL');
  static const _supabaseAnonKey=String.fromEnvironment('SUPABASE_ANON_KEY');
  final _catalog=CatalogRepository(),_favorites=FavoritesRepository(),_profiles=ChildProfileRepository(),_popupPrefs=PopupPreferenceRepository(),_search=TextEditingController();
  final Set<String> _impressedCampaignIds=<String>{};
  final _overlays=OverlayCoordinator();
  final _localAccountData=LocalAccountDataStore();
  late final SupabaseAuthenticationGateway _authentication;
  late final AppSessionOrchestrator _session;
  AppSessionState _sessionState=AppSessionState.guest;
  bool _authBusy=false;
  static const _commercial=CommercialRepository(supabaseUrl:_supabaseUrl,anonKey:_supabaseAnonKey);
  static const _attribution=CommercialAttributionRepository(supabaseUrl:_supabaseUrl,anonKey:_supabaseAnonKey);
  List<CatalogProduct> _products=const[];
  Set<String> _favoriteIds={};
  String _stage='전체',_category='전체',_brand='전체';
  CatalogSort _sort=CatalogSort.recommended;
  bool _fitOnly=false,_favoritesOnly=false,_loading=true;
  int _navIndex=0;
  Object? _error;
  ChildProfile? _profile;
  List<CommercialCampaign> _campaigns=const[];
  ManagedPopup? _managedPopup;

  @override void initState(){
    super.initState();
    _authentication=SupabaseAuthenticationGateway(baseUrl:_supabaseUrl,anonKey:_supabaseAnonKey,tokenStore:SecureSessionTokenStore());
    _session=AppSessionOrchestrator(authentication:_authentication,localData:_localAccountData,supabaseUrl:_supabaseUrl,anonKey:_supabaseAnonKey);
    _restoreSession();
    _load();
  }
  @override void dispose(){_search.dispose();super.dispose();}

  Future<void> _load() async {
    setState((){_loading=true;_error=null;});
    try{
      final catalogFuture=_supabaseUrl.isNotEmpty&&_supabaseAnonKey.isNotEmpty
          ? _catalog.fetchSupabase(supabaseUrl:_supabaseUrl,anonKey:_supabaseAnonKey)
          : _catalog.fetchCatalog(_demoEndpoint);
      final results=await Future.wait([catalogFuture,_favorites.load(),_profiles.load(),_commercial.fetchHome()]);
      if(!mounted)return;
      setState((){_products=results[0] as List<CatalogProduct>;_favoriteIds=results[1] as Set<String>;_profile=results[2] as ChildProfile?;final commercial=results[3] as CommercialContent;_campaigns=commercial.campaigns;_loading=false;});
      final commercial=results[3] as CommercialContent;
      for(final p in commercial.popups){if(!await _popupPrefs.isDismissed(p)){_managedPopup=p;break;}}
      for(final c in commercial.campaigns.take(3)){if(_impressedCampaignIds.add(c.id))_attribution.impression(campaignId:c.id);}
      if(mounted&&_managedPopup!=null)WidgetsBinding.instance.addPostFrameCallback((_)=>_showManagedPopup(_managedPopup!));
    }catch(e){if(mounted)setState((){_error=e;_loading=false;});}
  }

  List<String> _values(String Function(CatalogProduct) pick)=>['전체',...{for(final p in _products) if(pick(p).isNotEmpty) pick(p)}.toList()..sort()];
  List<String> get _availableBrands {
    final candidates=_products.where((p)=>_stageMatches(p)&&(_category=='전체'||p.category==_category)&&(!_fitOnly||p.fitStatus=='verified'));
    final values={for(final p in candidates) if((p.brand??'').isNotEmpty) p.brand!}.toList()..sort();
    return ['전체',...values];
  }
  bool _stageMatches(CatalogProduct p)=>_stage=='전체'||p.stage==_stage||(_stage=='토들러'&&(p.stage=='유아'||p.stage=='키즈'));

  List<CatalogProduct> get _visible {
    final terms=_search.text.trim().toLowerCase().split(RegExp(r'\s+')).where((e)=>e.isNotEmpty);
    final out=_products.where((p){
      final hay='${p.name} ${p.brand??''} ${p.merchant} ${p.category} ${p.stage??''}'.toLowerCase();
      return (!_favoritesOnly||_favoriteIds.contains(p.id))&&(!_fitOnly||p.fitStatus=='verified')&&_stageMatches(p)&&(_category=='전체'||p.category==_category)&&(_brand=='전체'||p.brand==_brand)&&terms.every(hay.contains);
    }).toList();
    switch(_sort){
      case CatalogSort.low: out.sort((a,b)=>(a.minPrice??1<<62).compareTo(b.minPrice??1<<62));break;
      case CatalogSort.high: out.sort((a,b)=>(b.minPrice??0).compareTo(a.minPrice??0));break;
      case CatalogSort.recommended: out.sort(_recommendedCompare);break;
    }
    return out;
  }

  int _score(CatalogProduct p){
    var score=p.fitStatus=='verified'?18:p.fitStatus=='candidate'?4:0;
    if(p.brand!=null)score+=3;
    score+=((p.offerCount-1).clamp(0,4))*5;
    if(_stage!='전체'){if(p.stage==_stage)score+=12;else if(_stage=='토들러'&&(p.stage=='유아'||p.stage=='키즈'))score+=5;}
    if((p.minPrice??0)>0)score+=1;
    return score;
  }
  int _recommendedCompare(CatalogProduct a,CatalogProduct b){
    final s=_score(b).compareTo(_score(a));if(s!=0)return s;
    final offers=b.offerCount.compareTo(a.offerCount);if(offers!=0)return offers;
    return (a.minPrice??1<<62).compareTo(b.minPrice??1<<62);
  }

  Future<void> _toggleFavorite(String id) async{
    setState(()=>_favoriteIds.contains(id)?_favoriteIds.remove(id):_favoriteIds.add(id));
    await _favorites.save(_favoriteIds);
    if(_signedIn){
      try{await _session.setFavorite(id,_favoriteIds.contains(id));}
      catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('찜은 기기에 저장했어요. 계정 동기화는 나중에 다시 시도할게요.')));}
    }
  }

  void _reset(){setState((){_search.clear();_stage=_category=_brand='전체';_fitOnly=_favoritesOnly=false;_sort=CatalogSort.recommended;});}
  void _showKkokkafitProducts(){setState((){_search.clear();_stage=_category=_brand='전체';_fitOnly=true;_favoritesOnly=false;_sort=CatalogSort.recommended;_navIndex=1;});}

  Future<void> _editProfile() async {
    final m=TextEditingController(text:_profile?.months.toString()??'');
    final ht=TextEditingController(text:_profile?.heightCm.toString()??'');
    final wt=TextEditingController(text:_profile?.weightKg.toString()??'');
    final saved=await showDialog<ChildProfile>(context:context,builder:(context)=>AlertDialog(title:const Text('아이 정보'),content:Column(mainAxisSize:MainAxisSize.min,children:[
      TextField(controller:m,keyboardType:TextInputType.number,decoration:const InputDecoration(labelText:'월령')),
      TextField(controller:ht,keyboardType:TextInputType.number,decoration:const InputDecoration(labelText:'키 cm')),
      TextField(controller:wt,keyboardType:TextInputType.number,decoration:const InputDecoration(labelText:'몸무게 kg')),
    ]),actions:[TextButton(onPressed:()=>Navigator.pop(context),child:const Text('취소')),FilledButton(onPressed:(){final p=ChildProfile(months:int.tryParse(m.text)??0,heightCm:double.tryParse(ht.text)??0,weightKg:double.tryParse(wt.text)??0);if(p.months>0&&p.heightCm>0&&p.weightKg>0)Navigator.pop(context,p);},child:const Text('저장'))]));
    m.dispose();ht.dispose();wt.dispose();
    if(saved!=null){await _profiles.save(saved);if(mounted)setState(()=>_profile=saved);if(_signedIn){try{await _session.setChildProfile({'birthDate':null,'heightCm':saved.heightCm,'weightKg':saved.weightKg,'usualSize':null,'nickname':null});}catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('아이 정보는 기기에 저장했어요. 계정 동기화는 나중에 다시 시도할게요.')));}}}
  }


  void onEditProfileProxy()=>_editProfile();

  Future<void> _showFilters() async {
    final choice=await coordinatedModal<String>(context:context,coordinator:_overlays,builder:(context)=>SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
      Text('빠른 필터',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w800)),
      const SizedBox(height:8),const Text('자주 쓰는 조건을 빠르게 적용해요.',style:TextStyle(color:KkokkapickTheme.muted)),
      const SizedBox(height:16),
      FilledButton.tonal(onPressed:()=>Navigator.pop(context,'fit'),child:const Text('꼬까핏 가능한 상품만')),
      TextButton(onPressed:()=>Navigator.pop(context,'reset'),child:const Text('필터 모두 초기화')),
    ]))));
    if(choice=='fit')setState(()=>_fitOnly=true);
    if(choice=='reset')_reset();
  }

  bool get _authConfigured=>_supabaseUrl.isNotEmpty&&_supabaseAnonKey.isNotEmpty;
  bool get _signedIn=>_sessionState==AppSessionState.authenticated||_sessionState==AppSessionState.offlineAuthenticated;

  Future<void> _restoreSession() async {
    if(!_authConfigured)return;
    if(mounted)setState(()=>_sessionState=AppSessionState.restoring);
    try{
      final result=await _session.restore();
      if(mounted)setState(()=>_sessionState=result.state);
    }catch(_){
      if(mounted)setState(()=>_sessionState=AppSessionState.guest);
    }
  }

  Future<void> _authenticateEmail(String email,String password,{required bool create}) async {
    if(!_authConfigured)return;
    setState(()=>_authBusy=true);
    try{
      await AuthenticationCoordinator(_authentication).email(email:email,password:password,create:create);
      if(!mounted)return;
      if(_authentication.tokens==null){
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('가입 확인 메일을 확인해 주세요.')));
        Navigator.of(context).pop();
        return;
      }
      setState(()=>_sessionState=AppSessionState.authenticated);
      Navigator.of(context).pop();
      await _askFirstSignInSync();
    } on AuthenticationException catch(e){
      if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('로그인에 실패했어요. (HTTP ${e.statusCode})')));
    } on AuthenticationPayloadException {
      if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('인증 응답을 확인할 수 없어요. 잠시 후 다시 시도해 주세요.')));
    } catch(_){
      if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('인증 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')));
    } finally{
      if(mounted)setState(()=>_authBusy=false);
    }
  }

  Future<void> _askFirstSignInSync() async {
    if(!_signedIn)return;
    final choice=await coordinatedModal<FirstSignInDataChoice>(context:context,coordinator:_overlays,builder:(context)=>SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
      Text('이 기기 데이터를 동기화할까요?',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w800)),
      const SizedBox(height:8),const Text('찜·아이 정보·가격 알림은 동의하기 전까지 서버로 올리지 않아요.',style:TextStyle(color:KkokkapickTheme.muted)),
      const SizedBox(height:16),FilledButton(onPressed:()=>Navigator.pop(context,FirstSignInDataChoice.syncDeviceData),child:const Text('이 기기 데이터 동기화')),
      const SizedBox(height:6),TextButton(onPressed:()=>Navigator.pop(context,FirstSignInDataChoice.keepDeviceOnly),child:const Text('이 기기에만 유지')),
    ]))));
    if(choice==null)return;
    setState(()=>_authBusy=true);
    try{await _session.applyFirstSignInChoice(choice);}
    catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('동기화를 완료하지 못했어요. 기기 데이터는 그대로 유지돼요.')));}
    finally{if(mounted)setState(()=>_authBusy=false);}
  }

  Future<void> _signOut() async {
    await _session.signOut();
    if(mounted)setState(()=>_sessionState=AppSessionState.guest);
  }

  Future<void> _showAccountSyncInfo() async {
    final local=await _localAccountData.snapshot();
    if(!mounted)return;
    final count=local.favoriteProductIds.length;
    await coordinatedModal<void>(context:context,coordinator:_overlays,builder:(context)=>SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
      Text('계정과 동기화',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w800)),
      const SizedBox(height:8),Text('현재 찜 $count개와 아이 정보, 가격 알림은 이 기기에 저장돼 있어요.',style:const TextStyle(color:KkokkapickTheme.muted)),
      const SizedBox(height:16),const Card(child:ListTile(leading:Icon(Icons.lock_outline),title:Text('로그인 후에도 자동 업로드하지 않아요'),subtitle:Text('로그인에 성공하면 이 기기 데이터를 동기화할지 먼저 선택해요.'))),
      const SizedBox(height:12),Wrap(spacing:8,runSpacing:8,children:[
        for(final method in [AuthMethod.google,AuthMethod.kakao,AuthMethod.naver,AuthMethod.apple])
          OutlinedButton(onPressed:()=>_showAuthSetupPending(context,method.label),child:Text(method.label)),
      ]),
      const SizedBox(height:8),FilledButton.tonal(onPressed:()=>_showEmailAuthSheet(context),child:const Text('이메일로 계속하기')),
    ]))));
  }

  void _showAuthSetupPending(BuildContext sheetContext,String provider){
    Navigator.of(sheetContext).pop();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text('$provider 로그인은 운영 인증 설정 연결 후 사용할 수 있어요.')));
  }

  Future<void> _showEmailAuthSheet(BuildContext sheetContext) async {
    Navigator.of(sheetContext).pop();
    await Future<void>.delayed(Duration.zero);
    if(!mounted)return;
    final email=TextEditingController(),password=TextEditingController();
    await coordinatedModal<void>(context:context,coordinator:_overlays,builder:(context)=>SafeArea(child:Padding(
      padding:EdgeInsets.fromLTRB(20,0,20,MediaQuery.viewInsetsOf(context).bottom+24),
      child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
        Text('이메일로 계속하기',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w800)),
        const SizedBox(height:12),TextField(controller:email,enabled:!_authBusy,keyboardType:TextInputType.emailAddress,autocorrect:false,decoration:const InputDecoration(labelText:'이메일')),
        const SizedBox(height:10),TextField(controller:password,enabled:!_authBusy,obscureText:true,decoration:const InputDecoration(labelText:'비밀번호')),
        const SizedBox(height:14),FilledButton(onPressed:_authConfigured&&!_authBusy?()=>_authenticateEmail(email.text,password.text,create:false):null,child:Text(_authBusy?'처리 중…':'로그인')),
        const SizedBox(height:6),OutlinedButton(onPressed:_authConfigured&&!_authBusy?()=>_authenticateEmail(email.text,password.text,create:true):null,child:const Text('새 계정 만들기')),
        const SizedBox(height:8),Text(_authConfigured?'로그인 전에는 기기 데이터를 서버에 업로드하지 않아요.':'운영 인증 설정 연결 전에는 입력값을 전송하거나 저장하지 않아요.',style:const TextStyle(fontSize:12,color:KkokkapickTheme.muted)),
      ]),
    )));
    email.dispose();password.dispose();
  }

  Future<void> _deleteAppData() async {
    if(!_signedIn)return;
    final confirmed=await showDialog<bool>(context:context,builder:(context)=>AlertDialog(title:const Text('앱 데이터를 삭제할까요?'),content:const Text('계정의 아이 정보, 찜, 가격 알림과 이 기기에 저장된 같은 데이터를 삭제해요. 로그인 계정 자체는 삭제되지 않아요.'),actions:[TextButton(onPressed:()=>Navigator.pop(context,false),child:const Text('취소')),FilledButton(onPressed:()=>Navigator.pop(context,true),child:const Text('삭제'))]));
    if(confirmed!=true||!mounted)return;
    setState(()=>_authBusy=true);
    try{
      await _session.deleteAppData();
      if(!mounted)return;
      setState((){_favoriteIds=<String>{};_profile=null;});
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('앱 데이터를 삭제했어요.')));
    }catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('데이터를 삭제하지 못했어요. 기기 데이터는 유지돼요.')));}
    finally{if(mounted)setState(()=>_authBusy=false);}
  }

  Future<void> _deleteAccount() async {
    if(!_signedIn)return;
    final confirmed=await showDialog<bool>(context:context,builder:(context)=>AlertDialog(
      title:const Text('계정을 삭제할까요?'),
      content:const Text('아이 정보, 찜, 가격 알림과 로그인 계정을 모두 삭제해요. 삭제 후에는 되돌릴 수 없어요.'),
      actions:[TextButton(onPressed:()=>Navigator.pop(context,false),child:const Text('취소')),FilledButton(onPressed:()=>Navigator.pop(context,true),child:const Text('계정 삭제'))]));
    if(confirmed!=true||!mounted)return;
    setState(()=>_authBusy=true);
    try{
      await _session.deleteAccount();
      if(!mounted)return;
      setState((){_favoriteIds=<String>{};_profile=null;_sessionState=AppSessionState.guest;});
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('계정을 삭제했어요.')));
    }catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('계정을 삭제하지 못했어요. 계정과 기기 데이터는 유지돼요.')));}
    finally{if(mounted)setState(()=>_authBusy=false);}
  }

  Future<void> _showPrivacyData() async {
    await coordinatedModal<void>(context:context,coordinator:_overlays,builder:(context)=>SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
      Text('개인정보 및 데이터',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w800)),
      const SizedBox(height:8),const Text('아이 정보·찜·가격 알림은 현재 이 기기에 저장돼요.',style:TextStyle(color:KkokkapickTheme.muted)),
      const SizedBox(height:16),ListTile(contentPadding:EdgeInsets.zero,leading:const Icon(Icons.delete_outline),title:const Text('앱 데이터 삭제'),subtitle:Text(_signedIn?'아이 정보·찜·가격 알림을 계정과 이 기기에서 삭제해요.':'로그인 후 계정에 저장된 데이터까지 함께 삭제할 수 있어요.'),trailing:const Icon(Icons.chevron_right),enabled:_signedIn&&!_authBusy,onTap:_signedIn&&!_authBusy?(){Navigator.pop(context);_deleteAppData();}:null),
      ListTile(contentPadding:EdgeInsets.zero,leading:const Icon(Icons.person_off_outlined),title:const Text('계정 삭제'),subtitle:Text(_signedIn?'로그인 계정과 연결된 앱 데이터를 모두 삭제해요.':'로그인 후 계정을 삭제할 수 있어요.'),trailing:const Icon(Icons.chevron_right),enabled:_signedIn&&!_authBusy,onTap:_signedIn&&!_authBusy?(){Navigator.pop(context);_deleteAccount();}:null),
    ]))));
  }

  Future<void> _showManagedPopup(ManagedPopup popup) async {
    if(!mounted)return;
    if(!_overlays.begin(OverlayKind.managedPopup))return;
    try{await showDialog<void>(context:context,builder:(context)=>AlertDialog(title:Text(popup.title),content:Text(popup.body??''),actions:[TextButton(onPressed:()async{await _popupPrefs.dismiss(popup);if(context.mounted)Navigator.pop(context);},child:const Text('닫기'))]));}finally{_overlays.end(OverlayKind.managedPopup);}
    _managedPopup=null;
  }

  Future<void> _openCampaign(CommercialCampaign campaign) async {
    final raw=campaign.destinationUrl;if(raw==null)return;final uri=Uri.tryParse(raw);
    if(uri==null||(uri.scheme!='https'&&uri.scheme!='http'))return;
    await _attribution.click(campaignId:campaign.id);
    final opened=await launchUrl(uri,mode:LaunchMode.externalApplication);
    if(!opened&&mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('링크를 열지 못했어요. 잠시 후 다시 시도해 주세요.')));
  }

  @override Widget build(BuildContext context){
    final stages=['전체','신생아','베이비','유아','토들러','키즈'];
    final categories=_values((p)=>p.category),brands=_availableBrands;
    final items=_visible;
    return Scaffold(
      floatingActionButton:_navIndex==1?FloatingActionButton.extended(onPressed:_showFilters,icon:const Icon(Icons.tune),label:const Text('필터')):null,
      bottomNavigationBar:NavigationBar(selectedIndex:_navIndex,onDestinationSelected:(i)=>setState((){_navIndex=i;if(i==0||i==1)_favoritesOnly=false;if(i==2)_favoritesOnly=true;}),destinations:const [NavigationDestination(icon:Icon(Icons.home_outlined),selectedIcon:Icon(Icons.home),label:'홈'),NavigationDestination(icon:Icon(Icons.search),label:'찾기'),NavigationDestination(icon:Icon(Icons.favorite_border),selectedIcon:Icon(Icons.favorite),label:'찜'),NavigationDestination(icon:Icon(Icons.person_outline),selectedIcon:Icon(Icons.person),label:'마이')]),
      appBar:AppBar(title:const KkokkapickBrandMark(compact:true),actions:[IconButton(tooltip:'아이 정보',onPressed:_editProfile,icon:Icon(_profile==null?Icons.child_care_outlined:Icons.child_care)),IconButton(onPressed:()=>setState(()=>_favoritesOnly=!_favoritesOnly),icon:Icon(_favoritesOnly?Icons.favorite:Icons.favorite_border))]),
      body:_navIndex==3?_MyPage(profile:_profile,sessionState:_sessionState,onEditProfile:_editProfile,onAccountSync:_showAccountSyncInfo,onPrivacyData:_showPrivacyData,onSignOut:_signedIn?_signOut:null):_loading?const KkokkapickLaunchSurface():_error!=null?_ErrorView(onRetry:_load):RefreshIndicator(onRefresh:_load,child:CustomScrollView(slivers:[
        if(_campaigns.isNotEmpty&&_navIndex==0)SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,12,16,0),child:_SponsoredSection(campaigns:_campaigns.take(3).toList(),onTap:_openCampaign))),
        SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.all(16),child:Column(children:[
          if(_navIndex==0)...[
            _HomeIntro(profile:_profile,onProfile:onEditProfileProxy),
            const SizedBox(height:16),
            _CategoryShortcuts(categories:categories,onSelected:(v)=>setState((){_category=v;_navIndex=1;})),
            const SizedBox(height:16),
            const ServiceGuideStrip(),
            if(_products.any((p)=>p.fitStatus=='verified'))...[
              const SizedBox(height:16),
              _KkokkafitTryCard(count:_products.where((p)=>p.fitStatus=='verified').length,profile:_profile,onProfile:_editProfile,onShowProducts:_showKkokkafitProducts),
            ],
            if(items.isNotEmpty)...[const SizedBox(height:20),SwipePickDeck(products:items.take(8).toList(),favoriteIds:_favoriteIds,onFavorite:(id)=>_toggleFavorite(id),onTap:(p)=>coordinatedModal(context:context,coordinator:_overlays,builder:(_)=>_ProductDetail(p,profile:_profile,onPriceAlertChanged:_signedIn?(productId,target)=>_session.setPriceAlert(productId,target):null)))],
            const SizedBox(height:16),
          ],
          TextField(controller:_search,onChanged:(_)=>setState((){}),decoration:const InputDecoration(prefixIcon:Icon(Icons.search),hintText:'브랜드, 상품을 검색해보세요',filled:true,border:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.all(Radius.circular(16))))),
          const SizedBox(height:12),
          if(_navIndex==1)...[
          _FilterRow(values:stages,value:_stage,onChanged:(v)=>setState(()=>_stage=v)),
          _FilterRow(values:categories,value:_category,onChanged:(v)=>setState(()=>_category=v)),
          _FilterRow(values:brands,value:_brand,onChanged:(v)=>setState(()=>_brand=v)),
          Row(children:[FilterChip(label:const Text('꼬까핏 가능'),selected:_fitOnly,onSelected:(v)=>setState(()=>_fitOnly=v)),const Spacer(),DropdownButton<CatalogSort>(value:_sort,underline:const SizedBox(),items:const [DropdownMenuItem(value:CatalogSort.recommended,child:Text('추천순')),DropdownMenuItem(value:CatalogSort.low,child:Text('낮은 가격순')),DropdownMenuItem(value:CatalogSort.high,child:Text('높은 가격순'))],onChanged:(v)=>setState(()=>_sort=v!))]),
          Row(children:[Text('${items.length}개',style:Theme.of(context).textTheme.titleMedium),const Spacer(),TextButton(onPressed:_reset,child:const Text('필터 초기화'))])],
        ]))),
        if(items.isEmpty)SliverFillRemaining(child:_EmptyCatalogView(onReset:_reset,favoritesOnly:_favoritesOnly))
        else SliverPadding(
          padding:const EdgeInsets.fromLTRB(16,0,16,24),
          sliver:SliverLayoutBuilder(builder:(context,constraints){
            final columns=constraints.crossAxisExtent>=900?4:constraints.crossAxisExtent>=600?3:2;
            return SliverGrid.builder(
              gridDelegate:SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:columns,crossAxisSpacing:12,mainAxisSpacing:18,mainAxisExtent:330),
              itemCount:items.length,
              itemBuilder:(context,i)=>_ProductCard(
                product:items[i],
                favorite:_favoriteIds.contains(items[i].id),
                onFavorite:()=>_toggleFavorite(items[i].id),
                onTap:()=>coordinatedModal(
                  context:context,
                  coordinator:_overlays,
                  builder:(_)=>_ProductDetail(items[i],profile:_profile,onPriceAlertChanged:_signedIn?(productId,target)=>_session.setPriceAlert(productId,target):null),
                ),
              ),
            );
          }),
        )
      ])),
    );
  }
}

class _FilterRow extends StatelessWidget{
  const _FilterRow({required this.values,required this.value,required this.onChanged});
  final List<String> values;final String value;final ValueChanged<String> onChanged;
  @override Widget build(BuildContext context)=>SizedBox(height:46,child:ListView.separated(scrollDirection:Axis.horizontal,itemCount:values.length,separatorBuilder:(_,__)=>const SizedBox(width:6),itemBuilder:(_,i)=>ChoiceChip(label:Text(values[i]),selected:values[i]==value,onSelected:(_)=>onChanged(values[i]))));
}

class _ProductCard extends StatelessWidget{
  const _ProductCard({required this.product,required this.favorite,required this.onFavorite,required this.onTap});
  final CatalogProduct product;final bool favorite;final VoidCallback onFavorite,onTap;
  String _won(int? n)=>n==null?'가격 확인':'${n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'),(m)=>',')}원';
  @override Widget build(BuildContext context)=>InkWell(onTap:onTap,borderRadius:BorderRadius.circular(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    Expanded(child:Stack(fit:StackFit.expand,children:[ClipRRect(borderRadius:BorderRadius.circular(16),child:ProductImage(url:product.imageUrl)),Positioned(right:6,top:6,child:IconButton.filledTonal(onPressed:onFavorite,icon:Icon(favorite?Icons.favorite:Icons.favorite_border),visualDensity:VisualDensity.compact))])),
    const SizedBox(height:7),if(product.brand!=null)Text(product.brand!,style:const TextStyle(fontSize:12,fontWeight:FontWeight.bold)),Text(product.name,maxLines:2,overflow:TextOverflow.ellipsis),const SizedBox(height:3),Text(_won(product.minPrice),style:const TextStyle(fontWeight:FontWeight.w800)),Row(children:[Flexible(child:MerchantMark(name:product.merchant)),if(product.offerCount>1)...[const SizedBox(width:5),Text('${product.offerCount}개 판매처',style:Theme.of(context).textTheme.bodySmall)]]),if(product.fitStatus=='verified')const Padding(padding:EdgeInsets.only(top:4),child:Chip(label:Text('꼬까핏 가능',style:TextStyle(fontSize:10)),visualDensity:VisualDensity.compact))
  ]));
}

class _ProductDetail extends StatefulWidget{
  const _ProductDetail(this.product,{required this.profile,this.onPriceAlertChanged});final CatalogProduct product;final ChildProfile? profile;final Future<void> Function(String,int?)? onPriceAlertChanged;
  @override State<_ProductDetail> createState()=>_ProductDetailState();
}
class _ProductDetailState extends State<_ProductDetail>{
  final _alerts=PriceAlertRepository(); final _fit=KkokkafitEngine(); int? _target;
  CatalogProduct get product=>widget.product;
  @override void initState(){super.initState();_alerts.get(product.id).then((v){if(mounted)setState(()=>_target=v);});}
  String _won(int? n)=>n==null?'가격 확인':'${n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'),(m)=>',')}원';
  @override Widget build(BuildContext context){final offers=[...product.offers]..sort((a,b)=>(a.price??1<<62).compareTo(b.price??1<<62));return SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:ListView(shrinkWrap:true,children:[
    ClipRRect(borderRadius:BorderRadius.circular(18),child:AspectRatio(aspectRatio:1.4,child:ProductImage(url:product.imageUrl))),
    const SizedBox(height:14),if(product.brand!=null)Text(product.brand!,style:const TextStyle(fontWeight:FontWeight.bold)),Text(product.name,style:Theme.of(context).textTheme.titleLarge),const SizedBox(height:8),Text('${product.category} · ${product.stage??'월령 확인'}'),
    const SizedBox(height:18),Text('꼬까핏',style:Theme.of(context).textTheme.titleMedium),Builder(builder:(_){final r=_fit.evaluate(widget.profile,product);return Text(r.status=='recommended'?r.label:r.label);}),
    const SizedBox(height:18),_ProductSizeSection(product:product),
    const SizedBox(height:18),Text('가격 알림',style:Theme.of(context).textTheme.titleMedium),ListTile(contentPadding:EdgeInsets.zero,title:Text(_target==null?'희망 가격을 설정해보세요':'희망 가격 ${_won(_target)}'),subtitle:_target!=null&&product.minPrice!=null&&product.minPrice!<=_target!?const Text('희망가에 도달했어요'):null,trailing:TextButton(onPressed:_editAlert,child:const Text('설정'))),const SizedBox(height:18),Text('판매처 가격 비교',style:Theme.of(context).textTheme.titleMedium),
    ...offers.asMap().entries.map((e)=>ListTile(onTap:()=>_openOffer(e.value),contentPadding:EdgeInsets.zero,title:Text(e.value.merchant),subtitle:e.value.originalPrice!=null&&e.value.originalPrice!>(e.value.price??0)?Text('정가 ${_won(e.value.originalPrice)}'):null,trailing:Column(mainAxisAlignment:MainAxisAlignment.center,crossAxisAlignment:CrossAxisAlignment.end,children:[Text(_won(e.value.price),style:const TextStyle(fontWeight:FontWeight.bold)),if(e.key==0&&offers.length>1)const Text('최저가',style:TextStyle(fontSize:11)),const Text('구매하기 ›',style:TextStyle(fontSize:11))]))),
    const SizedBox(height:8),const Text('가격·옵션·배송정보는 판매처에서 최종 확인하세요. 구매하기는 제휴 추적 링크를 외부 브라우저에서 엽니다.',style:TextStyle(fontSize:11))
  ])));}
  Future<void> _openOffer(ProductOffer offer) async {final uri=Uri.tryParse(offer.affiliateUrl);if(uri==null||(uri.scheme!='https'&&uri.scheme!='http')){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('구매 링크를 확인할 수 없어요.')));return;}final opened=await launchUrl(uri,mode:LaunchMode.externalApplication);if(!opened&&mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('판매처를 열지 못했어요. 잠시 후 다시 시도해 주세요.')));}
  Future<void> _editAlert() async {final c=TextEditingController(text:_target?.toString()??'');final v=await showDialog<int?>(context:context,builder:(context)=>AlertDialog(title:const Text('희망 가격'),content:TextField(controller:c,keyboardType:TextInputType.number,decoration:const InputDecoration(suffixText:'원')),actions:[TextButton(onPressed:()=>Navigator.pop(context,0),child:const Text('삭제')),FilledButton(onPressed:()=>Navigator.pop(context,int.tryParse(c.text)),child:const Text('저장'))]));c.dispose();if(v!=null){final target=v>0?v:null;await _alerts.set(product.id,target);if(mounted)setState(()=>_target=target);final sync=widget.onPriceAlertChanged;if(sync!=null){try{await sync(product.id,target);}catch(_){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('가격 알림은 기기에 저장했어요. 계정 동기화는 나중에 다시 시도할게요.')));}}}}
}


class _KkokkafitTryCard extends StatelessWidget {
  const _KkokkafitTryCard({required this.count,required this.profile,required this.onProfile,required this.onShowProducts});
  final int count; final ChildProfile? profile; final VoidCallback onProfile,onShowProducts;
  @override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(16),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    Row(children:[const Icon(Icons.straighten),const SizedBox(width:8),Expanded(child:Text('꼬까핏 바로 테스트',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w800)))]),
    const SizedBox(height:6),Text('공식 사이즈표가 확인된 상품 $count개가 있어요. ${profile==null?'아이 정보를 등록한 뒤 추천 사이즈를 확인해 보세요.':'현재 아이 정보로 추천 사이즈를 확인할 수 있어요.'}',style:const TextStyle(color:KkokkapickTheme.muted)),
    const SizedBox(height:12),Wrap(spacing:8,runSpacing:8,children:[
      if(profile==null)OutlinedButton(onPressed:onProfile,child:const Text('아이 정보 등록')),
      FilledButton.tonal(onPressed:onShowProducts,child:const Text('테스트 상품 보기')),
    ])
  ])));
}

class _ProductSizeSection extends StatelessWidget {
  const _ProductSizeSection({required this.product});
  final CatalogProduct product;
  String _rowLabel(BrandSizeRow row) {
    final parts=<String>[];
    if(row.months!=null&&row.months!.isNotEmpty) parts.add(row.months!.length>1?'${row.months!.first}~${row.months!.last}개월':'${row.months!.first}개월');
    if(row.heightCm!=null) parts.add('키 ${row.heightCm!.toStringAsFixed(row.heightCm!%1==0?0:1)}cm');
    if(row.weightKg!=null) parts.add('${row.weightKg!.toStringAsFixed(row.weightKg!%1==0?0:1)}kg');
    return parts.join(' · ');
  }
  @override Widget build(BuildContext context) {
    final guide=product.sizeGuide;
    return Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Text('사이즈 정보',style:Theme.of(context).textTheme.titleMedium),const SizedBox(height:8),
      if(product.availableSizes.isNotEmpty)...[
        const Text('이 상품에서 확인된 사이즈',style:TextStyle(fontWeight:FontWeight.w700)),const SizedBox(height:6),
        Wrap(spacing:6,runSpacing:6,children:product.availableSizes.map((s)=>Chip(label:Text(s))).toList()),const SizedBox(height:10),
      ],
      if(guide!=null&&guide.rows.isNotEmpty)...[
        Text('${product.brand??'브랜드'} 공식 사이즈 가이드',style:const TextStyle(fontWeight:FontWeight.w700)),const SizedBox(height:6),
        ...guide.rows.map((row)=>Padding(padding:const EdgeInsets.only(bottom:4),child:Row(children:[
          SizedBox(width:54,child:Text(row.size,style:const TextStyle(fontWeight:FontWeight.w800))),
          Expanded(child:Text(_rowLabel(row).isEmpty?'공식 표 참고':_rowLabel(row),style:Theme.of(context).textTheme.bodySmall)),
        ]))),
        const SizedBox(height:4),const Text('브랜드 공통 가이드이며 실제 상품의 재고·옵션과 다를 수 있어요.',style:TextStyle(fontSize:11,color:KkokkapickTheme.muted)),
      ] else if(product.availableSizes.isEmpty)
        const Text('제공된 상품 데이터에 사이즈 옵션이 없어요. 실제 선택 가능한 사이즈와 재고는 판매처에서 확인해 주세요.',style:TextStyle(color:KkokkapickTheme.muted)),
    ]);
  }
}

class _ErrorView extends StatelessWidget{
  const _ErrorView({required this.onRetry});final VoidCallback onRetry;
  @override Widget build(BuildContext context)=>Center(child:Column(mainAxisSize:MainAxisSize.min,children:[const Text('상품 정보를 불러오지 못했어요.'),const SizedBox(height:8),FilledButton(onPressed:onRetry,child:const Text('다시 시도'))]));
}


class _MyPage extends StatelessWidget{
  const _MyPage({required this.profile,required this.sessionState,required this.onEditProfile,required this.onAccountSync,required this.onPrivacyData,required this.onSignOut});
  final ChildProfile? profile; final AppSessionState sessionState;
  final VoidCallback onEditProfile,onAccountSync,onPrivacyData; final VoidCallback? onSignOut;
  @override Widget build(BuildContext context)=>SafeArea(child:ListView(padding:const EdgeInsets.fromLTRB(20,20,20,32),children:[
    Text('마이',style:Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight:FontWeight.w800)),
    const SizedBox(height:6),const Text('아이 정보와 꼬까픽 이용 설정을 관리해요.',style:TextStyle(color:KkokkapickTheme.muted)),
    const SizedBox(height:22),
    Card(child:ListTile(contentPadding:const EdgeInsets.symmetric(horizontal:16,vertical:8),leading:const CircleAvatar(child:Icon(Icons.child_care)),title:Text(profile==null?'아이 정보를 등록해 주세요':'${profile!.months}개월 · ${profile!.stage}'),subtitle:Text(profile==null?'꼬까핏과 월령별 탐색에 사용돼요':'키 ${profile!.heightCm.toStringAsFixed(1)}cm · 몸무게 ${profile!.weightKg.toStringAsFixed(1)}kg'),trailing:const Icon(Icons.chevron_right),onTap:onEditProfile)),
    const SizedBox(height:18),Text('계정과 동기화',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w800)),
    const SizedBox(height:6),Card(child:ListTile(leading:Icon(sessionState==AppSessionState.authenticated||sessionState==AppSessionState.offlineAuthenticated?Icons.cloud_done_outlined:Icons.cloud_outlined),title:Text(sessionState==AppSessionState.restoring?'로그인 상태 확인 중':sessionState==AppSessionState.authenticated?'계정 동기화 사용 중':sessionState==AppSessionState.offlineAuthenticated?'로그인됨 · 연결 확인 필요':'현재 이 기기에 저장 중'),subtitle:Text(sessionState==AppSessionState.guest?'로그인 없이도 둘러보기와 찜을 사용할 수 있어요.':'기기 데이터는 명시적으로 동의한 경우에만 동기화해요.'),trailing:const Icon(Icons.chevron_right),onTap:onAccountSync)),
    if(onSignOut!=null)Align(alignment:Alignment.centerRight,child:TextButton(onPressed:onSignOut,child:const Text('로그아웃'))),
    const SizedBox(height:18),Text('설정',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w800)),
    Card(child:Column(children:[
      const ListTile(leading:Icon(Icons.notifications_none),title:Text('가격 알림'),subtitle:Text('로그인 후 여러 기기에서 알림을 받을 수 있어요.'),trailing:Icon(Icons.chevron_right)),
      const Divider(height:1,indent:56),
      ListTile(leading:const Icon(Icons.shield_outlined),title:const Text('개인정보 및 데이터'),subtitle:const Text('저장 데이터와 삭제 기능을 관리해요.'),trailing:const Icon(Icons.chevron_right),onTap:onPrivacyData),
      Divider(height:1,indent:56),
      ListTile(leading:Icon(Icons.help_outline),title:Text('도움말 및 문의'),trailing:Icon(Icons.chevron_right)),
    ])),
    const SizedBox(height:16),const Text('아이 정보는 맞춤 탐색과 꼬까핏에만 사용하며 광고 타기팅 정보로 전달하지 않아요.',style:TextStyle(fontSize:12,color:KkokkapickTheme.muted)),
  ]));
}


class _HomeIntro extends StatelessWidget{
  const _HomeIntro({required this.profile,required this.onProfile});
  final ChildProfile? profile; final VoidCallback onProfile;
  @override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.all(18),decoration:BoxDecoration(color:KkokkapickTheme.fit,borderRadius:BorderRadius.circular(18)),child:Row(children:[Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(profile==null?'우리 아이에게 맞는 옷을 찾아볼까요?':'${profile!.months}개월 · ${profile!.stage} 추천',style:const TextStyle(fontSize:17,fontWeight:FontWeight.w800)),const SizedBox(height:5),Text(profile==null?'아이 정보를 등록하면 월령과 꼬까핏 기준으로 탐색할 수 있어요.':'아이 정보와 검증된 사이즈표를 기준으로 살펴보세요.',style:const TextStyle(color:KkokkapickTheme.muted))])),const SizedBox(width:10),TextButton(onPressed:onProfile,child:Text(profile==null?'등록':'수정'))]));
}
class _CategoryShortcuts extends StatelessWidget{
  const _CategoryShortcuts({required this.categories,required this.onSelected});
  final List<String> categories; final ValueChanged<String> onSelected;
  @override Widget build(BuildContext context){final values=categories.where((e)=>e!='전체').take(5).toList();return Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('카테고리로 찾기',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w800)),const SizedBox(height:10),Wrap(spacing:8,runSpacing:8,children:values.map((v)=>ActionChip(avatar:const Icon(Icons.checkroom_outlined,size:18),label:Text(v),onPressed:()=>onSelected(v))).toList())]);}
}


class _SponsoredSection extends StatelessWidget{
  const _SponsoredSection({required this.campaigns,required this.onTap});
  final List<CommercialCampaign> campaigns; final ValueChanged<CommercialCampaign> onTap;
  @override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:const Color(0xFFFFF8F5),borderRadius:BorderRadius.circular(18)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
    const Row(children:[Icon(Icons.campaign_outlined,size:18),SizedBox(width:6),Text('추천 프로모션',style:TextStyle(fontWeight:FontWeight.w800)),Spacer(),Text('광고',style:TextStyle(fontSize:11,color:KkokkapickTheme.muted))]),
    const SizedBox(height:8),
    ...campaigns.map((c)=>ListTile(contentPadding:EdgeInsets.zero,dense:true,onTap:()=>onTap(c),title:Text(c.title,maxLines:1,overflow:TextOverflow.ellipsis),subtitle:Text(c.partnerName??c.disclosureLabel),trailing:const Icon(Icons.chevron_right))),
  ]));
}
class _EmptyCatalogView extends StatelessWidget{
  const _EmptyCatalogView({required this.onReset,required this.favoritesOnly});
  final VoidCallback onReset; final bool favoritesOnly;
  @override Widget build(BuildContext context)=>Center(child:Padding(padding:const EdgeInsets.all(28),child:Column(mainAxisSize:MainAxisSize.min,children:[
    Icon(favoritesOnly?Icons.favorite_border:Icons.search_off,size:42,color:KkokkapickTheme.muted),
    const SizedBox(height:12),Text(favoritesOnly?'아직 찜한 상품이 없어요':'조건에 맞는 상품이 없어요',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w800)),
    const SizedBox(height:6),Text(favoritesOnly?'마음에 드는 옷의 하트를 눌러 모아보세요.':'필터를 조금 넓히면 더 많은 옷을 볼 수 있어요.',textAlign:TextAlign.center,style:const TextStyle(color:KkokkapickTheme.muted)),
    if(!favoritesOnly)...[const SizedBox(height:14),FilledButton.tonal(onPressed:onReset,child:const Text('필터 초기화'))],
  ])));
}
