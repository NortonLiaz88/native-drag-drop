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
  multiply(a: number, b: number): number;

  move(input: number[], from: number, to: number): number[];
  between(value: number, min: number, max: number, inclusive: boolean): boolean;
  lastOrder(orders: number[]): number;
  remove(orders: number[], index: number): number[];
  reorder(orders: number[], from: number, to: number): number[];
  measureWords(viewTags: number[]): WordMeasurement[];
  calculateLayout(
    orders: number[],
    widths: number[],
    containerWidth: number,
    wordHeight: number,
    wordGap: number,
    lineGap: number,
    rtl: boolean
  ): LayoutPosition[];
}

export default TurboModuleRegistry.getEnforcing<Spec>('LegacyDragDrop');
