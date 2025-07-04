import type { JSX } from 'react';
import { useRef } from 'react';
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
                for (const index in calculatedOffsets.current) {
                  const { y } = calculatedOffsets.current[index]!;
                  numLines.add(y);
                }
                const numLinesSize =
                  numLines.size < 3 ? numLines.size + 1 : numLines.size;
                const linesHeight = numLinesSize * lineHeight;
                for (const index in calculatedOffsets.current) {
                  const { x, y, width } = calculatedOffsets.current[index]!;
                  const offset = offsets[index];
                  offset!.order.value = -1;
                  offset!.width.value = width;
                  offset!.originalX.value = x;
                  offset!.originalY.value = y + linesHeight + wordBankOffsetY;

                  offsetStyles.current[index] = {
                    position: 'absolute',
                    height: wordHeight,
                    top: y + linesHeight + wordBankOffsetY * 2,
                    left: x + wordGap,
                    width: width - wordGap * 2,
                  };
                }
                setTimeout(() => {
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
