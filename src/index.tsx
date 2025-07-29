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
export async function multiply(a: number, b: number): Promise<number> {
  return await LegacyDragDrop.multiply(a, b);
}

export async function move(
  input: number[],
  from: number,
  to: number
): Promise<number[]> {
  return await LegacyDragDrop.move(input, from, to);
}

export async function between(
  value: number,
  min: number,
  max: number,
  inclusive: boolean
): Promise<boolean> {
  return await LegacyDragDrop.between(value, min, max, inclusive);
}

export async function lastOrder(orders: number[]): Promise<number> {
  return await LegacyDragDrop.lastOrder(orders);
}

export async function remove(
  orders: number[],
  index: number
): Promise<number[]> {
  return await LegacyDragDrop.remove(orders, index);
}

export async function reorder(
  orders: number[],
  from: number,
  to: number
): Promise<number[]> {
  return await LegacyDragDrop.reorder(orders, from, to);
}

export async function measureWords(
  viewTags: number[]
): Promise<WordMeasurement[]> {
  return await LegacyDragDrop.measureWords(viewTags);
}

export async function calculateLayout(
  orders: number[],
  widths: number[],
  containerWidth: number,
  wordHeight: number,
  wordGap: number,
  lineGap: number,
  rtl: boolean
): Promise<LayoutPosition[]> {
  return await LegacyDragDrop.calculateLayout(
    orders,
    widths,
    containerWidth,
    wordHeight,
    wordGap,
    lineGap,
    rtl
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
