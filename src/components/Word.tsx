import { useContext } from 'react';
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

// Constantes de cor para melhor legibilidade e manutenção
const BASE_TEXT_COLOR = '#fff';
const HIGHLIGHT_TEXT_COLOR = '#1EA0E7';

export interface WordProps {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isErrored?: boolean;
  isCorrect?: boolean;
  highlightColor?: string; // Não usado no código atual, mas mantido na interface
}

export default function Word({
  containerStyle,
  textStyle,
  isErrored,
  isCorrect,
}: WordProps) {
  const { wordHeight, text, wordGap, wordsOfKnowledge } =
    useContext(WordContext);

  // Lógica para determinar o texto a ser exibido e se deve ser destacado
  const cleanedText = text.replace(/\*/g, '');
  const shouldHighlight =
    text.includes('*') ||
    wordsOfKnowledge?.some((word) => word === cleanedText);
  const displayedText = shouldHighlight ? cleanedText : text;

  // Lógica para determinar a cor do texto
  const dynamicTextColor =
    isErrored || isCorrect ? BASE_TEXT_COLOR : HIGHLIGHT_TEXT_COLOR;
  const finalTextColor = shouldHighlight ? dynamicTextColor : BASE_TEXT_COLOR; // Aplica a cor do destaque ou a cor base

  return (
    <View
      style={[
        styles.baseContainer, // Estilo base do container
        { height: wordHeight, margin: wordGap, marginBottom: wordGap * 2 },
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          textStyle,
          { color: finalTextColor }, // Aplica a cor final ao texto
        ]}
        allowFontScaling={false}
        numberOfLines={1}
      >
        {displayedText}
      </Text>
    </View>
  );
}

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
