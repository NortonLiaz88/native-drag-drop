import { NativeModules, Platform } from 'react-native';

// Tipos que você já exportava, vamos defini-los aqui para referência
// Você provavelmente já tem isso em seu arquivo @types/index.ts, então a importação pode ser diferente.
// O importante é remover a importação do antigo arquivo 'NativeLegacyDragDrop'.
type LayoutPosition = {
  x: number;
  y: number;
};

type WordMeasurement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Mensagem de erro clara caso o módulo nativo não seja encontrado
const LINKING_ERROR =
  `The package 'react-native-legacy-drag-drop' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// Acessa o módulo nativo de forma segura. Se não existir, cria um "proxy" que dará um erro claro.
const LegacyDragDrop = NativeModules.LegacyDragDrop
  ? NativeModules.LegacyDragDrop
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// MUDANÇA: Todas as funções wrapper agora são ASYNC e usam AWAIT
export function multiply(
  a: number,
  b: number,
  callback: (error: any, result: number) => void
) {
  LegacyDragDrop.multiply(a, b, callback);
}

export async function move(
  input: number[],
  from: number,
  to: number,
  callback: (error: any, result: number) => void
): Promise<number[]> {
  return await LegacyDragDrop.move(input, from, to, callback);
}

export async function between(
  value: number,
  min: number,
  max: number,
  inclusive: boolean,
  callback: (error: any, result: number) => void
): Promise<boolean> {
  return await LegacyDragDrop.between(value, min, max, inclusive, callback);
}

export async function lastOrder(
  orders: number[],
  callback: (error: any, result: number) => void
): Promise<number> {
  return await LegacyDragDrop.lastOrder(orders, callback);
}

export async function remove(
  orders: number[],
  index: number,
  callback: (error: any, result: number) => void
): Promise<number[]> {
  return await LegacyDragDrop.remove(orders, index, callback);
}

export async function reorder(
  orders: number[],
  from: number,
  to: number,
  callback: (error: any, result: number) => void
): Promise<number[]> {
  return await LegacyDragDrop.reorder(orders, from, to, callback);
}

export async function measureWords(
  viewTags: number[],
  callback: (error: any, result: number) => void
): Promise<WordMeasurement[]> {
  return await LegacyDragDrop.measureWords(viewTags, callback);
}

export async function calculateLayout(
  orders: number[],
  widths: number[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl: boolean,
  callback: (error: any, result: number) => void
): Promise<LayoutPosition[]> {
  return await LegacyDragDrop.calculateLayout(
    orders,
    widths,
    containerWidth,
    wordHeight,
    wordGap,
    lineGap,
    rtl,
    callback
  );
}
// Re-exportando seus componentes React
export { default as DuoDragDrop } from './components/DuoDragDrop';
export { default as SortableWord } from './components/SortableWord';
export { default as Placeholder } from './components/Placeholder';
export { default as Word } from './components/Word';
export { default as Lines } from './components/Lines';

// Re-exportando seus tipos
export type {
  DuoWordAnimatedStyle,
  DuoAnimatedStyleWorklet,
  OnDropFunction,
  DropEvent,
  DuoDragDropRef,
} from './@types/index';
