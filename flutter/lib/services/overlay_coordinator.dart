import 'package:flutter/material.dart';

enum OverlayKind{none,managedPopup,userModal}

class OverlayCoordinator{
  OverlayKind _active=OverlayKind.none;
  OverlayKind get active=>_active;
  bool begin(OverlayKind kind){
    if(_active!=OverlayKind.none)return false;
    _active=kind;return true;
  }
  void end(OverlayKind kind){if(_active==kind)_active=OverlayKind.none;}
}

Future<T?> coordinatedModal<T>({
  required BuildContext context,
  required OverlayCoordinator coordinator,
  required WidgetBuilder builder,
}) async{
  if(!coordinator.begin(OverlayKind.userModal))return null;
  try{return await showModalBottomSheet<T>(context:context,isScrollControlled:true,showDragHandle:true,builder:builder);}
  finally{coordinator.end(OverlayKind.userModal);}
}
