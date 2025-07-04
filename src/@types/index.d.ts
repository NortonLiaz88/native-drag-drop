import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

type TransformType =
  | { perspective: number }
  | { rotate: string }
  | { rotateX: string }
  | { rotateY: string }
  | { rotateZ: string }
  | { scale: number }
  | { scaleX: number }
  | { scaleY: number }
  | { translateX: number }
  | { translateY: number }
  | { skewX: string }
  | { skewY: string }
  | { matrix: number[] };

export type DuoWordAnimatedStyle = {
  position: any;
  top: number;
  left: number;
  zIndex: number;
  width: number;
  height: number;
  transform: [{ translateX: number }, { translateY: number }] & TransformType[];
};

export type DuoAnimatedStyleWorklet = (
  style: DuoWordAnimatedStyle & ViewStyle,
  isGestureActive: boolean
) => AnimatedStyle<ViewStyle>;

export type DropEvent = {
  index: number;
  destination: 'answered' | 'bank';
  position: number;
};

export type OnDropFunction = (event: DropEvent) => void;

export interface DuoDragDropProps {
  /** List of words that should be in the "Answer" pile */
  target: string[];
  /** List of words */
  words: string[];
  /** Re-renders the words when this value changes. */
  extraData?: any;
  /** Height of an individual word. Default: 45 */
  wordHeight?: number;
  /** The gap between each word / line: Default: 4 */
  wordGap?: number;
  /** The height of a single line in the top "answered" pile. Default: wordHeight * 1.2  */
  lineHeight?: number;
  /** The margin between the "Bank" pile and the "Answer" pile. Default: 20 */
  wordBankOffsetY?: number;
  /** Whether to lay out words in the "Answer" pile from right-to-left (for languages such as Arabic) */
  rtl?: boolean;
  /** Whether tap & drag gestures are disabled. Default: false */
  gesturesDisabled?: boolean;
  /** The offset between the "Bank" pile and the "Answer" pile. Default: 20 */
  wordBankAlignment?: 'center' | 'left' | 'right';
  /** Overrides the default Word renderer */
  renderWord?: (word: string, index: number) => JSX.Element;
  /** Overrides the default Lines renderer */
  renderLines?: (props: {
    numLines: number;
    containerHeight: number;
    lineHeight: number;
  }) => JSX.Element;
  /** Overrides the default Placeholder renderer */
  renderPlaceholder?:
    | ((props: {
        style: {
          position: 'absolute';
          height: number;
          top: number;
          left: number;
          width: number;
        };
      }) => JSX.Element)
    | null;
  /** Allows user to modify animation of the word while it's animating. NOTE: this must be a worklet */
  animatedStyleWorklet?: DuoAnimatedStyleWorklet;
  /** Runs when the drag-and-drop has rendered */
  onReady?: (ready: boolean) => void;
  /** Called when a user taps or drags a word to its destination */
  onDrop?: OnDropFunction;
}

export type DuoDragDropRef = {
  /** Returns an ordered list of words that are in the "word bank" as well as answered */
  getWords(): { answered: string[]; bank: string[] };
  /** Returns an array of words that are outside the "word bank" */
  getAnsweredWords(): string[];
  /**
   * Gets the order value of each word by the word's index.
   * -1 indicates that it's in the "bank"
   *
   * e.g. ["hello", "world", "foo", "bar"] -> [1, -1, 0, 2] corresponds to:
   * - ["hello", "foo", "bar"] (unordered) or
   * - ["foo", "hello", "bar"] (ordered) in the "answered" pile
   * - and ["world"] in the "bank" pile
   */
  getOffsets(): number[];
  /* Animates the word buttons to move to new positions */
  setOffsets(newOffsets: number[]): void;
  reorderWords: () => void;
  reorderOneWord: () => void;
  reorderWordsTwice: () => void;
};
