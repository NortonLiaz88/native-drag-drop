package com.legacydragdrop

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper

@ReactModule(name = LegacyDragDropModule.NAME)
class LegacyDragDropModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Padrão de Callback: Não tem tipo de retorno e recebe 'callback' como último argumento
  // O resultado é enviado via callback.invoke()

  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    val result = a * b
    promise.resolve(result)
  }

  @ReactMethod
  fun move(input: ReadableArray, from: Double, to: Double, promise: Promise) {
    val list = mutableListOf<Double>()
    for (i in 0 until input.size()) {
      list.add(input.getDouble(i))
    }
    val fromIdx = from.toInt()
    val toIdx = to.toInt()
    if (fromIdx in list.indices && toIdx in list.indices) {
      val item = list.removeAt(fromIdx)
      list.add(toIdx, item)
    }
    val result = WritableNativeArray()
    list.forEach { result.pushDouble(it) }
    promise.resolve(result)
  }

  @ReactMethod
  fun between(value: Double, min: Double, max: Double, inclusive: Boolean, promise: Promise) {
    val result = if (inclusive) value in min..max else value > min && value < max
    promise.resolve(result)
  }

  @ReactMethod
  fun lastOrder(orders: ReadableArray, promise: Promise) {
    var count = 0
    for (i in 0 until orders.size()) {
      if (orders.getDouble(i).toInt() != -1) {
        count++
      }
    }
    promise.resolve(count.toDouble())
  }

  @ReactMethod
  fun remove(orders: ReadableArray, index: Double, promise: Promise) {
    val idx = index.toInt()
    val list = mutableListOf<Int>()
    for (i in 0 until orders.size()) {
      if (i != idx && orders.getDouble(i).toInt() != -1) {
        list.add(i)
      }
    }
    val result = WritableNativeArray()
    list.sorted().forEachIndexed { i, _ -> result.pushDouble(i.toDouble()) }
    promise.resolve(result)
  }

  @ReactMethod
  fun reorder(orders: ReadableArray, from: Double, to: Double, promise: Promise) {
    val values = mutableListOf<Int>()
    for (i in 0 until orders.size()) {
      val value = orders.getDouble(i).toInt()
      if (value != -1) values.add(value)
    }
    val fromIdx = from.toInt()
    val toIdx = to.toInt()
    if (fromIdx in values.indices && toIdx in values.indices) {
      val item = values.removeAt(fromIdx)
      values.add(toIdx, item)
    }
    val result = WritableNativeArray()
    values.sorted().forEachIndexed { i, _ -> result.pushDouble(i.toDouble()) }
    promise.resolve(result)
  }

  @ReactMethod
  fun measureWords(viewTags: ReadableArray, promise: Promise) {
    val result = WritableNativeArray()
    for (i in 0 until viewTags.size()) {
      val tag = viewTags.getInt(i)
      val uiManager = UIManagerHelper.getUIManagerForReactTag(reactApplicationContext, tag)
      val view = uiManager?.resolveView(tag)
      if (view != null) {
        val location = IntArray(2)
        view.getLocationOnScreen(location)
        val map = WritableNativeMap().apply {
          putDouble("x", location[0].toDouble())
          putDouble("y", location[1].toDouble())
          putDouble("width", view.width.toDouble())
          putDouble("height", view.height.toDouble())
        }
        result.pushMap(map)
      }
    }
    promise.resolve(result)
  }

  @ReactMethod
  fun calculateLayout(
    orders: ReadableArray,
    widths: ReadableArray,
    containerWidth: Double,
    wordHeight: Double,
    wordGap: Double,
    lineGap: Double,
    rtl: Boolean,
    promise: Promise
  ) {
    val result = Arguments.createArray()
    val orderedItems = mutableListOf<Pair<Int, Double>>()
    for (i in 0 until orders.size()) {
      val order = orders.getInt(i)
      if (order != -1) {
        orderedItems.add(Pair(i, widths.getDouble(i)))
      }
    }
    orderedItems.sortBy { orders.getInt(it.first) }
    var lineNumber = 0
    var lineBreak = 0
    for ((index, width) in orderedItems) {
      val layout = Arguments.createMap()
      val currentTotal = (lineBreak until index).sumOf { widths.getDouble(it) + wordGap / 2 }
      if (currentTotal + width > containerWidth) {
        lineNumber += 1
        lineBreak = index
        layout.putDouble("x", if (rtl) containerWidth - width else 0.0)
      } else {
        layout.putDouble("x", if (rtl) containerWidth - currentTotal - width else currentTotal)
      }
      layout.putDouble("y", (wordHeight + lineGap) * lineNumber + lineGap / 2)
      result.pushMap(layout)
    }
    promise.resolve(result)
  }

  companion object {
    const val NAME = "LegacyDragDrop"
  }
}
