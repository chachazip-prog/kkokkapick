import 'package:flutter/material.dart';

import '../models/catalog_product.dart';
import '../theme/kkokkapick_theme.dart';
import 'discovery_experience.dart';

String v9Won(int? value) {
  if (value == null || value <= 0) return '가격 확인';
  final raw = value.toString();
  return '${raw.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => ',')}원';
}

class V9HeroBanner extends StatelessWidget {
  const V9HeroBanner({super.key, this.product, required this.onTap});
  final CatalogProduct? product;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          height: 196,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFF3EBE2), Color(0xFFEDE2D7)],
            ),
          ),
          child: Stack(
            children: [
              if (product?.imageUrl != null)
                Positioned(
                  right: -4,
                  top: 0,
                  bottom: 0,
                  width: 190,
                  child: Opacity(
                    opacity: .94,
                    child: ProductImage(url: product!.imageUrl, fit: BoxFit.cover),
                  ),
                ),
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [
                        const Color(0xFFF3EBE2).withValues(alpha: .99),
                        const Color(0xFFF3EBE2).withValues(alpha: .88),
                        const Color(0xFFF3EBE2).withValues(alpha: .06),
                      ],
                      stops: const [0, .55, 1],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 16, 18),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 226),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'KIDS FASHION, SIMPLIFIED',
                        style: TextStyle(fontSize: 9, letterSpacing: 1.6, color: Color(0xFF776B60), fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        '작은 일상이\n특별한 스타일이 되는 순간',
                        style: TextStyle(height: 1.12, fontSize: 21, fontWeight: FontWeight.w900, letterSpacing: -.9, color: KkokkapickTheme.ink),
                      ),
                      const SizedBox(height: 7),
                      const Text(
                        '같은 상품은 모아 보고, 최저가와 사이즈까지 한눈에',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 11, height: 1.35, color: Color(0xFF665D55)),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(color: KkokkapickTheme.lavender, borderRadius: BorderRadius.circular(999)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('오늘의 스타일 보기', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
                            SizedBox(width: 4),
                            Icon(Icons.chevron_right_rounded, size: 15, color: Colors.white),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

class V9CategoryStrip extends StatelessWidget {
  const V9CategoryStrip({super.key, required this.categories, required this.onSelected});
  final List<String> categories;
  final ValueChanged<String> onSelected;

  IconData _icon(String label, int index) {
    final value = label.toLowerCase();
    if (value.contains('상의')) return Icons.checkroom_rounded;
    if (value.contains('하의')) return Icons.dry_cleaning_rounded;
    if (value.contains('원피스')) return Icons.woman_2_outlined;
    if (value.contains('신발')) return Icons.roller_skating_rounded;
    if (value.contains('바디')) return Icons.child_friendly_rounded;
    if (value.contains('실내')) return Icons.bedtime_outlined;
    return switch (index % 4) {
      0 => Icons.checkroom_outlined,
      1 => Icons.shopping_bag_outlined,
      2 => Icons.child_care_outlined,
      _ => Icons.auto_awesome_outlined,
    };
  }

  @override
  Widget build(BuildContext context) => SizedBox(
        height: 92,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.only(right: 6),
          itemCount: categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) {
            final label = categories[index];
            final width = (label.runes.length * 12.0 + 28).clamp(68.0, 92.0);
            return InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () => onSelected(label),
              child: SizedBox(
                width: width,
                child: Column(
                  children: [
                    Container(
                      width: 58,
                      height: 58,
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFF8F6FB)),
                      alignment: Alignment.center,
                      child: Icon(_icon(label, index), size: 24),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      label,
                      maxLines: 1,
                      softWrap: false,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: KkokkapickTheme.ink),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
}

class V9EditorialStrip extends StatelessWidget {
  const V9EditorialStrip({super.key, required this.products, required this.onTap});
  final List<CatalogProduct> products;
  final ValueChanged<CatalogProduct> onTap;

  static const _labels = [
    ('지금 인기있는', '봄 코디 모음'),
    ('등원룩 추천', '실패 없는 데일리룩'),
    ('30일 이내 신상', '지금 가장 핫한 아이템'),
    ('선물하기 좋은', '베스트 아이템'),
  ];

  @override
  Widget build(BuildContext context) {
    final items = products.take(6).toList();
    if (items.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 174,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final product = items[index];
          final copy = _labels[index % _labels.length];
          return InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: () => onTap(product),
            child: Container(
              width: 138,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                color: KkokkapickTheme.surface,
                border: Border.all(color: const Color(0xFFECE8F1)),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ProductImage(url: product.imageUrl),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(begin: Alignment.topCenter,end: Alignment.bottomCenter,colors: [Colors.transparent, Color(0xB8000000)],stops: [.43, 1]),
                    ),
                  ),
                  Positioned(
                    left: 10,right: 10,bottom: 10,
                    child: Text('${copy.$1}\n${copy.$2}',maxLines: 2,overflow: TextOverflow.ellipsis,style: const TextStyle(color: Colors.white,height: 1.25,fontSize: 11,fontWeight: FontWeight.w800)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class V9ProductCard extends StatefulWidget {
  const V9ProductCard({super.key,required this.product,required this.favorite,required this.alertEnabled,required this.onFavorite,required this.onAlert,required this.onTap});
  final CatalogProduct product;
  final bool favorite,alertEnabled;
  final VoidCallback onFavorite,onAlert,onTap;
  @override State<V9ProductCard> createState()=>_V9ProductCardState();
}

class _V9ProductCardState extends State<V9ProductCard> {
  int _imageIndex=0;

  @override
  Widget build(BuildContext context) {
    final product=widget.product;
    final images=product.galleryUrls;
    final specs=<String>[
      if(product.sizeRangeLabel!=null)'사이즈 ${product.sizeRangeLabel}',
      if(product.specs.material?.trim().isNotEmpty??false)product.specs.material!.trim(),
      if(product.specs.season?.trim().isNotEmpty??false)product.specs.season!.trim(),
    ];
    final rating=product.weightedRating;
    return Material(
      color:Colors.white,
      elevation:.35,
      shadowColor:const Color(0x22000000),
      shape:RoundedRectangleBorder(
        borderRadius:BorderRadius.circular(16),
        side:const BorderSide(color:Color(0xFFE9E7EC),width:1),
      ),
      clipBehavior:Clip.antiAlias,
      child:InkWell(
        onTap:widget.onTap,
        child:Padding(
          padding:const EdgeInsets.fromLTRB(8,8,8,10),
          child:Column(
            crossAxisAlignment:CrossAxisAlignment.start,
            children:[
              Expanded(
                child:Stack(
                  fit:StackFit.expand,
                  children:[
                    ClipRRect(
                      borderRadius:BorderRadius.circular(12),
                      child:DecoratedBox(
                        decoration:const BoxDecoration(color:Color(0xFFFAFAFB)),
                        child:images.length<=1
                          ? ProductImage(url:images.isEmpty?product.imageUrl:images.first)
                          : PageView.builder(
                              physics:const PageScrollPhysics(),
                              itemCount:images.length,
                              onPageChanged:(value)=>setState(()=>_imageIndex=value),
                              itemBuilder:(context,index)=>ProductImage(url:images[index]),
                            ),
                      ),
                    ),
                    if(images.length>1)...[
                      Positioned(
                        left:0,right:0,bottom:8,
                        child:Row(
                          mainAxisAlignment:MainAxisAlignment.center,
                          children:List.generate(images.length.clamp(0,5),(index)=>Container(
                            width:index==_imageIndex?13:5,height:5,margin:const EdgeInsets.symmetric(horizontal:2),
                            decoration:BoxDecoration(color:index==_imageIndex?KkokkapickTheme.ink:Colors.white.withValues(alpha:.85),borderRadius:BorderRadius.circular(999)),
                          )),
                        ),
                      ),
                      Positioned(
                        left:8,top:8,
                        child:Container(
                          padding:const EdgeInsets.symmetric(horizontal:7,vertical:4),
                          decoration:BoxDecoration(color:Colors.black.withValues(alpha:.55),borderRadius:BorderRadius.circular(999)),
                          child:Text('${_imageIndex+1}/${images.length}',style:const TextStyle(color:Colors.white,fontSize:9,fontWeight:FontWeight.w700)),
                        ),
                      ),
                    ],
                    Positioned(
                      top:7,right:7,
                      child:IconButton(
                        tooltip:widget.favorite?'찜 해제':'찜',
                        onPressed:widget.onFavorite,
                        icon:Icon(widget.favorite?Icons.favorite_rounded:Icons.favorite_border_rounded),
                        style:IconButton.styleFrom(backgroundColor:Colors.white.withValues(alpha:.95),foregroundColor:widget.favorite?KkokkapickTheme.lavenderDeep:KkokkapickTheme.ink),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height:9),
              Text(product.brand??product.merchant,maxLines:1,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:11,fontWeight:FontWeight.w800,color:KkokkapickTheme.muted)),
              const SizedBox(height:3),
              Text(product.displayName,maxLines:3,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:13,height:1.28,fontWeight:FontWeight.w600)),
              if(specs.isNotEmpty)...[
                const SizedBox(height:6),
                Wrap(
                  spacing:4,runSpacing:4,
                  children:specs.take(3).map((spec)=>Container(
                    padding:const EdgeInsets.symmetric(horizontal:6,vertical:3),
                    decoration:BoxDecoration(color:const Color(0xFFF7F5F8),borderRadius:BorderRadius.circular(999)),
                    child:Text(spec,maxLines:1,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:9.5,color:KkokkapickTheme.muted)),
                  )).toList(),
                ),
              ],
              const SizedBox(height:7),
              Row(
                crossAxisAlignment:CrossAxisAlignment.end,
                children:[
                  const Padding(padding:EdgeInsets.only(right:4,bottom:2),child:Text('최저가',style:TextStyle(fontSize:10,color:KkokkapickTheme.lavenderDeep,fontWeight:FontWeight.w800))),
                  Expanded(child:Text(v9Won(product.minPrice),maxLines:1,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:16,fontWeight:FontWeight.w900))),
                ],
              ),
              const SizedBox(height:5),
              Row(
                children:[
                  if(product.merchantCount>1)Text('${product.merchantCount}개 판매처',style:const TextStyle(fontSize:10,color:KkokkapickTheme.muted)),
                  if(product.merchantCount>1&&(rating!=null||product.totalReviewCount>0))const Text(' · ',style:TextStyle(fontSize:10,color:KkokkapickTheme.muted)),
                  if(rating!=null)Text('★ ${rating.toStringAsFixed(1)}',style:const TextStyle(fontSize:10,color:KkokkapickTheme.muted)),
                  if(product.totalReviewCount>0)Text(' (${product.totalReviewCount})',style:const TextStyle(fontSize:10,color:KkokkapickTheme.muted)),
                  const Spacer(),
                  GestureDetector(
                    onTap:widget.onAlert,
                    child:Row(mainAxisSize:MainAxisSize.min,children:[
                      Icon(widget.alertEnabled?Icons.notifications_active_rounded:Icons.notifications_none_rounded,size:14,color:widget.alertEnabled?KkokkapickTheme.lavenderDeep:KkokkapickTheme.muted),
                      const SizedBox(width:2),
                      Text(widget.alertEnabled?'가격↓ 알림 중':'가격↓ 알림',style:TextStyle(fontSize:9,fontWeight:FontWeight.w700,color:widget.alertEnabled?KkokkapickTheme.lavenderDeep:KkokkapickTheme.muted)),
                    ]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
