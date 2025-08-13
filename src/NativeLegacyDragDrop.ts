import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type WordMeasurement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutPosition = {
  x: number;
  y: number;
};

export interface Spec extends TurboModule {
  // Todas as funções devem retornar uma Promise, espelhando o código nativo.
  multiply(a: number, b: number): Promise<number>;

  move(input: number[], from: number, to: number): Promise<number[]>;
  between(
    value: number,
    min: number,
    max: number,
    inclusive: boolean
  ): Promise<boolean>;
  lastOrder(orders: number[]): Promise<number>;
  remove(orders: number[], index: number): Promise<number[]>;
  reorder(orders: number[], from: number, to: number): Promise<number[]>;
  measureWords(viewTags: number[]): Promise<WordMeasurement[]>;
  calculateLayout(
    orders: number[],
    widths: number[],
    containerWidth: number,
    wordHeight: number,
    wordGap: number,
    lineGap: number,
    rtl: boolean
  ): Promise<LayoutPosition[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LegacyDragDrop');
