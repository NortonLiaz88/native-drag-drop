/* eslint-disable react-native/no-inline-styles */
import { useRef, useState } from 'react';
import { Text, View, StyleSheet, Button, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Usando o nome da nova biblioteca
import {
  DuoDragDrop,
  Word,
  Lines,
  Placeholder,
  multiply,
  reorder,
  remove,
  move,
  between,
  lastOrder,
} from 'react-native-legacy-drag-drop';
import type { DuoDragDropRef } from 'react-native-legacy-drag-drop';

export default function App() {
  const [rtl, setRtl] = useState(false);
  const [gradeWords, setGradeWords] = useState<boolean[]>([]);
  const [gesturesDisabled, setGesturesDisabled] = useState(false);
  const [answeredWords, setAnsweredWords] = useState<string[] | null>(null);
  const [shouldUseCustomWorket, setShouldUseCustomWorket] = useState(false);
  const duoDragDropRef = useRef<DuoDragDropRef>(null);
  const [log, setLog] = useState<string[]>([]);

  const words = [
    'Juan',
    'She',
    'apples',
    'today',
    'with',
    'eats',
    'her',
    'another',
    'banana',
    'car',
    'runs',
    'quickly',
    'blue',
    'house',
    'window',
    'morning',
    'coffee',
    'reads',
    'book',
    'school',
    'teacher',
    'writes',
    'letter',
    'music',
    'dance',
    'friend',
    'lunch',
    'garden',
    'dog',
    'cat',
    'water',
    'glass',
    'happy',
    'walks',
    'street',
    'quiet',
    'light',
    'night',
    'stars',
    'sky',
    'phone',
    'calls',
    'family',
    'smile',
    'child',
    'games',
    'learn',
    'green',
    'tree',
    'chair',
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        <View style={styles.dragDropContainer}>
          {/* O componente DuoDragDrop não precisa de mudanças aqui */}
          <DuoDragDrop
            target={words}
            ref={duoDragDropRef}
            words={words}
            wordHeight={40}
            lineHeight={49}
            wordGap={4}
            gesturesDisabled={gesturesDisabled}
            rtl={rtl}
            wordBankOffsetY={10}
            wordBankAlignment="center"
            extraData={gradeWords}
            onDrop={(ev) => {
              const { destination, index, position } = ev;
              setLog((l) => [
                ...l,
                `[onDrop] Dropped word '${words[index]}' on '${destination}' at position ${position}`,
              ]);
            }}
            renderWord={(_word, index) => (
              <Word
                containerStyle={
                  typeof gradeWords?.[index] === 'boolean' && {
                    backgroundColor: gradeWords?.[index] ? 'green' : 'red',
                    borderColor: gradeWords?.[index] ? 'green' : 'red',
                  }
                }
                textStyle={{
                  color:
                    typeof gradeWords?.[index] === 'boolean'
                      ? 'white'
                      : 'black',
                }}
              />
            )}
            renderPlaceholder={({ style }) => (
              <Placeholder style={[style, { borderRadius: 5 }]} />
            )}
            renderLines={(props) => (
              <Lines
                {...props}
                containerStyle={{ backgroundColor: 'transparent' }}
                lineStyle={{ borderColor: '#CCC' }}
              />
            )}
          />
          {/* Os botões de controle do componente principal não precisam de mudanças */}
          <Button
            title="Get answered words"
            onPress={() =>
              setAnsweredWords(duoDragDropRef.current?.getAnsweredWords() || [])
            }
          />
          {answeredWords && (
            <View style={{ marginTop: 10 }}>
              <Text>{JSON.stringify(answeredWords)}</Text>
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            <Button
              title="Grade words"
              onPress={() => {
                if (gradeWords.length > 0) {
                  setGradeWords([]);
                } else {
                  setGradeWords([
                    true,
                    false,
                    true,
                    false,
                    false,
                    true,
                    false,
                    false,
                  ]);
                }
              }}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button
              title={`Gestures disabled: ${gesturesDisabled}`}
              onPress={() => setGesturesDisabled((s) => !s)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button
              title={`Use custom animations: ${shouldUseCustomWorket}`}
              onPress={() => setShouldUseCustomWorket((s) => !s)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button
              title={`Right-To-Left: ${rtl}`}
              onPress={() => setRtl((s) => !s)}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button
              title={`Reorder`}
              onPress={() => {
                duoDragDropRef.current?.reorderWordsTwice();
              }}
            />
          </View>
        </View>

        {/* ================================================================= */}
        {/* CORREÇÃO: Todos os botões de teste agora usam o padrão de Callback */}
        {/* ================================================================= */}
        <Button
          title="multiply 3 * 4"
          onPress={() => {
            multiply(3, 4, (error, result) => {
              if (error) console.error(error);
              console.log('multiply result:', result);
            });
          }}
        />
        <Button
          title="move [0,1,2,3] from 1 to 3"
          onPress={() => {
            move([0, 1, 2, 3], 1, 3, (error, result) => {
              if (error) console.error(error);
              console.log('move result:', result);
            });
          }}
        />
        <Button
          title="between 5 in [1,10]"
          onPress={() => {
            between(5, 1, 10, true, (error, result) => {
              if (error) console.error(error);
              console.log('between result:', result);
            });
          }}
        />
        <Button
          title="lastOrder [-1, 0, 1, -1]"
          onPress={() => {
            lastOrder([-1, 0, 1, -1], (error, result) => {
              if (error) console.error(error);
              console.log('lastOrder result:', result);
            });
          }}
        />
        <Button
          title="remove index 2 from [0,1,2,3]"
          onPress={() => {
            remove([0, 1, 2, 3], 2, (error, result) => {
              if (error) console.error(error);
              console.log('remove result:', result);
            });
          }}
        />
        <Button
          title="reorder [0,1,2] from 2 to 0"
          onPress={() => {
            reorder([0, 1, 2], 2, 0, (error, result) => {
              if (error) console.error(error);
              console.log('reorder result:', result);
            });
          }}
        />
      </ScrollView>

      <View style={styles.logContainer}>
        <Text style={styles.debugLogText}>EVENT LOG</Text>
        <ScrollView>
          {log.map((l, i) => (
            <Text key={i}>{l}</Text>
          ))}
          {log.length === 0 && <Text>No events</Text>}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dragDropContainer: {
    margin: 20,
    flex: 1,
  },
  debugLogText: {
    fontWeight: '500',
  },
  logContainer: {
    height: 130,
    padding: 5,
  },
});
