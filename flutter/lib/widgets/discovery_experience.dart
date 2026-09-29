import 'package:flutter/material.dart';
import '../models/catalog_product.dart';
import '../theme/kkokkapick_theme.dart';

class ServiceGuideStrip extends StatelessWidget {
  const ServiceGuideStrip({super.key});
  @override
  Widget build(BuildContext context) => Row(children: const [
    Expanded(child: _GuideCard(icon: Icons.auto_awesome_outlined, title: '꼬까픽', body: '여러 판매처의 아기옷을 한곳에서 발견하고 비교해요.')),
    SizedBox(width: 10),
    Expanded(child: _GuideCard(icon: Icons.straighten_outlined, title: '꼬까핏', body: '아이 정보와 검증된 사이즈표를 바탕으로 핏을 도와요.')),
  ]);
}

class _GuideCard extends StatelessWidget {
  const _GuideCard({required this.icon, required this.title, required this.body});
  final IconData icon;
  final String title, body;
  @override
  Widget build(BuildContext context) => Container(
    constraints: const BoxConstraints(minHeight: 118),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22), border: Border.all(color: const Color(0xFFEAE6DE))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(icon, size: 22, color: KkokkapickTheme.coral),
      const SizedBox(height: 9),
      Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
      const SizedBox(height: 4),
      Text(body, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, height: 1.35, color: KkokkapickTheme.muted)),
    ]),
  );
}

class ProductImage extends StatelessWidget {
  const ProductImage({super.key,required this.url,this.fit=BoxFit.cover});
  final String? url; final BoxFit fit;
  @override Widget build(BuildContext context){
    final fallback=Container(color:KkokkapickTheme.surface,alignment:Alignment.center,child:const Column(mainAxisSize:MainAxisSize.min,children:[Icon(Icons.checkroom_outlined,size:34,color:KkokkapickTheme.muted),SizedBox(height:6),Text('상품 이미지 준비 중',style:TextStyle(fontSize:11,color:KkokkapickTheme.muted))]));
    if(url==null||url!.trim().isEmpty)return fallback;
    return Image.network(url!,fit:fit,loadingBuilder:(context,child,progress)=>progress==null?child:Container(color:KkokkapickTheme.surface,alignment:Alignment.center,child:const SizedBox(width:24,height:24,child:CircularProgressIndicator(strokeWidth:2))),errorBuilder:(_,__,___)=>fallback);
  }
}

class SwipePickDeck extends StatelessWidget {
  const SwipePickDeck({super.key, required this.products, required this.favoriteIds, required this.onFavorite, required this.onTap});
  final List<CatalogProduct> products;
  final Set<String> favoriteIds;
  final ValueChanged<String> onFavorite;
  final ValueChanged<CatalogProduct> onTap;

  String _won(int? n) {
    if (n == null) return '가격 확인';
    final raw = n.toString();
    final out = raw.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',');
    return out + '원';
  }

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Wrap(alignment:WrapAlignment.spaceBetween,crossAxisAlignment:WrapCrossAlignment.center,spacing:12,runSpacing:4,children: [
      Text('오늘의 스와이프 픽', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
      const Text('옆으로 넘겨보세요', style: TextStyle(fontSize: 12, color: KkokkapickTheme.muted)),
    ]),
    const SizedBox(height: 10),
    SizedBox(
      height: MediaQuery.textScalerOf(context).scale(16)>24 ? 390 : 350,
      child: PageView.builder(
        controller: PageController(viewportFraction: .88),
        padEnds: false,
        itemCount: products.length,
        itemBuilder: (context, i) {
          final p = products[i];
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Card(
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () => onTap(p),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(child: Stack(fit: StackFit.expand, children: [
                    ProductImage(url:p.imageUrl),
                    Positioned(right: 10, top: 10, child: IconButton.filled(onPressed: () => onFavorite(p.id), icon: Icon(favoriteIds.contains(p.id) ? Icons.favorite : Icons.favorite_border))),
                  ])),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(p.brand ?? p.merchant, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: KkokkapickTheme.muted)),
                      const SizedBox(height: 3),
                      Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Wrap(spacing:10,runSpacing:6,crossAxisAlignment:WrapCrossAlignment.center,children: [
                        Text(_won(p.minPrice), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                        MerchantMark(name: p.merchant),
                      ]),
                    ]),
                  ),
                ]),
              ),
            ),
          );
        },
      ),
    ),
  ]);
}

class MerchantMark extends StatelessWidget {
  const MerchantMark({super.key, required this.name});
  final String name;
  @override
  Widget build(BuildContext context) => Container(
    constraints: const BoxConstraints(maxWidth: 110),
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
    decoration: BoxDecoration(color: KkokkapickTheme.surface, borderRadius: BorderRadius.circular(999)),
    child: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800)),
  );
}
