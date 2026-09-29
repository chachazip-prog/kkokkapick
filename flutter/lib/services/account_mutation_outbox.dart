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
  static const _storageKey='account_mutation_outbox_v1';

  Future<List<PendingAccountMutation>> load() async {
    final p=await SharedPreferences.getInstance();
    final raw=p.getString(_storageKey);
    if(raw==null||raw.isEmpty)return const [];
    final decoded=jsonDecode(raw);
    if(decoded is! List)return const [];
    return decoded.whereType<Map>().map((e)=>PendingAccountMutation.fromJson(Map<String,Object?>.from(e))).toList();
  }

  Future<void> put(PendingAccountMutation mutation) async {
    final items=List<PendingAccountMutation>.of(await load());
    items.removeWhere((x)=>x.kind==mutation.kind&&x.key==mutation.key);
    items.add(mutation);
    await _save(items);
  }

  Future<void> remove(AccountMutationKind kind,String key) async {
    final items=await load();
    items.removeWhere((x)=>x.kind==kind&&x.key==key);
    await _save(items);
  }

  Future<void> clear() async {
    final p=await SharedPreferences.getInstance();
    await p.remove(_storageKey);
  }

  Future<void> _save(List<PendingAccountMutation> items) async {
    final p=await SharedPreferences.getInstance();
    await p.setString(_storageKey,jsonEncode(items.map((e)=>e.toJson()).toList()));
  }
}
