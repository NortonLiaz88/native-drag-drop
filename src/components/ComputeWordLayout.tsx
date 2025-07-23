import { useCallback, useRef, type JSX } from 'react';
import {
  View,
  type LayoutRectangle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { Offset } from '../compute/Layout';
import { styles } from '../utils/styles';

interface ComputeWordLayoutProps {
  children: JSX.Element[];
  offsets: Offset[];
  onLayout(params: {
    numLines: number;
    wordStyles: StyleProp<ViewStyle>[];
  }): void;
  onContainerWidth(width: number): void;
  wordBankAlignment: 'center' | 'left' | 'right';
  wordBankOffsetY: number;
  wordHeight: number;
  lineHeight: number;
  wordGap: number;
}

export function ComputeWordLayout({
  wordGap,
  children,
  offsets,
  onLayout,
  onContainerWidth,
  wordHeight,
  lineHeight,
  wordBankAlignment,
  wordBankOffsetY,
}: ComputeWordLayoutProps) {
  const layouts = useRef<Record<number, LayoutRectangle>>({}).current;

  // MUDANÇA: Criamos uma função centralizada que só executa quando todas as medições terminam.
  const processLayouts = useCallback(() => {
    // Pega todos os valores de layout de uma vez.
    const allLayouts = Object.values(layouts);

    // MUDANÇA: Primeiro loop foi substituído por uma operação mais direta.
    const yPositions = new Set(allLayouts.map((l) => l.y));
    const numLines = yPositions.size;

    const numLinesSize = numLines < 3 ? numLines + 1 : numLines;
    const linesHeight = numLinesSize * lineHeight;

    const finalWordStyles: StyleProp<ViewStyle>[] = [];

    // MUDANÇA: A lógica de cálculo agora está em um único loop.
    children.forEach((_, index) => {
      const { x, y, width } = layouts[index]!;
      const offset = offsets[index]!;

      // Atualiza os shared values do Reanimated
      offset.order.value = -1;
      offset.width.value = width;
      offset.originalX.value = x;
      offset.originalY.value = y + linesHeight + wordBankOffsetY;

      // Cria os estilos para os placeholders
      finalWordStyles[index] = {
        position: 'absolute',
        height: wordHeight,
        top: y + linesHeight + wordBankOffsetY * 2,
        left: x + wordGap,
        width: width - wordGap * 2,
      };
    });

    // MUDANÇA: 'onLayout' é chamado diretamente, sem 'setTimeout'.
    onLayout({
      numLines: numLines,
      wordStyles: finalWordStyles,
    });
  }, [
    layouts,
    children.length,
    lineHeight,
    wordBankOffsetY,
    wordHeight,
    wordGap,
    offsets,
    onLayout,
  ]);

  return (
    <View
      style={[styles.computeWordLayoutContainer, styles[wordBankAlignment]]}
      onLayout={(e) => onContainerWidth(e.nativeEvent.layout.width)}
    >
      {children.map((child, index) => {
        return (
          <View
            key={`compute.${index}`}
            onLayout={(e) => {
              // Apenas armazena o layout e verifica se terminamos.
              layouts[index] = e.nativeEvent.layout;
              if (Object.keys(layouts).length === children.length) {
                processLayouts();
              }
            }}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
}
