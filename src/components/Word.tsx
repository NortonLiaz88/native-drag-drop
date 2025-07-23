import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import WordContext from './WordContext';
import { colors } from '../utils/colors';

// Constantes movidas para o escopo do módulo para não serem recriadas
const BASE_TEXT_COLOR = '#fff';
const HIGHLIGHT_TEXT_COLOR = '#1EA0E7';

export interface WordProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isErrored?: boolean;
  isCorrect?: boolean;
  testID?: string;
}

// MUDANÇA 1: O StyleSheet.create foi movido para fora do componente.
// Isso garante que o objeto de estilos seja criado apenas uma vez, e não a cada renderização.
const styles = StyleSheet.create({
  baseContainer: {
    marginTop: 0,
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 16,
  },
});

const WordComponent = ({
  containerStyle,
  textStyle,
  isErrored,
  isCorrect,
  testID,
}: WordProps) => {
  const { wordHeight, text, wordGap, wordsOfKnowledge } =
    useContext(WordContext);

  // MUDANÇA 2: Os cálculos foram envolvidos em `useMemo`.
  // Isso garante que essa lógica só seja re-executada se `text` ou `wordsOfKnowledge` mudarem.
  const { displayedText, shouldHighlight } = useMemo(() => {
    const cleaned = text.replace(/\*/g, '');
    const highlight =
      text.includes('*') || wordsOfKnowledge?.some((word) => word === cleaned);
    return {
      displayedText: highlight ? cleaned : text,
      shouldHighlight: highlight,
    };
  }, [text, wordsOfKnowledge]);

  // A cor do texto também é memoizada para evitar recálculos
  const finalTextColor = useMemo(() => {
    const dynamicColor =
      isErrored || isCorrect ? BASE_TEXT_COLOR : HIGHLIGHT_TEXT_COLOR;
    return shouldHighlight ? dynamicColor : BASE_TEXT_COLOR;
  }, [isErrored, isCorrect, shouldHighlight]);

  // Os arrays de estilo também são memoizados para evitar que novos arrays sejam criados em cada render.
  const finalContainerStyle = useMemo(
    () => [
      styles.baseContainer,
      { height: wordHeight, margin: wordGap, marginBottom: wordGap * 2 },
      containerStyle,
    ],
    [wordHeight, wordGap, containerStyle]
  );

  const finalTextStyle = useMemo(
    () => [styles.text, textStyle, { color: finalTextColor }],
    [textStyle, finalTextColor]
  );

  return (
    <View testID={testID} style={finalContainerStyle}>
      <Text style={finalTextStyle} allowFontScaling={false} numberOfLines={1}>
        {displayedText}
      </Text>
    </View>
  );
};

// MUDANÇA 3 (A MAIS IMPORTANTE): O componente é envolvido com React.memo.
export default React.memo(WordComponent);
