import 'package:flutter/material.dart';

enum OverlayKind { none, managedPopup, userModal }

class OverlayCoordinator {
  OverlayKind _active = OverlayKind.none;

  OverlayKind get active => _active;

  bool begin(OverlayKind kind) {
    if (_active != OverlayKind.none) return false;
    _active = kind;
    return true;
  }

  void end(OverlayKind kind) {
    if (_active == kind) _active = OverlayKind.none;
  }
}

Future<T?> coordinatedModal<T>({
  required BuildContext context,
  required OverlayCoordinator coordinator,
  required WidgetBuilder builder,
  bool isScrollControlled = true,
  bool showDragHandle = true,
  bool useSafeArea = false,
  Color? backgroundColor,
  bool isDismissible = true,
  bool enableDrag = true,
}) async {
  if (!coordinator.begin(OverlayKind.userModal)) return null;
  try {
    return await showModalBottomSheet<T>(
      context: context,
      isScrollControlled: isScrollControlled,
      showDragHandle: showDragHandle,
      useSafeArea: useSafeArea,
      backgroundColor: backgroundColor,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      builder: builder,
    );
  } finally {
    coordinator.end(OverlayKind.userModal);
  }
}
