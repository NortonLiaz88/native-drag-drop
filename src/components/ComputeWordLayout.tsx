import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import {
  type StyleProp,
  type ViewStyle,
  type LayoutRectangle,
  View,
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

/**
 * This component renders with 0 opacity in order to
 * compute word positioning & container width
 */
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
  const calculatedOffsets = useRef<LayoutRectangle[]>([]);
  const offsetStyles = useRef<StyleProp<ViewStyle>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpa o timeout quando o componente desmonta
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View
      style={[styles.computeWordLayoutContainer, styles[wordBankAlignment]]}
      onLayout={(e) => {
        onContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      {children.map((child, index) => {
        return (
          <View
            key={`compute.${index}`}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              calculatedOffsets.current[index] = { width, height, x, y };

              if (
                Object.keys(calculatedOffsets.current).length ===
                children.length
              ) {
                const numLines = new Set();
                for (const keyIndex in calculatedOffsets.current) {
                  const { y: currentY } = calculatedOffsets.current[keyIndex]!;
                  numLines.add(currentY);
                }
                const numLinesSize =
                  numLines.size < 3 ? numLines.size + 1 : numLines.size;
                const linesHeight = numLinesSize * lineHeight;
                for (const keyIndex in calculatedOffsets.current) {
                  const {
                    x: currentX,
                    y: currentY,
                    width: currentWidth,
                  } = calculatedOffsets.current[keyIndex]!;
                  const offset = offsets[keyIndex];
                  offset!.order.value = -1;
                  offset!.width.value = currentWidth;
                  offset!.originalX.value = currentX;
                  offset!.originalY.value =
                    currentY + linesHeight + wordBankOffsetY;

                  offsetStyles.current[keyIndex] = {
                    position: 'absolute',
                    height: wordHeight,
                    top: currentY + linesHeight + wordBankOffsetY * 2,
                    left: currentX + wordGap,
                    width: currentWidth - wordGap * 2,
                  };
                }
                timeoutRef.current = setTimeout(() => {
                  onLayout({
                    numLines: numLines.size,
                    wordStyles: offsetStyles.current,
                  });
                }, 16);
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
