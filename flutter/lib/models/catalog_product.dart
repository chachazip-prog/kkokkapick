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

class CatalogProduct {
  const CatalogProduct({required this.id,required this.name,required this.category,required this.fitStatus,required this.offers,required this.offerCount,this.brand,this.stage,this.imageUrl,this.minPrice,this.maxPrice});
  final String id,name,category,fitStatus;
  final String? brand,stage,imageUrl;
  final int? minPrice,maxPrice;
  final int offerCount;
  final List<ProductOffer> offers;

  factory CatalogProduct.fromJson(Map<String,dynamic> json) {
    final offers=(json['offers'] as List? ?? const []).whereType<Map>().map((e)=>ProductOffer.fromJson(Map<String,dynamic>.from(e))).toList();
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
    );
  }

  String get merchant=>offers.isEmpty?'판매처':offers.first.merchant;
}
