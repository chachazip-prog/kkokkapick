class CommercialCampaign {
  const CommercialCampaign({required this.id,required this.title,required this.disclosureLabel,this.partnerName,this.destinationUrl,this.imageUrl,this.priority=0});
  final String id,title,disclosureLabel;
  final String? partnerName,destinationUrl,imageUrl;
  final int priority;
  factory CommercialCampaign.fromJson(Map<String,dynamic> j)=>CommercialCampaign(id:'${j['id']??''}',title:'${j['title']??''}',disclosureLabel:'${j['disclosure_label']??'Sponsored'}',partnerName:j['partner_name']?.toString(),destinationUrl:j['destination_url']?.toString(),imageUrl:j['image_url']?.toString(),priority:(j['priority'] as num?)?.toInt()??0);
}
class ManagedPopup {
  const ManagedPopup({required this.id,required this.title,required this.dismissPolicy,this.body,this.destinationUrl,this.imageUrl,this.priority=0});
  final String id,title,dismissPolicy;
  final String? body,destinationUrl,imageUrl;
  final int priority;
  factory ManagedPopup.fromJson(Map<String,dynamic> j)=>ManagedPopup(id:'${j['id']??''}',title:'${j['title']??''}',dismissPolicy:'${j['dismiss_policy']??'session'}',body:j['body']?.toString(),destinationUrl:j['destination_url']?.toString(),imageUrl:j['image_url']?.toString(),priority:(j['priority'] as num?)?.toInt()??0);
}
