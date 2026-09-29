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
  const CatalogProduct({required this.id,required this.name,required this.category,required this.fitStatus,required this.offers,required this.offerCount,required this.availableSizes,this.brand,this.stage,this.imageUrl,this.minPrice,this.maxPrice,this.sizeGuide});
  final String id,name,category,fitStatus;
  final String? brand,stage,imageUrl;
  final int? minPrice,maxPrice;
  final int offerCount;
  final List<ProductOffer> offers;
  final List<String> availableSizes;
  final BrandSizeGuide? sizeGuide;

  factory CatalogProduct.fromJson(Map<String,dynamic> json) {
    final offers=(json['offers'] as List? ?? const []).whereType<Map>().map((e)=>ProductOffer.fromJson(Map<String,dynamic>.from(e))).toList();
    final rawGuide=json['sizeGuide'];
    return CatalogProduct(
      id:(json['id']??'').toString(),
      name:(json['name']??'').toString(),
      brand:json['brand']?.toString(),
      category:(json['category']??'기타').toString(),
      stage:json['stage']?.toString(),
      imageUrl:json['imageUrl']?.toString(),
      fitStatus:(json['fitStatus']??'unverified').toString(),
      minPrice:(json['minPrice'] as num?)?.toInt(),
      maxPrice:(json['maxPrice'] as num?)?.toInt(),
      offerCount:(json['offerCount'] as num?)?.toInt()??offers.length,
      offers:offers,
      availableSizes:(json['availableSizes'] as List? ?? const []).map((e)=>e.toString()).where((e)=>e.isNotEmpty).toList(),
      sizeGuide:rawGuide is Map?BrandSizeGuide.fromJson(Map<String,dynamic>.from(rawGuide)):null,
    );
  }

  String get merchant=>offers.isEmpty?'판매처':offers.first.merchant;
}
