package com.legacydragdrop

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

// CORREÇÃO: Implementamos a interface 'ReactPackage' diretamente.
class LegacyDragDropPackage : ReactPackage {

  // Este método é exigido pelo ReactPackage para registrar módulos nativos.
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      LegacyDragDropModule(reactContext)
    )
  }

  // Este método também é exigido pelo ReactPackage. Como não temos componentes de UI, retornamos uma lista vazia.
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return Collections.emptyList()
  }
}
