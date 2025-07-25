/* eslint-disable react-hooks/rules-of-hooks */
import React, {
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import SortableWord from './SortableWord';
import Word from './Word';
import Placeholder from './Placeholder';
import Lines from './Lines';
import WordContext from './WordContext';
import { calculateLayout } from '../compute/Layout';
import { ComputeWordLayout } from './ComputeWordLayout';
import type { DuoDragDropRef } from 'react-native-legacy-drag-drop';
import type { DuoDragDropProps } from '../@types';
import { styles } from '../utils/styles';

const DuoDragDrop = React.forwardRef<DuoDragDropRef, DuoDragDropProps>(
  (props, ref) => {
    const {
      target,
      words,
      renderWord,
      renderLines,
      renderPlaceholder,
      rtl,
      gesturesDisabled,
      wordBankAlignment = 'center',
      wordGap = 4,
      wordBankOffsetY = 20,
      wordHeight = 45,
      animatedStyleWorklet,
      onReady,
      onDrop,
      wordsOfKnowledge,
    } = props;
    const lineHeight = props.lineHeight || wordHeight * 1.2;
    const lineGap = lineHeight - wordHeight;
    const [layout, setLayout] = useState<{
      numLines: number;
      wordStyles: StyleProp<ViewStyle>[];
    } | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const offsets = words.map(() => ({
      order: useSharedValue(0),
      width: useSharedValue(0),
      height: useSharedValue(0),
      x: useSharedValue(0),
      y: useSharedValue(0),
      originalX: useSharedValue(0),
      originalY: useSharedValue(0),
    }));

    const wordElements = useMemo(() => {
      return words.map((word, index) => (
        <WordContext.Provider
          key={`${word}-${index}`}
          value={{ wordHeight, wordGap, text: word, wordsOfKnowledge }}
        >
          {renderWord?.(word, index) || <Word />}
        </WordContext.Provider>
      ));
    }, [words, wordHeight, wordGap, wordsOfKnowledge, renderWord]);

    // MUDANÇA: A função não é mais async
    const reorderWordsFn = () => {
      if (!layout || containerWidth === 0) {
        return;
      }
      if (offsets.some((o) => o.width.value <= 0)) {
        return;
      }

      const targetMap = new Map(target.map((word, index) => [word, index]));
      const newOrders = words.map((word) => targetMap.get(word) ?? -1);

      for (let i = 0; i < offsets.length; i++) {
        offsets[i]!.order.value = newOrders[i]!;
      }

      calculateLayout(
        offsets,
        containerWidth,
        wordHeight,
        wordGap,
        lineGap,
        rtl
      );
    };

    useImperativeHandle(ref, () => ({
      getWords: () => {
        const answeredWords: { word: string; order: number }[] = [];
        const bankWords: { word: string; order: number }[] = [];
        for (let i = 0; i < offsets.length; i++) {
          const offset = offsets[i]!;
          const word = words[i]!;
          if (offset.order.value !== -1) {
            answeredWords.push({ word, order: offset.order.value });
          } else {
            // MUDANÇA 3 (A MAIS IMPORTANTE): Envolver o componente principal com React.memo
            bankWords.push({ word, order: offset.order.value });
          }
        }
        return {
          answered: answeredWords
            .sort((a, b) => a.order - b.order)
            .map((w) => w.word),
          bank: bankWords.sort((a, b) => a.order - b.order).map((w) => w.word),
        };
      },
      getAnsweredWords: () => {
        const answeredWords: { word: string; order: number }[] = [];
        for (let i = 0; i < offsets.length; i++) {
          const offset = offsets[i]!;
          if (offset.order.value !== -1) {
            const word = words[i]!;
            answeredWords.push({ word, order: offset.order.value });
          }
        }
        return answeredWords
          .sort((a, b) => a.order - b.order)
          .map((w) => w.word);
      },
      getOffsets() {
        return offsets.map((o) => o.order.value);
      },
      setOffsets(newOffsets: number[]) {
        for (let i = 0; i < newOffsets.length; i++) {
          offsets[i]!.order.value = newOffsets[i]!;
        }
        calculateLayout(
          offsets,
          containerWidth,
          wordHeight,
          wordGap,
          lineGap,
          rtl
        );
      },
      reorderWords: () => {
        reorderWordsFn();
      },
      reorderOneWord: () => {
        const usedIndices = new Array(target.length).fill(false);
        const newOrders = words.map((word) => {
          for (let i = 0; i < target.length; i++) {
            if (target[i] === word && !usedIndices[i]) {
              usedIndices[i] = true;
              return i;
            }
          }
          return -1;
        });
        for (let i = 0; i < offsets.length; i++) {
          offsets[i]!.order.value = newOrders[i]!;
        }
        calculateLayout(
          offsets,
          containerWidth,
          wordHeight,
          wordGap,
          lineGap,
          rtl
        );
      },
      // Esta função precisa ser async por causa do requestAnimationFrame
      reorderWordsTwice: async () => {
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(null))
        );
        reorderWordsFn();
        setTimeout(() => {
          reorderWordsFn();
        }, 16);
      },
    }));

    const initialized = layout && containerWidth > 0;

    useEffect(() => {
      if (initialized) {
        calculateLayout(
          offsets,
          containerWidth,
          wordHeight,
          wordGap,
          lineGap,
          rtl
        );
      }
    }, [
      initialized,
      rtl,
      offsets,
      containerWidth,
      wordHeight,
      wordGap,
      lineGap,
    ]);

    useEffect(() => {
      onReady?.(!!initialized);
    }, [initialized, onReady]);

    useEffect(() => {
      setLayout(null);
    }, [wordBankOffsetY, wordBankAlignment, wordGap, wordHeight]);

    if (!initialized) {
      return (
        <ComputeWordLayout
          offsets={offsets}
          onContainerWidth={setContainerWidth}
          onLayout={setLayout}
          wordHeight={wordHeight}
          lineHeight={lineHeight}
          wordBankAlignment={wordBankAlignment}
          wordBankOffsetY={wordBankOffsetY}
          wordGap={wordGap}
        >
          {wordElements}
        </ComputeWordLayout>
      );
    }

    const { numLines, wordStyles } = layout;
    const idealNumLines = numLines < 3 ? numLines + 1 : numLines;
    const linesContainerHeight = idealNumLines * lineHeight || lineHeight;
    const wordBankHeight =
      numLines * (wordHeight + wordGap * 2) + wordBankOffsetY * 2;

    const PlaceholderComponent = renderPlaceholder || Placeholder;
    const LinesComponent = renderLines || Lines;

    return (
      <View style={styles.container}>
        <LinesComponent
          numLines={idealNumLines}
          containerHeight={linesContainerHeight}
          lineHeight={lineHeight}
        />
        <View style={{ minHeight: wordBankHeight }} />
        {wordElements.map((child, index) => (
          <Fragment key={`${words[index]}-f-${index}`}>
            {renderPlaceholder === null ? null : (
              <PlaceholderComponent style={wordStyles[index] as any} />
            )}
            <SortableWord
              offsets={offsets}
              index={index}
              rtl={Boolean(rtl)}
              containerWidth={containerWidth}
              gesturesDisabled={Boolean(gesturesDisabled)}
              lineGap={lineGap}
              wordHeight={wordHeight}
              wordGap={wordGap}
              wordBankOffsetY={wordBankOffsetY}
              animatedStyleWorklet={animatedStyleWorklet}
              onDrop={onDrop}
            >
              {child}
            </SortableWord>
          </Fragment>
        ))}
      </View>
    );
  }
);

export default React.memo(DuoDragDrop);
