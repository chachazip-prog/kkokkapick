import '../repositories/child_profile_repository.dart';
import 'account_sync.dart';

final class AccountPresentationSnapshot {
  const AccountPresentationSnapshot({
    required this.favoriteProductIds,
    required this.priceAlerts,
    this.profile,
  });

  final Set<String> favoriteProductIds;
  final Map<String, int> priceAlerts;
  final ChildProfile? profile;
}

final class AccountSnapshotAdapter {
  const AccountSnapshotAdapter();

  AccountPresentationSnapshot merge({
    required Set<String> localFavoriteProductIds,
    required Map<String, int> localPriceAlerts,
    required ChildProfile? localProfile,
    required AccountSyncSnapshot remote,
    DateTime? now,
  }) {
    return AccountPresentationSnapshot(
      favoriteProductIds: {
        ...localFavoriteProductIds,
        ...remote.favoriteProductIds,
      },
      priceAlerts: {
        ...localPriceAlerts,
        ...remote.priceAlerts,
      },
      profile: childProfileFromRemote(remote.profile, now: now) ?? localProfile,
    );
  }

  ChildProfile? childProfileFromRemote(
    Map<String, Object?>? raw, {
    DateTime? now,
  }) {
    if (raw == null) return null;

    final baseMonths = _int(raw['months']) ??
        _int(raw['ageMonths']) ??
        _int(raw['age_months']);
    final height = _double(raw['heightCm']) ?? _double(raw['height_cm']);
    final weight = _double(raw['weightKg']) ?? _double(raw['weight_kg']);

    var months = baseMonths;
    final reference = _dateTime(raw['updatedAt']) ??
        _dateTime(raw['updated_at']);
    if (months != null && reference != null) {
      months += _elapsedWholeMonths(reference, now ?? DateTime.now());
    }

    if (months == null) {
      final birthDate = _dateTime(raw['birthDate']) ?? _dateTime(raw['birth_date']);
      if (birthDate != null) {
        months = _elapsedWholeMonths(birthDate, now ?? DateTime.now());
      }
    }

    if (months == null ||
        months <= 0 ||
        height == null ||
        height <= 0 ||
        weight == null ||
        weight <= 0) {
      return null;
    }

    return ChildProfile(
      months: months.clamp(1, 216).toInt(),
      heightCm: height,
      weightKg: weight,
    );
  }

  static int _elapsedWholeMonths(DateTime from, DateTime to) {
    if (!to.isAfter(from)) return 0;
    var months = (to.year - from.year) * 12 + to.month - from.month;
    if (to.day < from.day) months -= 1;
    return months < 0 ? 0 : months;
  }

  static int? _int(Object? value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '');
  }

  static double? _double(Object? value) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }

  static DateTime? _dateTime(Object? value) {
    if (value is DateTime) return value;
    return DateTime.tryParse(value?.toString() ?? '');
  }
}
