import type Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { NativeModules } from 'react-native';

// =================================================================
// PARTE 1: ACESSO SEGURO AO MÓDULO NATIVO
// =================================================================

const LINKING_ERROR = `The package 'react-native-legacy-drag-drop' doesn't seem to be linked. Make sure you rebuilt the app.`;

const NativeLegacyDragDrop = NativeModules.LegacyDragDrop
  ? NativeModules.LegacyDragDrop
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// =================================================================
// PARTE 2: TIPOS E HELPERS DO REANIMATED
// =================================================================

// These util functions were extracted from: wcadillon/react-native-redash

/**
 * @worklet
 */
export const move = <T>(input: T[], from: number, to: number) => {
  'worklet';
  const offsets = input.slice();
  while (from < 0) {
    from += offsets.length;
  }
  while (to < 0) {
    to += offsets.length;
  }
  if (to >= offsets.length) {
    let k = to - offsets.length;
    while (k-- + 1) {
      offsets.push();
    }
  }
  offsets.splice(to, 0, offsets.splice(from, 1)[0]!);
  return offsets;
};

/**
 * @summary Returns true if node is within lowerBound and upperBound.
 * @worklet
 */
export const between = (
  value: number,
  lowerBound: number,
  upperBound: number,
  inclusive = true
) => {
  'worklet';
  if (inclusive) {
    return value >= lowerBound && value <= upperBound;
  }
  return value > lowerBound && value < upperBound;
};

/**
 * @summary Type representing a vector
 * @example
   export interface Vector<T = number> {
    x: T;
    y: T;
  }
 */
export interface Vector<T = number> {
  x: T;
  y: T;
}

/**
 * @summary Returns a vector of shared values
 */
export const useVector = (
  x1 = 0,
  y1?: number
): Vector<Animated.SharedValue<number>> => {
  const x = useSharedValue(x1);
  const y = useSharedValue(y1 ?? x1);
  return { x, y };
};

type SharedValues<T extends Record<string, string | number | boolean>> = {
  [K in keyof T]: Animated.SharedValue<T[K]>;
};

export type Offset = SharedValues<{
  order: number;
  height: number;
  width: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
}>;

const isNotInBank = (offset: Offset) => {
  'worklet';
  return offset.order.value !== -1;
};

const byOrder = (a: Offset, b: Offset) => {
  'worklet';
  return a.order.value - b.order.value;
};

export const lastOrder = (input: Offset[]) => {
  'worklet';
  return input.filter(isNotInBank).length;
};

export const remove = (input: Offset[], index: number) => {
  'worklet';
  const offsets = input
    .filter((_, i) => i !== index)
    .filter(isNotInBank)
    .sort(byOrder);

  for (let i = 0; i < offsets.length; i++) {
    offsets[i]!.order.value = i;
  }
};

export const reorder = (input: Offset[], from: number, to: number) => {
  'worklet';
  const offsets = input.filter(isNotInBank).sort(byOrder);
  const newOffset = move(offsets, from, to);
  for (let i = 0; i < newOffset.length; i++) {
    newOffset[i]!.order.value = i;
  }
};

export const calculateLayout = (
  input: Offset[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl = false
) => {
  'worklet';
  const offsets = input.filter(isNotInBank).sort(byOrder);

  if (offsets.length === 0) {
    return;
  }
  let lineNumber = 0;
  let currentLineX = 0; // Initialize running sum for the current line
  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];

    // Calculate the width of the current word including its gap
    const wordWidthWithGap = offset!.width.value + wordGap / 2;

    if (currentLineX + wordWidthWithGap > containerWidth) {
      // If adding the current word exceeds container width, move to the next line
      lineNumber += 1;
      currentLineX = 0; // Reset running sum for the new line
    }

    // Set x and y coordinates for the current word
    offset!.x.value = rtl
      ? containerWidth - currentLineX - offset!.width.value
      : currentLineX;
    offset!.y.value = (wordHeight + lineGap) * lineNumber + lineGap / 2;

    // Update running sum for the current line
    currentLineX += wordWidthWithGap;
  }
};

export const calculateLayoutWithNative = (
  orders: number[],
  widths: number[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl: boolean
): Array<{ x: number; y: number }> => {
  return NativeLegacyDragDrop.calculateLayout(
    orders,
    widths,
    containerWidth,
    wordHeight,
    wordGap,
    lineGap,
    rtl
  );
};
