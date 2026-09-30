import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/child_profile_repository.dart';
import 'repositories/favorites_repository.dart';
import 'repositories/price_alert_repository.dart';
import 'services/home_feed_ranking.dart';
import 'services/kkokkafit_engine.dart';
import 'theme/kkokkapick_theme.dart';
import 'widgets/brand_identity.dart';
import 'widgets/discovery_experience.dart';
import 'widgets/v9_commerce.dart';

void runReleaseAppV9()=>runApp(const KkokkapickReleaseAppV9());

class KkokkapickReleaseAppV9 extends StatelessWidget {
  const KkokkapickReleaseAppV9({super.key});
  @override Widget build(BuildContext context)=>MaterialApp(
    title:'꼬까픽',debugShowCheckedModeBanner:false,theme:KkokkapickTheme.light(),home:const V9ReleaseShell(),
  );
}

enum V9Sort{recommended,low,high}

class V9ReleaseShell extends StatefulWidget {
  const V9ReleaseShell({super.key});
  @override State<V9ReleaseShell> createState()=>_V9ReleaseShellState();
}

class _V9ReleaseShellState extends State<V9ReleaseShell>{
  static final _demoEndpoint=Uri.parse('https://chachazip-prog.github.io/kkokkapick/data/catalog.json');
  static const _supabaseUrl=String.fromEnvironment('SUPABASE_URL');
  static const _supabaseAnonKey=String.fromEnvironment('SUPABASE_ANON_KEY');
  final _catalog=CatalogRepository();
  final _favorites=FavoritesRepository();
  final _profiles=ChildProfileRepository();
  final _alerts=PriceAlertRepository();
  final _ranking=const HomeFeedRankingService();
  final _search=TextEditingController();
  List<CatalogProduct> _products=const[];
  Set<String> _favoriteIds=<String>{};
  Map<String,int> _priceDropBaselines=<String,int>{};
  ChildProfile? _profile;
  String _category='전체';
  V9Sort _sort=V9Sort.recommended;
  int _tab=0;
  bool _loading=true;
  Object? _error;

  @override void initState(){super.initState();_load();}
  @override void dispose(){_search.dispose();super.dispose();}

  Future<void> _load()async{
    setState((){_loading=true;_error=null;});
    try{
      final catalogFuture=_supabaseUrl.isNotEmpty&&_supabaseAnonKey.isNotEmpty
          ?_catalog.fetchSupabase(supabaseUrl:_supabaseUrl,anonKey:_supabaseAnonKey)
          :_catalog.fetchCatalog(_demoEndpoint);
      final values=await Future.wait<Object?>([catalogFuture,_favorites.load(),_profiles.load(),_alerts.loadAll()]);
      if(!mounted)return;
      final dedup=<String,CatalogProduct>{};
      for(final p in values[0] as List<CatalogProduct>){
        if(p.id.trim().isEmpty)continue;
        final old=dedup[p.id];
        if(old==null||p.offers.length>old.offers.length||p.galleryUrls.length>old.galleryUrls.length)dedup[p.id]=p;
      }
      setState((){
        _products=dedup.values.toList();_favoriteIds=values[1] as Set<String>;_profile=values[2] as ChildProfile?;
        _priceDropBaselines=values[3] as Map<String,int>;_loading=false;
      });
    }catch(e){if(mounted)setState((){_error=e;_loading=false;});}
  }

  List<String> get _categories{
    final values=<String>{for(final p in _products)if(p.category.trim().isNotEmpty)p.category}.toList()..sort();
    return ['전체',...values];
  }
  HomeFeedSignals get _signals=>HomeFeedSignals(profile:_profile,favoriteProductIds:_favoriteIds,priceAlertProductIds:_priceDropBaselines.keys.toSet());
  RankedHomeFeed get _personalized=>_ranking.rankPersonalized(_products,_signals,limit:10);
  RankedHomeFeed get _discovery=>_ranking.rankTrending(_products,limit:18);

  List<CatalogProduct> get _searchResults{
    final terms=_search.text.trim().toLowerCase().split(RegExp(r'\s+')).where((e)=>e.isNotEmpty).toList();
    final out=_products.where((p){
      final hay='${p.displayName} ${p.brand??''} ${p.category} ${p.stage??''} ${p.specs.material??''}'.toLowerCase();
      return (_category=='전체'||p.category==_category)&&terms.every(hay.contains);
    }).toList();
    switch(_sort){
      case V9Sort.low:out.sort((a,b)=>(a.minPrice??1<<62).compareTo(b.minPrice??1<<62));break;
      case V9Sort.high:out.sort((a,b)=>(b.minPrice??0).compareTo(a.minPrice??0));break;
      case V9Sort.recommended:return _ranking.rankPersonalized(out,_signals,limit:out.length).items;
    }
    return out;
  }

  Future<void> _toggleFavorite(CatalogProduct p)async{setState((){if(!_favoriteIds.add(p.id))_favoriteIds.remove(p.id);});await _favorites.save(_favoriteIds);}
  Future<void> _togglePriceDrop(CatalogProduct p)async{
    final enable=!_priceDropBaselines.containsKey(p.id);final baseline=(p.minPrice??0)>0?p.minPrice!:1;
    await _alerts.set(p.id,enable?baseline:null);if(!mounted)return;
    setState((){if(enable){_priceDropBaselines[p.id]=baseline;}else{_priceDropBaselines.remove(p.id);}});
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(enable?'가격이 내려가면 알려드릴게요.':'가격 다운 알림을 껐어요.')));
  }

  Future<void> _editProfile()async{
    final m=TextEditingController(text:_profile?.months.toString()??'');
    final h=TextEditingController(text:_profile?.heightCm.toString()??'');
    final w=TextEditingController(text:_profile?.weightKg.toString()??'');
    final saved=await showModalBottomSheet<ChildProfile>(context:context,isScrollControlled:true,backgroundColor:Colors.white,showDragHandle:true,builder:(context)=>SafeArea(top:false,child:SingleChildScrollView(
      padding:EdgeInsets.fromLTRB(20,0,20,MediaQuery.viewInsetsOf(context).bottom+20),child:Column(mainAxisSize:MainAxisSize.min,crossAxisAlignment:CrossAxisAlignment.stretch,children:[
        Text('우리 아이 정보를 알려주세요',style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w900)),
        const SizedBox(height:6),const Text('월령과 성장 정보를 바탕으로 더 잘 맞는 상품을 추천해요.',style:TextStyle(color:KkokkapickTheme.muted)),
        const SizedBox(height:18),TextField(controller:m,keyboardType:TextInputType.number,decoration:const InputDecoration(labelText:'월령')),
        const SizedBox(height:10),TextField(controller:h,keyboardType:const TextInputType.numberWithOptions(decimal:true),decoration:const InputDecoration(labelText:'키',suffixText:'cm')),
        const SizedBox(height:10),TextField(controller:w,keyboardType:const TextInputType.numberWithOptions(decimal:true),decoration:const InputDecoration(labelText:'몸무게',suffixText:'kg')),
        const SizedBox(height:18),FilledButton(onPressed:(){final p=ChildProfile(months:int.tryParse(m.text)??0,heightCm:double.tryParse(h.text)??0,weightKg:double.tryParse(w.text)??0);if(p.months>0&&p.heightCm>0&&p.weightKg>0)Navigator.pop(context,p);},child:const Text('완료하기')),
      ]),
    )));
    m.dispose();h.dispose();w.dispose();if(saved!=null){await _profiles.save(saved);if(mounted)setState(()=>_profile=saved);}
  }

  Future<void> _showProduct(CatalogProduct p)async=>showModalBottomSheet<void>(context:context,isScrollControlled:true,useSafeArea:true,backgroundColor:Colors.white,builder:(context)=>V9ProductDetailSheet(
    product:p,profile:_profile,favorite:_favoriteIds.contains(p.id),alertEnabled:_priceDropBaselines.containsKey(p.id),onFavorite:()=>_toggleFavorite(p),onAlert:()=>_togglePriceDrop(p),
  ));

  Future<void> _showCategory(String category)async{
    await Navigator.of(context).push(MaterialPageRoute<void>(fullscreenDialog:true,builder:(context)=>V9CategoryPage(
      title:category,products:_products.where((p)=>p.category==category).toList(),favorites:_favoriteIds,alerts:_priceDropBaselines.keys.toSet(),onFavorite:_toggleFavorite,onAlert:_togglePriceDrop,onProduct:_showProduct,
    )));if(mounted)setState((){});
  }
  void _openSearch()=>setState(()=>_tab=1);

  @override Widget build(BuildContext context){
    if(_loading)return const KkokkapickLaunchSurface();
    if(_error!=null)return Scaffold(body:SafeArea(child:Center(child:Column(mainAxisSize:MainAxisSize.min,children:[const Icon(Icons.cloud_off_outlined,size:42),const SizedBox(height:12),const Text('상품 정보를 불러오지 못했어요.'),const SizedBox(height:16),FilledButton(onPressed:_load,child:const Text('다시 시도'))]))));
    final pages=<Widget>[
      V9HomePage(products:_products,categories:_categories.where((e)=>e!='전체').take(8).toList(),profile:_profile,personalized:_personalized,discovery:_discovery,favorites:_favoriteIds,alerts:_priceDropBaselines.keys.toSet(),onSearch:_openSearch,onCategory:_showCategory,onProfile:_editProfile,onFavorite:_toggleFavorite,onAlert:_togglePriceDrop,onProduct:_showProduct),
      V9SearchPage(controller:_search,categories:_categories,category:_category,sort:_sort,products:_searchResults,favorites:_favoriteIds,alerts:_priceDropBaselines.keys.toSet(),onChanged:()=>setState((){}),onCategory:(v)=>setState(()=>_category=v),onSort:(v)=>setState(()=>_sort=v),onFavorite:_toggleFavorite,onAlert:_togglePriceDrop,onProduct:_showProduct),
      V9FavoritesPage(products:_products.where((p)=>_favoriteIds.contains(p.id)).toList(),favorites:_favoriteIds,alerts:_priceDropBaselines.keys.toSet(),onFavorite:_toggleFavorite,onAlert:_togglePriceDrop,onProduct:_showProduct,onExplore:_openSearch),
      V9MyPage(profile:_profile,favoriteCount:_favoriteIds.length,alertCount:_priceDropBaselines.length,onEditProfile:_editProfile,onFavorites:()=>setState(()=>_tab=2),onSearch:_openSearch),
    ];
    return Scaffold(body:IndexedStack(index:_tab,children:pages),bottomNavigationBar:NavigationBar(selectedIndex:_tab,onDestinationSelected:(i)=>setState(()=>_tab=i),destinations:const[
      NavigationDestination(icon:Icon(Icons.home_outlined),selectedIcon:Icon(Icons.home_rounded),label:'홈'),NavigationDestination(icon:Icon(Icons.search_rounded),label:'검색'),NavigationDestination(icon:Icon(Icons.favorite_border_rounded),selectedIcon:Icon(Icons.favorite_rounded),label:'찜'),NavigationDestination(icon:Icon(Icons.person_outline_rounded),selectedIcon:Icon(Icons.person_rounded),label:'마이'),
    ]));
  }
}

class V9HomePage extends StatelessWidget{
  const V9HomePage({super.key,required this.products,required this.categories,required this.profile,required this.personalized,required this.discovery,required this.favorites,required this.alerts,required this.onSearch,required this.onCategory,required this.onProfile,required this.onFavorite,required this.onAlert,required this.onProduct});
  final List<CatalogProduct> products;
  final List<String> categories;
  final ChildProfile? profile;final RankedHomeFeed personalized,discovery;final Set<String> favorites,alerts;
  final VoidCallback onSearch,onProfile;final ValueChanged<String> onCategory;final ValueChanged<CatalogProduct> onFavorite,onAlert,onProduct;
  @override Widget build(BuildContext context)=>SafeArea(bottom:false,child:CustomScrollView(slivers:[
    SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,12,16,0),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Row(children:[const KkokkapickBrandMark(compact:true),const Spacer(),IconButton(tooltip:'알림',onPressed:(){},icon:const Icon(Icons.notifications_none_rounded)),IconButton(tooltip:'찜',onPressed:(){},icon:const Icon(Icons.shopping_bag_outlined))]),
      const SizedBox(height:10),InkWell(onTap:onSearch,borderRadius:BorderRadius.circular(14),child:Container(height:48,padding:const EdgeInsets.symmetric(horizontal:14),decoration:BoxDecoration(color:KkokkapickTheme.surface,borderRadius:BorderRadius.circular(14)),child:const Row(children:[Icon(Icons.search_rounded,size:21),SizedBox(width:10),Expanded(child:Text('우리 아이를 위한 상품을 검색해보세요',style:TextStyle(color:KkokkapickTheme.muted),maxLines:1,overflow:TextOverflow.ellipsis)),Icon(Icons.center_focus_weak_rounded,size:19,color:KkokkapickTheme.muted)]))),
      const SizedBox(height:12),V9HeroBanner(product:discovery.items.isEmpty?null:discovery.items.first,onTap:onSearch),const SizedBox(height:14),V9CategoryStrip(categories:categories,onSelected:onCategory),
      const SizedBox(height:24),_V9SectionHeader(title:profile==null?'지금, 우리 아이에게 추천해요':'${profile!.months}개월 아이에게 추천해요',action:profile==null?'아이 정보 입력':'정보 수정',onAction:onProfile),const SizedBox(height:10),V9EditorialStrip(products:personalized.items,onTap:onProduct),
      const SizedBox(height:26),_V9SectionHeader(title:discovery.supportsPopularityClaim?'지금 많이 보는 상품':'지금 둘러볼 상품',action:'더보기',onAction:onSearch),const SizedBox(height:10),
    ]))),
    V9ProductGridSliver(products:discovery.items.take(8).toList(),favorites:favorites,alerts:alerts,onFavorite:onFavorite,onAlert:onAlert,onProduct:onProduct,bottomPadding:20),
    SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,8,16,96),child:Container(padding:const EdgeInsets.all(18),decoration:BoxDecoration(borderRadius:BorderRadius.circular(20),gradient:const LinearGradient(colors:[Color(0xFFF3EFE9),Color(0xFFEFE9E2)])),child:Row(children:[Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[const Text('꼬까픽이 제안하는 이번 주 스타일',style:TextStyle(fontWeight:FontWeight.w900,fontSize:16)),const SizedBox(height:5),const Text('같은 상품은 모아 보고, 판매처별 가격은 비교해보세요.',style:TextStyle(color:KkokkapickTheme.muted,fontSize:11,height:1.4)),TextButton(onPressed:onSearch,style:TextButton.styleFrom(padding:EdgeInsets.zero),child:const Text('상품 더 둘러보기  ›'))])),const Icon(Icons.auto_awesome_rounded,color:KkokkapickTheme.lavenderDeep,size:34)]))))),
  ]));
}

class V9SearchPage extends StatelessWidget{
  const V9SearchPage({super.key,required this.controller,required this.categories,required this.category,required this.sort,required this.products,required this.favorites,required this.alerts,required this.onChanged,required this.onCategory,required this.onSort,required this.onFavorite,required this.onAlert,required this.onProduct});
  final TextEditingController controller;final List<String> categories;final String category;final V9Sort sort;final List<CatalogProduct> products;final Set<String> favorites,alerts;final VoidCallback onChanged;final ValueChanged<String> onCategory;final ValueChanged<V9Sort> onSort;final ValueChanged<CatalogProduct> onFavorite,onAlert,onProduct;
  Future<void> _openSort(BuildContext context)async{final selected=await showModalBottomSheet<V9Sort>(context:context,showDragHandle:true,backgroundColor:Colors.white,builder:(context)=>SafeArea(top:false,child:Column(mainAxisSize:MainAxisSize.min,children:[for(final e in const[(V9Sort.recommended,'추천순'),(V9Sort.low,'낮은 가격순'),(V9Sort.high,'높은 가격순')])ListTile(leading:Icon(sort==e.$1?Icons.radio_button_checked:Icons.radio_button_off),title:Text(e.$2),onTap:()=>Navigator.pop(context,e.$1)),const SizedBox(height:12)])));if(selected!=null)onSort(selected);}
  @override Widget build(BuildContext context)=>SafeArea(bottom:false,child:CustomScrollView(slivers:[
    SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,14,16,10),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('검색',style:Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight:FontWeight.w900)),const SizedBox(height:14),TextField(controller:controller,onChanged:(_)=>onChanged(),decoration:const InputDecoration(prefixIcon:Icon(Icons.search_rounded),hintText:'상품명이나 브랜드를 검색해보세요',suffixIcon:Icon(Icons.tune_rounded))),const SizedBox(height:14),SizedBox(height:40,child:ListView.separated(scrollDirection:Axis.horizontal,itemCount:categories.length,separatorBuilder:(_,__)=>const SizedBox(width:8),itemBuilder:(context,i){final item=categories[i];return ChoiceChip(label:Text(item),selected:item==category,onSelected:(_)=>onCategory(item));})),const SizedBox(height:10),Row(children:[Text('총 ${products.length}개',style:const TextStyle(fontWeight:FontWeight.w800)),const Spacer(),TextButton.icon(onPressed:()=>_openSort(context),icon:const Icon(Icons.swap_vert_rounded,size:18),label:Text(switch(sort){V9Sort.recommended=>'추천순',V9Sort.low=>'낮은 가격순',V9Sort.high=>'높은 가격순'}))])]))),
    if(products.isEmpty)const SliverFillRemaining(hasScrollBody:false,child:_V9EmptyState(icon:Icons.search_off_rounded,title:'검색 결과가 없어요',body:'다른 검색어나 카테고리로 찾아보세요.'))else V9ProductGridSliver(products:products,favorites:favorites,alerts:alerts,onFavorite:onFavorite,onAlert:onAlert,onProduct:onProduct,bottomPadding:96),
  ]));
}

class V9CategoryPage extends StatefulWidget{
  const V9CategoryPage({super.key,required this.title,required this.products,required this.favorites,required this.alerts,required this.onFavorite,required this.onAlert,required this.onProduct});
  final String title;final List<CatalogProduct> products;final Set<String> favorites,alerts;final ValueChanged<CatalogProduct> onFavorite,onAlert,onProduct;
  @override State<V9CategoryPage> createState()=>_V9CategoryPageState();
}
class _V9CategoryPageState extends State<V9CategoryPage>{
  V9Sort sort=V9Sort.recommended;
  List<CatalogProduct> get sorted{final out=[...widget.products];if(sort==V9Sort.low)out.sort((a,b)=>(a.minPrice??1<<62).compareTo(b.minPrice??1<<62));if(sort==V9Sort.high)out.sort((a,b)=>(b.minPrice??0).compareTo(a.minPrice??0));return out;}
  @override Widget build(BuildContext context)=>Scaffold(appBar:AppBar(title:Text(widget.title,style:const TextStyle(fontWeight:FontWeight.w900)),leading:IconButton(onPressed:()=>Navigator.pop(context),icon:const Icon(Icons.close_rounded))),body:CustomScrollView(slivers:[SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,4,16,12),child:Row(children:[Text('${widget.products.length}개 상품',style:const TextStyle(color:KkokkapickTheme.muted)),const Spacer(),DropdownButtonHideUnderline(child:DropdownButton<V9Sort>(value:sort,items:const[DropdownMenuItem(value:V9Sort.recommended,child:Text('추천순')),DropdownMenuItem(value:V9Sort.low,child:Text('낮은 가격순')),DropdownMenuItem(value:V9Sort.high,child:Text('높은 가격순'))],onChanged:(v){if(v!=null)setState(()=>sort=v);} ))]))),V9ProductGridSliver(products:sorted,favorites:widget.favorites,alerts:widget.alerts,onFavorite:(p){widget.onFavorite(p);setState((){});},onAlert:(p){widget.onAlert(p);setState((){});},onProduct:widget.onProduct,bottomPadding:36)]));
}

class V9FavoritesPage extends StatelessWidget{
  const V9FavoritesPage({super.key,required this.products,required this.favorites,required this.alerts,required this.onFavorite,required this.onAlert,required this.onProduct,required this.onExplore});
  final List<CatalogProduct> products;final Set<String> favorites,alerts;final ValueChanged<CatalogProduct> onFavorite,onAlert,onProduct;final VoidCallback onExplore;
  @override Widget build(BuildContext context)=>SafeArea(bottom:false,child:CustomScrollView(slivers:[SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.fromLTRB(16,14,16,18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('찜',style:Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight:FontWeight.w900)),const SizedBox(height:6),Text('찜한 상품 ${products.length} · 가격 다운 알림 ${alerts.length}',style:const TextStyle(color:KkokkapickTheme.muted))]))),if(products.isEmpty)SliverFillRemaining(hasScrollBody:false,child:_V9EmptyState(icon:Icons.favorite_border_rounded,title:'아직 찜한 상품이 없어요',body:'마음에 드는 옷의 하트를 눌러 한곳에 모아보세요.',action:'상품 둘러보기',onAction:onExplore))else V9ProductGridSliver(products:products,favorites:favorites,alerts:alerts,onFavorite:onFavorite,onAlert:onAlert,onProduct:onProduct,bottomPadding:96)]));
}

class V9MyPage extends StatelessWidget{
  const V9MyPage({super.key,required this.profile,required this.favoriteCount,required this.alertCount,required this.onEditProfile,required this.onFavorites,required this.onSearch});
  final ChildProfile? profile;final int favoriteCount,alertCount;final VoidCallback onEditProfile,onFavorites,onSearch;
  @override Widget build(BuildContext context)=>SafeArea(bottom:false,child:ListView(padding:const EdgeInsets.fromLTRB(16,14,16,96),children:[Row(children:[const KkokkapickBrandMark(compact:true),const Spacer(),IconButton(onPressed:(){},icon:const Icon(Icons.settings_outlined))]),const SizedBox(height:24),Text(profile==null?'우리 아이 정보를 등록해보세요':'${profile!.months}개월 아이와 함께 쇼핑 중',style:Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight:FontWeight.w900)),const SizedBox(height:7),const Text('아이 정보는 더 알맞은 상품과 사이즈를 추천하는 데 사용해요.',style:TextStyle(color:KkokkapickTheme.muted)),const SizedBox(height:18),ListTile(onTap:onEditProfile,shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(18)),tileColor:KkokkapickTheme.surface,leading:const CircleAvatar(backgroundColor:KkokkapickTheme.lavenderSoft,child:Icon(Icons.child_care_rounded,color:KkokkapickTheme.lavenderDeep)),title:Text(profile==null?'아이 정보 입력':'${profile!.stage} · ${profile!.heightCm.toStringAsFixed(0)}cm · ${profile!.weightKg.toStringAsFixed(1)}kg',style:const TextStyle(fontWeight:FontWeight.w800)),subtitle:Text(profile==null?'월령, 키, 몸무게를 입력해 주세요.':'탭해서 정보를 수정할 수 있어요.'),trailing:const Icon(Icons.chevron_right_rounded)),const SizedBox(height:18),Row(children:[Expanded(child:_V9Stat(icon:Icons.favorite_border_rounded,label:'찜한 상품',value:'$favoriteCount',onTap:onFavorites)),const SizedBox(width:10),Expanded(child:_V9Stat(icon:Icons.notifications_none_rounded,label:'가격 다운 알림',value:'$alertCount',onTap:onFavorites))]),const SizedBox(height:24),ListTile(leading:const Icon(Icons.history_rounded),title:const Text('최근 본 상품'),trailing:const Icon(Icons.chevron_right_rounded),onTap:onSearch),ListTile(leading:const Icon(Icons.storefront_outlined),title:const Text('관심 브랜드'),trailing:const Icon(Icons.chevron_right_rounded),onTap:onSearch),const ListTile(enabled:false,leading:Icon(Icons.help_outline_rounded),title:Text('고객센터'),subtitle:Text('출시 전 지원 채널 연결 예정')),const ListTile(enabled:false,leading:Icon(Icons.shield_outlined),title:Text('개인정보 및 데이터'),subtitle:Text('외부 베타 전 계정 기능 연결 예정'))]));
}

class V9ProductGridSliver extends StatelessWidget{
  const V9ProductGridSliver({super.key,required this.products,required this.favorites,required this.alerts,required this.onFavorite,required this.onAlert,required this.onProduct,required this.bottomPadding});
  final List<CatalogProduct> products;final Set<String> favorites,alerts;final ValueChanged<CatalogProduct> onFavorite,onAlert,onProduct;final double bottomPadding;
  @override Widget build(BuildContext context)=>SliverPadding(padding:EdgeInsets.fromLTRB(16,0,16,bottomPadding),sliver:SliverLayoutBuilder(builder:(context,constraints){final width=constraints.crossAxisExtent;final columns=width>=900?4:width>=600?3:2;return SliverGrid.builder(itemCount:products.length,gridDelegate:SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:columns,crossAxisSpacing:12,mainAxisSpacing:28,childAspectRatio:width<340 ? .48 : .52),itemBuilder:(context,i){final p=products[i];return V9ProductCard(product:p,favorite:favorites.contains(p.id),alertEnabled:alerts.contains(p.id),onFavorite:()=>onFavorite(p),onAlert:()=>onAlert(p),onTap:()=>onProduct(p));});}));
}

class V9ProductDetailSheet extends StatefulWidget{
  const V9ProductDetailSheet({super.key,required this.product,required this.profile,required this.favorite,required this.alertEnabled,required this.onFavorite,required this.onAlert});
  final CatalogProduct product;final ChildProfile? profile;final bool favorite,alertEnabled;final VoidCallback onFavorite,onAlert;
  @override State<V9ProductDetailSheet> createState()=>_V9ProductDetailSheetState();
}
class _V9ProductDetailSheetState extends State<V9ProductDetailSheet>{
  int imageIndex=0;late bool favorite=widget.favorite;late bool alert=widget.alertEnabled;
  Future<void> _openOffer(ProductOffer offer)async{final uri=Uri.tryParse(offer.affiliateUrl);if(uri==null||(uri.scheme!='https'&&uri.scheme!='http')){if(mounted)ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('구매 링크를 확인할 수 없어요.')));return;}await launchUrl(uri,mode:LaunchMode.externalApplication);}
  @override Widget build(BuildContext context){final p=widget.product;final offers=[...p.offers]..sort((a,b)=>(a.price??1<<62).compareTo(b.price??1<<62));final images=p.galleryUrls;final fit=KkokkafitEngine().evaluate(widget.profile,p);return DraggableScrollableSheet(expand:false,initialChildSize:.94,minChildSize:.65,maxChildSize:.98,builder:(context,controller)=>ListView(controller:controller,padding:const EdgeInsets.fromLTRB(18,8,18,30),children:[SizedBox(height:330,child:Stack(fit:StackFit.expand,children:[ClipRRect(borderRadius:BorderRadius.circular(20),child:images.length<=1?ProductImage(url:images.isEmpty?p.imageUrl:images.first):PageView.builder(itemCount:images.length,onPageChanged:(v)=>setState(()=>imageIndex=v),itemBuilder:(context,i)=>ProductImage(url:images[i]))),Positioned(top:10,right:10,child:IconButton.filledTonal(onPressed:(){widget.onFavorite();setState(()=>favorite=!favorite);},icon:Icon(favorite?Icons.favorite_rounded:Icons.favorite_border_rounded),style:IconButton.styleFrom(backgroundColor:Colors.white.withValues(alpha:.94)))),if(images.length>1)Positioned(bottom:10,left:0,right:0,child:Text('${imageIndex+1}/${images.length}',textAlign:TextAlign.center,style:const TextStyle(color:Colors.white,fontWeight:FontWeight.w800,shadows:[Shadow(blurRadius:4,color:Colors.black54)])))])),const SizedBox(height:18),Text(p.brand??p.merchant,style:const TextStyle(color:KkokkapickTheme.muted,fontWeight:FontWeight.w800)),const SizedBox(height:5),Text(p.displayName,style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w900,height:1.28)),const SizedBox(height:10),Row(children:[if(p.merchantCount>1)const Text('최저가 ',style:TextStyle(color:KkokkapickTheme.lavenderDeep,fontWeight:FontWeight.w800)),Text(v9Won(p.minPrice),style:const TextStyle(fontSize:23,fontWeight:FontWeight.w900)),if(p.merchantCount>1)...[const SizedBox(width:8),Text('${p.merchantCount}개 판매처',style:const TextStyle(color:KkokkapickTheme.muted,fontSize:12))]]),const SizedBox(height:14),FilledButton.tonalIcon(onPressed:(){widget.onAlert();setState(()=>alert=!alert);},icon:Icon(alert?Icons.notifications_active_rounded:Icons.notifications_none_rounded),label:Text(alert?'가격 내려가면 알림받는 중':'가격 내려가면 알림받기')),const SizedBox(height:18),_V9InfoBlock(title:'상품 정보',children:[if(p.sizeRangeLabel!=null)_V9InfoRow(label:'사이즈',value:p.sizeRangeLabel!),if(p.specs.material?.trim().isNotEmpty??false)_V9InfoRow(label:'소재',value:p.specs.material!.trim()),if(p.specs.season?.trim().isNotEmpty??false)_V9InfoRow(label:'계절',value:p.specs.season!.trim()),if(p.specs.thickness?.trim().isNotEmpty??false)_V9InfoRow(label:'두께',value:p.specs.thickness!.trim()),if((p.specs.colorCount??0)>0)_V9InfoRow(label:'색상',value:'${p.specs.colorCount}가지'),_V9InfoRow(label:'꼬까핏',value:fit.label)]),if(p.reviews.isNotEmpty)...[const SizedBox(height:18),_V9InfoBlock(title:'판매처별 후기',children:[for(final r in p.reviews.take(4))_V9InfoRow(label:r.source,value:'${r.rating==null?'':('${r.rating!.toStringAsFixed(1)} · ')}후기 ${r.count}개')])],if(offers.isNotEmpty)...[const SizedBox(height:18),Text('판매처별 가격',style:Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight:FontWeight.w900)),for(final offer in offers)ListTile(contentPadding:EdgeInsets.zero,title:Text(offer.merchant,style:const TextStyle(fontWeight:FontWeight.w700)),subtitle:Text(offer.price==p.minPrice&&p.merchantCount>1?'현재 최저가':'판매처 가격'),trailing:TextButton(onPressed:()=>_openOffer(offer),child:Text(v9Won(offer.price))))]]));}
}

class _V9SectionHeader extends StatelessWidget{const _V9SectionHeader({required this.title,this.action,this.onAction});final String title;final String? action;final VoidCallback? onAction;@override Widget build(BuildContext context)=>Row(children:[Expanded(child:Text(title,style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.w900))),if(action!=null)TextButton(onPressed:onAction,child:Text(action!))]);}
class _V9EmptyState extends StatelessWidget{const _V9EmptyState({required this.icon,required this.title,required this.body,this.action,this.onAction});final IconData icon;final String title,body;final String? action;final VoidCallback? onAction;@override Widget build(BuildContext context)=>Center(child:Padding(padding:const EdgeInsets.all(28),child:Column(mainAxisSize:MainAxisSize.min,children:[Icon(icon,size:44,color:KkokkapickTheme.muted),const SizedBox(height:12),Text(title,style:const TextStyle(fontSize:17,fontWeight:FontWeight.w900)),const SizedBox(height:6),Text(body,textAlign:TextAlign.center,style:const TextStyle(color:KkokkapickTheme.muted)),if(action!=null)...[const SizedBox(height:16),FilledButton.tonal(onPressed:onAction,child:Text(action!))]])));}
class _V9Stat extends StatelessWidget{const _V9Stat({required this.icon,required this.label,required this.value,required this.onTap});final IconData icon;final String label,value;final VoidCallback onTap;@override Widget build(BuildContext context)=>InkWell(onTap:onTap,borderRadius:BorderRadius.circular(16),child:Container(padding:const EdgeInsets.all(16),decoration:BoxDecoration(color:KkokkapickTheme.surface,borderRadius:BorderRadius.circular(16)),child:Column(children:[Icon(icon),const SizedBox(height:7),Text(value,style:const TextStyle(fontSize:19,fontWeight:FontWeight.w900)),Text(label,style:const TextStyle(fontSize:11,color:KkokkapickTheme.muted))])));}
class _V9InfoBlock extends StatelessWidget{const _V9InfoBlock({required this.title,required this.children});final String title;final List<Widget> children;@override Widget build(BuildContext context)=>Container(padding:const EdgeInsets.all(16),decoration:BoxDecoration(color:KkokkapickTheme.surface,borderRadius:BorderRadius.circular(16)),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:const TextStyle(fontWeight:FontWeight.w900)),const SizedBox(height:10),...children]));}
class _V9InfoRow extends StatelessWidget{const _V9InfoRow({required this.label,required this.value});final String label,value;@override Widget build(BuildContext context)=>Padding(padding:const EdgeInsets.symmetric(vertical:4),child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[SizedBox(width:76,child:Text(label,style:const TextStyle(fontSize:12,color:KkokkapickTheme.muted))),Expanded(child:Text(value,style:const TextStyle(fontSize:12,fontWeight:FontWeight.w700)))]));}
