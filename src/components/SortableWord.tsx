import { memo, type ReactElement, useCallback } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  runOnJS,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  calculateLayout,
  lastOrder,
  type Offset,
  remove,
  reorder,
  between,
  useVector,
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
  linesHeight: number;
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
  linesHeight,
  wordHeight,
  wordGap,
  wordBankOffsetY,
  lineGap,
  onDrop,
}: SortableWordProps) => {
  const offset = offsets[index]!;
  const isGestureActive = useSharedValue(false);
  const isAnimating = useSharedValue(false);
  const translation = useVector();
  const isInBank = useDerivedValue(() => offset.order.value === -1);
  const ctxX = useSharedValue(0);
  const ctxY = useSharedValue(0);
  const panOrderHasChanged = useSharedValue(false);

  const emitOnDrop = useCallback(
    () =>
      onDrop?.({
        index,
        destination: offset.order.value === -1 ? 'bank' : 'answered',
        position: offset.order.value,
      }),
    [index, offset, onDrop]
  );

  // MUDANÇA: Toda a lógica de "soltar" foi movida para esta função
  // const handlePanDrop = () => {
  //   'worklet';
  //   panOrderHasChanged.value = false;
  //   const answeredOffsets = offsets
  //     .filter((o) => o.order.value !== -1)
  //     .sort((a, b) => a.order.value - b.order.value);
  //   const fromIndex = answeredOffsets.findIndex((o) => o === offset);

  //   // Lógica 1: Se a palavra foi arrastada para FORA da área de resposta, mande-a para o banco.
  //   if (!isInBank.value && translation.y.value > linesHeight) {
  //     panOrderHasChanged.value = true;
  //     remove(offsets, index);
  //     offset.order.value = -1;
  //   }
  //   // Lógica 2: Se a palavra veio DO BANCO para a área de resposta.
  //   else if (isInBank.value) {
  //     panOrderHasChanged.value = true;
  //     offset.order.value = lastOrder(offsets);
  //   }
  //   // Lógica 3: Reordenar palavras que JÁ ESTÃO na área de resposta.
  //   else if (!isInBank.value) {
  //     for (let i = 0; i < answeredOffsets.length; i++) {
  //       const o = answeredOffsets[i]!;
  //       if (o === offset) continue;

  //       const x = o.x.value;
  //       const y = o.y.value;
  //       const width = o.width.value;

  //       // =================================================================
  //       // ADICIONE ESTE CONSOLE.WARN PARA DEPURAÇÃO
  //       // =================================================================
  //       console.warn(
  //         `[DEBUG] Dragging at (${Math.round(translation.x.value)}, ${Math.round(translation.y.value)}). Checking word at (${Math.round(x)}, ${Math.round(y)})`
  //       );

  //       const isBetweenX = between(translation.x.value, x, x + width, true);
  //       const isBetweenY = between(
  //         translation.y.value,
  //         y,
  //         y + wordHeight,
  //         true
  //       );

  //       if (isBetweenX && isBetweenY) {
  //         // Se você NUNCA vir esta mensagem, a condição 'between' está falhando.
  //         console.warn('[DEBUG] COLISÃO DETECTADA!');

  //         const toIndex = i;
  //         if (fromIndex !== toIndex) {
  //           panOrderHasChanged.value = true;
  //           reorder(offsets, fromIndex, toIndex);
  //         }
  //         break; // Sai do loop após a primeira colisão encontrada
  //       }
  //     }
  //   }

  //   // Após qualquer mudança de ordem, disparamos o cálculo de layout.
  //   // Como a versão JS é síncrona, isso acontece imediatamente.
  //   calculateLayout(offsets, containerWidth, wordHeight, wordGap, lineGap, rtl);

  //   if (panOrderHasChanged.value) {
  //     runOnJS(emitOnDrop)();
  //   }
  // };

  const panGesture = Gesture.Pan()
    .enabled(!gesturesDisabled)
    .onStart(() => {
      'worklet';
      if (isAnimating.value) return;
      isGestureActive.value = true;
      panOrderHasChanged.value = false;
      const startX = isInBank.value ? offset.originalX.value : offset.x.value;
      const startY = isInBank.value
        ? offset.originalY.value + wordBankOffsetY
        : offset.y.value;
      ctxX.value = startX;
      ctxY.value = startY;
      translation.x.value = startX;
      translation.y.value = startY;
    })
    .onChange((event) => {
      'worklet';
      translation.x.value = ctxX.value + event.translationX;
      translation.y.value = ctxY.value + event.translationY;

      // Lógica de reordenação em tempo real (igual à sua original)
      // Agora funciona porque 'reorder', 'remove', etc. são worklets síncronos.
      const answeredOffsets = offsets
        .filter((o) => o.order.value !== -1)
        .sort((a, b) => a.order.value - b.order.value);
      const fromIndex = answeredOffsets.findIndex((o) => o === offset);

      if (isInBank.value && translation.y.value < linesHeight) {
        offset.order.value = lastOrder(offsets);
        panOrderHasChanged.value = true;
      } else if (!isInBank.value && translation.y.value > linesHeight) {
        remove(offsets, index);
        offset.order.value = -1;
        panOrderHasChanged.value = true;
      } else if (!isInBank.value) {
        const toIndex = answeredOffsets.findIndex(
          (o) =>
            o !== offset &&
            between(
              translation.x.value,
              o.x.value,
              o.x.value + o.width.value,
              true
            ) &&
            between(
              translation.y.value,
              o.y.value,
              o.y.value + o.height.value,
              true
            )
        );
        if (toIndex !== -1 && fromIndex !== toIndex) {
          reorder(offsets, fromIndex, toIndex);
          panOrderHasChanged.value = true;
        }
      }
    })
    .onEnd(() => {
      'worklet';
      // Ao soltar, disparamos o cálculo de layout nativo, que é assíncrono.
      calculateLayout(
        offsets,
        containerWidth,
        wordHeight,
        wordGap,
        lineGap,
        rtl
      );
      isGestureActive.value = false;
      if (panOrderHasChanged.value) {
        runOnJS(emitOnDrop)();
      }
    });

  // A lógica do Tap Gesture permanece a mesma, pois ela já era "atômica".
  const handleTap = () => {
    'worklet';
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
      isAnimating.value = true;
      handleTap();
    });

  // const animatedStyle = useAnimatedStyle(() => {
  //   'worklet';
  //   const targetX = isInBank.value ? offset.originalX.value : offset.x.value;
  //   const targetY = isInBank.value
  //     ? offset.originalY.value + wordBankOffsetY
  //     : offset.y.value;

  //   // MUDANÇA: 'withTiming' foi removido.
  //   // Agora, a posição é atualizada instantaneamente.
  //   const x = isGestureActive.value ? translation.x.value : targetX;
  //   const y = isGestureActive.value ? translation.y.value : targetY;

  //   // Callback para resetar o estado de animação (ainda útil)
  //   if (!isGestureActive.value) {
  //     isAnimating.value = false;
  //   }

  //   const style: ViewStyle = {
  //     position: 'absolute',
  //     top: 0,
  //     left: 0,
  //     zIndex:
  //       isGestureActive.value || isAnimating.value
  //         ? 100
  //         : Math.max(1, offset.order.value),
  //     width: offset.width.value,
  //     height: wordHeight,
  //     transform: [{ translateX: x }, { translateY: y }],
  //   };
  //   return (
  //     animatedStyleWorklet?.(
  //       style as DuoWordAnimatedStyle,
  //       isGestureActive.value
  //     ) || style
  //   );
  // });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const targetX = isInBank.value ? offset.originalX.value : offset.x.value;
    const targetY = isInBank.value
      ? offset.originalY.value + wordBankOffsetY
      : offset.y.value;

    // MUDANÇA: Adicionamos o `withTiming` de volta, mas com uma configuração customizada.
    const animationConfig = {
      duration: 150, // Animação bem mais curta e rápida
      easing: Easing.out(Easing.quad), // Começa rápido e desacelera suavemente
    };

    const x = isGestureActive.value
      ? translation.x.value
      : withTiming(targetX, animationConfig);

    const y = isGestureActive.value
      ? translation.y.value
      : withTiming(targetY, animationConfig, (finished) => {
          if (finished) {
            isAnimating.value = false;
          }
        });

    const style: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex:
        isGestureActive.value || isAnimating.value
          ? 100
          : Math.max(1, offset.order.value),
      width: offset.width.value,
      height: wordHeight,
      transform: [{ translateX: x }, { translateY: y }],
    };
    return (
      animatedStyleWorklet?.(
        style as DuoWordAnimatedStyle,
        isGestureActive.value
      ) || style
    );
  });

  return (
    <GestureDetector gesture={Gesture.Race(tapGesture, panGesture)}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default memo(SortableWord);
