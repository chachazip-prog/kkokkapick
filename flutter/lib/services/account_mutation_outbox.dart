import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

enum AccountMutationKind { favorite, childProfile, priceAlert }

final class PendingAccountMutation {
  const PendingAccountMutation(this.kind,this.key,this.payload);
  final AccountMutationKind kind;
  final String key;
  final Map<String,Object?> payload;
  Map<String,Object?> toJson()=>{'kind':kind.name,'key':key,'payload':payload};
  static PendingAccountMutation fromJson(Map<String,Object?> j)=>PendingAccountMutation(
    AccountMutationKind.values.byName(j['kind'] as String),
    j['key'] as String,
    Map<String,Object?>.from(j['payload'] as Map),
  );
}

/// Durable, coalescing outbox. The latest intent for the same logical key wins.
final class AccountMutationOutbox {
  static const _storageKey='account_mutation_outbox_v2';
  String _key(String owner)=>'${_storageKey}_${base64Url.encode(utf8.encode(owner)).replaceAll('=','')}';

  Future<List<PendingAccountMutation>> load([String owner='guest']) async {
    final p=await SharedPreferences.getInstance();
    final raw=p.getString(_key(owner));
    if(raw==null||raw.isEmpty)return const [];
    final decoded=jsonDecode(raw);
    if(decoded is! List)return const [];
    return decoded.whereType<Map>().map((e)=>PendingAccountMutation.fromJson(Map<String,Object?>.from(e))).toList();
  }

  Future<void> put(PendingAccountMutation mutation,[String owner='guest']) async {
    final items=List<PendingAccountMutation>.of(await load(owner));
    items.removeWhere((x)=>x.kind==mutation.kind&&x.key==mutation.key);
    items.add(mutation);
    await _save(items,owner);
  }

  Future<void> remove(AccountMutationKind kind,String key,[String owner='guest']) async {
    final items=List<PendingAccountMutation>.of(await load(owner));
    items.removeWhere((x)=>x.kind==kind&&x.key==key);
    await _save(items,owner);
  }

  Future<void> clear([String owner='guest']) async {
    final p=await SharedPreferences.getInstance();
    await p.remove(_key(owner));
  }

  Future<void> _save(List<PendingAccountMutation> items,String owner) async {
    final p=await SharedPreferences.getInstance();
    await p.setString(_key(owner),jsonEncode(items.map((e)=>e.toJson()).toList()));
  }
}
