import type Animated from 'react-native-reanimated';
import { useSharedValue, runOnJS, runOnUI } from 'react-native-reanimated';
import { NativeModules } from 'react-native';

const LINKING_ERROR = `The package 'react-native-legacy-drag-drop' doesn't seem to be linked.`;
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

export interface Vector<T = number> {
  x: T;
  y: T;
}
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

export const move = <T>(input: T[], from: number, to: number) => {
  'worklet';
  const newArray = [...input];
  newArray.splice(to, 0, newArray.splice(from, 1)[0]!);
  return newArray;
};
export const between = (
  value: number,
  lowerBound: number,
  upperBound: number,
  inclusive = true
) => {
  'worklet';
  return inclusive
    ? value >= lowerBound && value <= upperBound
    : value > lowerBound && value < upperBound;
};
export const lastOrder = (input: Offset[]) => {
  'worklet';
  return input.filter(isNotInBank).length;
};

export const remove = (input: Offset[], index: number) => {
  'worklet';
  const answered = input.filter(
    (o) => o.order.value !== -1 && o !== input[index]
  );
  const sorted = answered.sort(byOrder);
  for (let i = 0; i < sorted.length; i++) {
    sorted[i]!.order.value = i;
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

const calculateLayout_JS = (
  input: Offset[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl: boolean
) => {
  const orders = input.map((o) => o.order.value);
  const widths = input.map((o) => o.width.value);
  const answeredOffsets = input.filter(isNotInBank).sort(byOrder);
  NativeLegacyDragDrop.calculateLayout(
    orders,
    widths,
    containerWidth,
    wordHeight,
    wordGap,
    lineGap,
    rtl,
    (error: Error | null, positions: Array<{ x: number; y: number }>) => {
      if (error) {
        console.error('Erro no calculateLayout nativo:', error);
        return;
      }
      runOnUI(() => {
        'worklet';
        if (positions && answeredOffsets.length === positions.length) {
          for (let i = 0; i < positions.length; i++) {
            const offset = answeredOffsets[i]!;
            const position = positions[i]!;
            offset.x.value = position.x;
            offset.y.value = position.y;
          }
        }
      })();
    }
  );
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
  runOnJS(calculateLayout_JS)(
    input,
    containerWidth,
    wordHeight,
    wordGap,
    lineGap,
    rtl
  );
};
