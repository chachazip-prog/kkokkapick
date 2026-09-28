import 'package:flutter/material.dart';
import 'models/catalog_product.dart';
import 'repositories/catalog_repository.dart';
import 'repositories/favorites_repository.dart';

void main()=>runApp(const KkokkapickApp());

class KkokkapickApp extends StatelessWidget {
  const KkokkapickApp({super.key});
  @override
  Widget build(BuildContext context)=>MaterialApp(
    title:'꼬까픽',
    debugShowCheckedModeBanner:false,
    theme:ThemeData(useMaterial3:true,colorSchemeSeed:const Color(0xffff7043),scaffoldBackgroundColor:Colors.white),
    home:const CatalogScreen(),
  );
}

enum CatalogSort{recommended,low,high}

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});
  @override State<CatalogScreen> createState()=>_CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen>{
  static final _endpoint=Uri.parse('https://chachazip-prog.github.io/kkokkapick/data/catalog.json');
  final _catalog=CatalogRepository(),_favorites=FavoritesRepository(),_search=TextEditingController();
  List<CatalogProduct> _products=const[];
  Set<String> _favoriteIds={};
  String _stage='전체',_category='전체',_brand='전체';
  CatalogSort _sort=CatalogSort.recommended;
  bool _fitOnly=false,_favoritesOnly=false,_loading=true;
  Object? _error;

  @override void initState(){super.initState();_load();}
  @override void dispose(){_search.dispose();super.dispose();}

  Future<void> _load() async {
    setState((){_loading=true;_error=null;});
    try{
      final results=await Future.wait([_catalog.fetchCatalog(_endpoint),_favorites.load()]);
      if(!mounted)return;
      setState((){_products=results[0] as List<CatalogProduct>;_favoriteIds=results[1] as Set<String>;_loading=false;});
    }catch(e){if(mounted)setState((){_error=e;_loading=false;});}
  }

  List<String> _values(String Function(CatalogProduct) pick)=>['전체',...{for(final p in _products) if(pick(p).isNotEmpty) pick(p)}.toList()..sort()];
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
  }

  void _reset(){setState((){_search.clear();_stage=_category=_brand='전체';_fitOnly=_favoritesOnly=false;_sort=CatalogSort.recommended;});}

  @override Widget build(BuildContext context){
    final stages=['전체','신생아','베이비','유아','토들러','키즈'];
    final categories=_values((p)=>p.category),brands=_values((p)=>p.brand??'');
    final items=_visible;
    return Scaffold(
      appBar:AppBar(title:const Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('꼬까픽',style:TextStyle(fontWeight:FontWeight.w900)),Text('우리 아이 옷, 한곳에서.',style:TextStyle(fontSize:11,fontWeight:FontWeight.normal))]),actions:[IconButton(onPressed:()=>setState(()=>_favoritesOnly=!_favoritesOnly),icon:Icon(_favoritesOnly?Icons.favorite:Icons.favorite_border))]),
      body:_loading?const Center(child:CircularProgressIndicator()):_error!=null?_ErrorView(onRetry:_load):RefreshIndicator(onRefresh:_load,child:CustomScrollView(slivers:[
        SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.all(16),child:Column(children:[
          TextField(controller:_search,onChanged:(_)=>setState((){}),decoration:const InputDecoration(prefixIcon:Icon(Icons.search),hintText:'브랜드, 상품을 검색해보세요',filled:true,border:OutlineInputBorder(borderSide:BorderSide.none,borderRadius:BorderRadius.all(Radius.circular(16))))),
          const SizedBox(height:12),
          _FilterRow(values:stages,value:_stage,onChanged:(v)=>setState(()=>_stage=v)),
          _FilterRow(values:categories,value:_category,onChanged:(v)=>setState(()=>_category=v)),
          _FilterRow(values:brands,value:_brand,onChanged:(v)=>setState(()=>_brand=v)),
          Row(children:[FilterChip(label:const Text('꼬까핏 가능'),selected:_fitOnly,onSelected:(v)=>setState(()=>_fitOnly=v)),const Spacer(),DropdownButton<CatalogSort>(value:_sort,underline:const SizedBox(),items:const [DropdownMenuItem(value:CatalogSort.recommended,child:Text('추천순')),DropdownMenuItem(value:CatalogSort.low,child:Text('낮은 가격순')),DropdownMenuItem(value:CatalogSort.high,child:Text('높은 가격순'))],onChanged:(v)=>setState(()=>_sort=v!))]),
          Row(children:[Text('${items.length}개',style:Theme.of(context).textTheme.titleMedium),const Spacer(),TextButton(onPressed:_reset,child:const Text('필터 초기화'))])
        ]))),
        if(items.isEmpty)const SliverFillRemaining(child:Center(child:Text('검색 결과가 없어요.')))
        else SliverPadding(padding:const EdgeInsets.fromLTRB(16,0,16,24),sliver:SliverGrid.builder(gridDelegate:const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:2,crossAxisSpacing:10,mainAxisSpacing:18,childAspectRatio:.60),itemCount:items.length,itemBuilder:(context,i)=>_ProductCard(product:items[i],favorite:_favoriteIds.contains(items[i].id),onFavorite:()=>_toggleFavorite(items[i].id),onTap:()=>showModalBottomSheet(context:context,isScrollControlled:true,showDragHandle:true,builder:(_)=>_ProductDetail(items[i])))))
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
    Expanded(child:Stack(fit:StackFit.expand,children:[ClipRRect(borderRadius:BorderRadius.circular(16),child:product.imageUrl==null?const ColoredBox(color:Color(0xfff5f5f5)):Image.network(product.imageUrl!,fit:BoxFit.cover,errorBuilder:(_,__,___)=>const ColoredBox(color:Color(0xfff5f5f5)))),Positioned(right:6,top:6,child:IconButton.filledTonal(onPressed:onFavorite,icon:Icon(favorite?Icons.favorite:Icons.favorite_border),visualDensity:VisualDensity.compact))])),
    const SizedBox(height:7),if(product.brand!=null)Text(product.brand!,style:const TextStyle(fontSize:12,fontWeight:FontWeight.bold)),Text(product.name,maxLines:2,overflow:TextOverflow.ellipsis),const SizedBox(height:3),Text(_won(product.minPrice),style:const TextStyle(fontWeight:FontWeight.w800)),Text('${product.merchant}${product.offerCount>1?' · ${product.offerCount}개 판매처':''}',style:Theme.of(context).textTheme.bodySmall),if(product.fitStatus=='verified')const Padding(padding:EdgeInsets.only(top:4),child:Chip(label:Text('꼬까핏 가능',style:TextStyle(fontSize:10)),visualDensity:VisualDensity.compact))
  ]));
}

class _ProductDetail extends StatelessWidget{
  const _ProductDetail(this.product);final CatalogProduct product;
  String _won(int? n)=>n==null?'가격 확인':'${n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'),(m)=>',')}원';
  @override Widget build(BuildContext context){final offers=[...product.offers]..sort((a,b)=>(a.price??1<<62).compareTo(b.price??1<<62));return SafeArea(child:Padding(padding:const EdgeInsets.fromLTRB(20,0,20,24),child:ListView(shrinkWrap:true,children:[
    if(product.imageUrl!=null)ClipRRect(borderRadius:BorderRadius.circular(18),child:AspectRatio(aspectRatio:1.4,child:Image.network(product.imageUrl!,fit:BoxFit.cover))),
    const SizedBox(height:14),if(product.brand!=null)Text(product.brand!,style:const TextStyle(fontWeight:FontWeight.bold)),Text(product.name,style:Theme.of(context).textTheme.titleLarge),const SizedBox(height:8),Text('${product.category} · ${product.stage??'월령 확인'}'),
    const SizedBox(height:18),Text('꼬까핏',style:Theme.of(context).textTheme.titleMedium),Text(product.fitStatus=='verified'?'공식 브랜드 사이즈표를 확인할 수 있는 상품이에요.':'검증된 공식 사이즈표가 없어 임의로 사이즈를 추천하지 않아요.'),
    const SizedBox(height:18),Text('판매처 가격 비교',style:Theme.of(context).textTheme.titleMedium),
    ...offers.asMap().entries.map((e)=>ListTile(contentPadding:EdgeInsets.zero,title:Text(e.value.merchant),subtitle:e.value.originalPrice!=null&&e.value.originalPrice!>(e.value.price??0)?Text('정가 ${_won(e.value.originalPrice)}'):null,trailing:Column(mainAxisAlignment:MainAxisAlignment.center,crossAxisAlignment:CrossAxisAlignment.end,children:[Text(_won(e.value.price),style:const TextStyle(fontWeight:FontWeight.bold)),if(e.key==0&&offers.length>1)const Text('최저가',style:TextStyle(fontSize:11))]))),
    const SizedBox(height:8),const Text('가격·옵션·배송정보는 판매처에서 최종 확인하세요. 구매 링크 연결은 다음 앱 배치에서 안전한 외부 브라우저 처리로 추가합니다.',style:TextStyle(fontSize:11))
  ]));}
}

class _ErrorView extends StatelessWidget{
  const _ErrorView({required this.onRetry});final VoidCallback onRetry;
  @override Widget build(BuildContext context)=>Center(child:Column(mainAxisSize:MainAxisSize.min,children:[const Text('상품 정보를 불러오지 못했어요.'),const SizedBox(height:8),FilledButton(onPressed:onRetry,child:const Text('다시 시도'))]));
}
