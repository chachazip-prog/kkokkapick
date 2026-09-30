class ProductOffer {
  const ProductOffer({required this.merchant,required this.price,required this.affiliateUrl,this.originalPrice});
  final String merchant;
  final int? price;
  final int? originalPrice;
  final String affiliateUrl;

  factory ProductOffer.fromJson(Map<String,dynamic> json)=>ProductOffer(
    merchant:(json['merchant']??'판매처').toString(),
    price:(json['price'] as num?)?.toInt(),
    originalPrice:(json['originalPrice'] as num?)?.toInt(),
    affiliateUrl:(json['affiliateUrl']??'').toString(),
  );
}

class ProductReviewSummary {
  const ProductReviewSummary({
    required this.source,
    required this.count,
    this.rating,
    this.url,
    this.observedAt,
  });
  final String source;
  final int count;
  final double? rating;
  final String? url,observedAt;

  factory ProductReviewSummary.fromJson(Map<String,dynamic> json)=>ProductReviewSummary(
    source:(json['source']??json['merchant']??'').toString(),
    count:(json['count'] as num?)?.toInt()??(json['reviewCount'] as num?)?.toInt()??0,
    rating:(json['rating'] as num?)?.toDouble(),
    url:json['url']?.toString()??json['reviewUrl']?.toString(),
    observedAt:json['observedAt']?.toString(),
  );
}

class ProductSpecs {
  const ProductSpecs({
    this.material,
    this.season,
    this.thickness,
    this.colorCount,
  });
  final String? material,season,thickness;
  final int? colorCount;

  bool get hasAny=>
      (material?.trim().isNotEmpty??false)||
      (season?.trim().isNotEmpty??false)||
      (thickness?.trim().isNotEmpty??false)||
      (colorCount??0)>0;

  factory ProductSpecs.fromJson(Map<String,dynamic> json)=>ProductSpecs(
    material:json['material']?.toString()??json['composition']?.toString(),
    season:json['season']?.toString(),
    thickness:json['thickness']?.toString(),
    colorCount:(json['colorCount'] as num?)?.toInt(),
  );
}

class BrandSizeRow {
  const BrandSizeRow({required this.size,this.months,this.heightCm,this.weightKg});
  final String size;
  final List<int>? months;
  final double? heightCm,weightKg;
  factory BrandSizeRow.fromJson(Map<String,dynamic> json)=>BrandSizeRow(
    size:(json['size']??'').toString(),
    months:(json['months'] as List?)?.whereType<num>().map((e)=>e.toInt()).toList(),
    heightCm:(json['height'] as num?)?.toDouble(),
    weightKg:(json['weight'] as num?)?.toDouble(),
  );
}

class BrandSizeGuide {
  const BrandSizeGuide({required this.kind,required this.rows,this.source,this.verifiedAt});
  final String kind;
  final String? source,verifiedAt;
  final List<BrandSizeRow> rows;
  factory BrandSizeGuide.fromJson(Map<String,dynamic> json)=>BrandSizeGuide(
    kind:(json['kind']??'').toString(),
    source:json['source']?.toString(),
    verifiedAt:json['verifiedAt']?.toString(),
    rows:(json['rows'] as List? ?? const []).whereType<Map>().map((e)=>BrandSizeRow.fromJson(Map<String,dynamic>.from(e))).toList(),
  );
}

class CatalogProduct {
  const CatalogProduct({
    required this.id,
    required this.name,
    required this.category,
    required this.fitStatus,
    required this.offers,
    required this.offerCount,
    required this.availableSizes,
    this.brand,
    this.stage,
    this.imageUrl,
    this.imageUrls=const [],
    this.minPrice,
    this.maxPrice,
    this.sizeGuide,
    this.specs=const ProductSpecs(),
    this.reviews=const [],
  });
  final String id,name,category,fitStatus;
  final String? brand,stage,imageUrl;
  final List<String> imageUrls;
  final int? minPrice,maxPrice;
  final int offerCount;
  final List<ProductOffer> offers;
  final List<String> availableSizes;
  final BrandSizeGuide? sizeGuide;
  final ProductSpecs specs;
  final List<ProductReviewSummary> reviews;

  factory CatalogProduct.fromJson(Map<String,dynamic> json) {
    final offers=(json['offers'] as List? ?? const []).whereType<Map>().map((e)=>ProductOffer.fromJson(Map<String,dynamic>.from(e))).toList();
    final rawGuide=json['sizeGuide'];
    final rawSpecs=json['specs'];
    final rawImages=json['imageUrls']??json['images'];
    final parsedImages=<String>[];
    if(rawImages is List){
      for(final item in rawImages){
        final value=item is Map?(item['url']??item['imageUrl'])?.toString():item?.toString();
        if(value!=null&&value.trim().isNotEmpty&&!parsedImages.contains(value.trim()))parsedImages.add(value.trim());
      }
    }
    final primary=json['imageUrl']?.toString();
    if(primary!=null&&primary.trim().isNotEmpty&&!parsedImages.contains(primary.trim()))parsedImages.insert(0,primary.trim());
    final reviews=(json['reviews'] as List? ?? json['reviewSummaries'] as List? ?? const [])
        .whereType<Map>()
        .map((e)=>ProductReviewSummary.fromJson(Map<String,dynamic>.from(e)))
        .where((e)=>e.source.trim().isNotEmpty&&e.count>0)
        .toList();
    return CatalogProduct(
      id:(json['id']??'').toString(),
      name:(json['name']??'').toString(),
      brand:json['brand']?.toString(),
      category:(json['category']??'기타').toString(),
      stage:json['stage']?.toString(),
      imageUrl:primary,
      imageUrls:parsedImages,
      fitStatus:(json['fitStatus']??'unverified').toString(),
      minPrice:(json['minPrice'] as num?)?.toInt(),
      maxPrice:(json['maxPrice'] as num?)?.toInt(),
      offerCount:(json['offerCount'] as num?)?.toInt()??offers.length,
      offers:offers,
      availableSizes:(json['availableSizes'] as List? ?? const []).map((e)=>e.toString()).where((e)=>e.isNotEmpty).toList(),
      sizeGuide:rawGuide is Map?BrandSizeGuide.fromJson(Map<String,dynamic>.from(rawGuide)):null,
      specs:rawSpecs is Map
          ? ProductSpecs.fromJson(Map<String,dynamic>.from(rawSpecs))
          : ProductSpecs(
              material:json['material']?.toString()??json['composition']?.toString(),
              season:json['season']?.toString(),
              thickness:json['thickness']?.toString(),
              colorCount:(json['colorCount'] as num?)?.toInt(),
            ),
      reviews:reviews,
    );
  }

  String get merchant=>offers.isEmpty?'판매처':offers.first.merchant;
  List<String> get galleryUrls=>imageUrls.isNotEmpty?imageUrls:(imageUrl==null||imageUrl!.trim().isEmpty?const []:[imageUrl!]);
  int get merchantCount {
    final merchants={for(final offer in offers) if(offer.merchant.trim().isNotEmpty) offer.merchant.trim()};
    return merchants.isNotEmpty?merchants.length:offerCount;
  }
  int get totalReviewCount=>reviews.fold(0,(sum,item)=>sum+item.count);
  double? get weightedRating {
    final usable=reviews.where((e)=>e.rating!=null&&e.count>0).toList();
    if(usable.isEmpty)return null;
    final weight=usable.fold<int>(0,(sum,item)=>sum+item.count);
    if(weight==0)return null;
    final value=usable.fold<double>(0,(sum,item)=>sum+(item.rating!*item.count));
    return value/weight;
  }
  String? get sizeRangeLabel {
    if(availableSizes.isEmpty)return null;
    if(availableSizes.length==1)return availableSizes.first;
    return '${availableSizes.first}–${availableSizes.last}';
  }
  String get displayName {
    var value=name.trim();
    // Provider titles often prepend one or more offer-channel tags. They are
    // not product identity: the same canonical item may have multiple offers.
    const channels=['보리보리','롯데백화점','롯데ON','롯데온','SSG','G마켓','옥션','11번가','GS SHOP','GSSHOP','CJ온스타일','현대Hmall','현대홈쇼핑'];
    // Strip only bracket groups that identify an offer channel. Preserve
    // bracketed brand/style information such as [에뜨와].
    var changed=true;
    while(changed){
      changed=false;
      final match=RegExp(r'^\s*\[\s*([^\]]+)\s*\]\s*').firstMatch(value);
      if(match!=null&&channels.any((channel)=>match.group(1)!.toLowerCase().contains(channel.toLowerCase()))){
        value=value.substring(match.end);changed=true;
      }
    }
    value=value.replaceFirst(RegExp('^(?:'+channels.map(RegExp.escape).join('|')+')\\s*[-:|]?\\s*',caseSensitive:false), '');
    return value.trim().isEmpty?name:value.trim();
  }
}
