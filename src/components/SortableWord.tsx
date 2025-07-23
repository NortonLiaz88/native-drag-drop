import { memo, type ReactElement, useCallback } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  calculateLayout,
  lastOrder,
  type Offset,
  remove,
  useVector, // useVector não é mais usado, mas pode ser mantido no import
} from '../compute/Layout';
import type {
  DuoAnimatedStyleWorklet,
  DuoWordAnimatedStyle,
  OnDropFunction,
} from '../@types';

export interface SortableWordProps {
  animatedStyleWorklet?: DuoAnimatedStyleWorklet;
  onDrop?: OnDropFunction;
  offsets: Offset[];
  children: ReactElement<{ id: number }>;
  index: number;
  containerWidth: number;
  gesturesDisabled: boolean;
  rtl: boolean;
  // linesHeight não é mais necessário sem o pan gesture
  wordHeight: number;
  wordGap: number;
  wordBankOffsetY: number;
  lineGap: number;
}

const SortableWord = ({
  animatedStyleWorklet,
  offsets,
  index,
  children,
  containerWidth,
  gesturesDisabled,
  rtl,
  wordHeight,
  wordGap,
  wordBankOffsetY,
  lineGap,
  onDrop,
}: SortableWordProps) => {
  const offset = offsets[index]!;
  const isAnimating = useSharedValue(false);
  const isInBank = useDerivedValue(() => offset.order.value === -1);

  const emitOnDrop = useCallback(
    () =>
      onDrop?.({
        index,
        destination: offset.order.value === -1 ? 'bank' : 'answered',
        position: offset.order.value,
      }),
    [index, offset, onDrop]
  );

  // Lógica de quando o usuário toca na palavra
  const handleTap = () => {
    'worklet';
    isAnimating.value = true;
    if (isInBank.value) {
      offset.order.value = lastOrder(offsets);
    } else {
      remove(offsets, index);
      offset.order.value = -1;
    }
    calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);
    runOnJS(emitOnDrop)();
  };

  const tapGesture = Gesture.Tap()
    .enabled(!gesturesDisabled)
    .onStart(() => {
      'worklet';
      handleTap();
    });

  // Estilo animado drasticamente simplificado
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const targetX = isInBank.value ? offset.originalX.value : offset.x.value;
    const targetY = isInBank.value
      ? offset.originalY.value + wordBankOffsetY
      : offset.y.value;

    const style: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: isAnimating.value ? 100 : Math.max(1, offset.order.value),
      width: offset.width.value,
      height: wordHeight,
      transform: [
        { translateX: withTiming(targetX, { duration: 250 }) },
        {
          translateY: withTiming(targetY, { duration: 250 }, (finished) => {
            if (finished) {
              isAnimating.value = false;
            }
          }),
        },
      ],
    };
    return (
      animatedStyleWorklet?.(style as DuoWordAnimatedStyle, false) || style
    );
  });

  return (
    // GestureDetector agora usa apenas o tapGesture
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default memo(SortableWord);
