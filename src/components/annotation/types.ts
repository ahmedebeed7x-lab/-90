export type AnnotationTool = 'cursor' | 'pen' | 'highlighter' | 'laser' | 'eraser';

export interface AnnotationPoint {
  x: number;
  y: number;
  pressure: number;
  t: number;
}

export type AnnotationShape =
  | {
      type: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      /** Smooth quadratic Bezier curved line / arch / curved underline */
      type: 'arc';
      x1: number;
      y1: number;
      cx: number;
      cy: number;
      x2: number;
      y2: number;
    }
  | {
      /** Circle or optionally rotated ellipse */
      type: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rotation?: number;
    }
  | {
      /** Triangles, rectangles, squares, diamonds, checkmarks, square brackets, or closed polygons */
      type: 'polygon';
      points: Array<{ x: number; y: number }>;
      closed: boolean;
    }
  | {
      /** Geometric pointer arrow (single or bidirectional `<--->`) with straight or smoothly curved shaft */
      type: 'arrow';
      x1: number;
      y1: number;
      cx?: number;
      cy?: number;
      x2: number;
      y2: number;
      leftX: number;
      leftY: number;
      rightX: number;
      rightY: number;
      bidirectional?: boolean;
      tailLeftX?: number;
      tailLeftY?: number;
      tailRightX?: number;
      tailRightY?: number;
    }
  | {
      /** Calligraphic curly brace `{ }` or horizontal bracket `︷ ︸` */
      type: 'brace';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      depth: number;
    }
  | {
      /** Ultra-smooth idealized freeform curve (e.g. S-curve, wave, tilde, flourish) */
      type: 'curve';
      points: Array<{ x: number; y: number }>;
    };

export interface SelectedStrokeRef {
  surfaceId: string;
  strokeId: string;
}

export interface AnnotationStroke {
  id: string;
  kind: 'pen' | 'highlighter';
  color: string;
  size: number;
  opacity: number;
  smoothing?: number;
  points: AnnotationPoint[];
  shape?: AnnotationShape;
}

export type SizeSlotIndex = 0 | 1 | 2;
export type ColorSlotIndex = 0 | 1 | 2;

export interface PenSettings {
  color: string;
  colorSlots: [string, string, string];
  activeColorSlot: ColorSlotIndex;
  size: number;
  sizeSlots: [number, number, number];
  activeSizeSlot: SizeSlotIndex;
  opacity: number;
  smoothing: number;
  smartShapes: boolean;
  scribbleErase: boolean;
}

export interface HighlighterSettings {
  color: string;
  colorSlots: [string, string, string];
  activeColorSlot: ColorSlotIndex;
  size: number;
  sizeSlots: [number, number, number];
  activeSizeSlot: SizeSlotIndex;
  opacity: number;
  smoothing: number;
  straightAssist: boolean;
}

export interface LaserSettings {
  color: string;
  colorSlots: [string, string, string];
  activeColorSlot: ColorSlotIndex;
  mode: 'trail' | 'dot';
  size: number;
  smoothing: number;
}

export interface EraserSettings {
  size: number;
  sizeSlots: [number, number, number];
  activeSizeSlot: SizeSlotIndex;
}

export type SizableAnnotationTool = 'pen' | 'highlighter' | 'eraser';
export type ColorableAnnotationTool = 'pen' | 'highlighter' | 'laser';

export const SIZE_DIAL_MIN = 5;
export const SIZE_DIAL_MAX = 100;
export const SIZE_DIAL_STEP = 5;

/** Snaps any raw thickness percentage to a clean 5% detent within 5%..100%. */
export function snapSizeLevel(level: number): number {
  const snapped = Math.round(level / SIZE_DIAL_STEP) * SIZE_DIAL_STEP;
  return Math.max(SIZE_DIAL_MIN, Math.min(SIZE_DIAL_MAX, snapped));
}

/**
 * Converts a unified 5..100 thickness dial percentage (in 5% steps) into calibrated canvas pixels per tool.
 * Pen uses a gentle power curve so 5%..35% gives crisp Mushaf precision while 100% reaches bold marker width.
 */
export function sizeLevelToPx(tool: SizableAnnotationTool, level: number): number {
  const clamped = Math.max(SIZE_DIAL_MIN, Math.min(SIZE_DIAL_MAX, Math.round(level)));
  const t = (clamped - SIZE_DIAL_MIN) / (SIZE_DIAL_MAX - SIZE_DIAL_MIN);
  if (tool === 'pen') {
    return Math.round((1.3 + Math.pow(t, 1.32) * 16.7) * 100) / 100;
  }
  if (tool === 'highlighter') {
    return Math.round((10 + t * 46) * 10) / 10;
  }
  return Math.round((12 + t * 52) * 10) / 10;
}

/**
 * Inverse mapping from canvas pixels back to the nearest 5% dial detent (5..100).
 */
export function pxToSizeLevel(tool: SizableAnnotationTool, px: number): number {
  let t = 0;
  if (tool === 'pen') {
    const norm = Math.max(0, Math.min(1, (px - 1.3) / 16.7));
    t = Math.pow(norm, 1 / 1.32);
  } else if (tool === 'highlighter') {
    t = Math.max(0, Math.min(1, (px - 10) / 46));
  } else {
    t = Math.max(0, Math.min(1, (px - 12) / 52));
  }
  return snapSizeLevel(SIZE_DIAL_MIN + t * (SIZE_DIAL_MAX - SIZE_DIAL_MIN));
}

export interface ColorSwatch {
  id: string;
  hex: string;
  label: string;
}

export const APPLE_PEN_COLORS: readonly ColorSwatch[] = [
  { id: 'crimson', hex: '#FF3B30', label: 'أحمر أبل للتنبيه' },
  { id: 'royal', hex: '#007AFF', label: 'أزرق أبل للشرح' },
  { id: 'ink', hex: '#1C1C1E', label: 'حبر أسود داكن' },
  { id: 'emerald', hex: '#28B84D', label: 'أخضر للإجادة' },
  { id: 'amber', hex: '#FF9500', label: 'برتقالي دافئ' },
  { id: 'plum', hex: '#AF52DE', label: 'بنفسجي هادئ' },
];

export const APPLE_HIGHLIGHTER_COLORS: readonly ColorSwatch[] = [
  { id: 'sunbeam', hex: '#FFE84D', label: 'أصفر أبل المشرق' },
  { id: 'mint', hex: '#6CE89B', label: 'أخضر نعناعي' },
  { id: 'sky', hex: '#6AD0FF', label: 'أزرق سماوي' },
  { id: 'rose', hex: '#FF85B8', label: 'وردي ناعم' },
  { id: 'peach', hex: '#FFBA5C', label: 'مشمشي دافئ' },
  { id: 'lilac', hex: '#C89BFF', label: 'بنفسجي فاتح' },
];

export const APPLE_LASER_COLORS: readonly ColorSwatch[] = [
  { id: 'ruby', hex: '#FF2D55', label: 'ليزر ياقوتي' },
  { id: 'cyan', hex: '#00B8FF', label: 'ليزر أزرق ضوئي' },
  { id: 'emerald', hex: '#10D978', label: 'ليزر زمردي' },
  { id: 'solar', hex: '#FF9F0A', label: 'ليزر ذهبي' },
];

const DEFAULT_PEN_SLOTS: [number, number, number] = [
  sizeLevelToPx('pen', 15),
  sizeLevelToPx('pen', 25),
  sizeLevelToPx('pen', 50),
];

const DEFAULT_HIGHLIGHTER_SLOTS: [number, number, number] = [
  sizeLevelToPx('highlighter', 20),
  sizeLevelToPx('highlighter', 35),
  sizeLevelToPx('highlighter', 65),
];

const DEFAULT_ERASER_SLOTS: [number, number, number] = [
  sizeLevelToPx('eraser', 15),
  sizeLevelToPx('eraser', 30),
  sizeLevelToPx('eraser', 60),
];

const DEFAULT_PEN_COLOR_SLOTS: [string, string, string] = ['#FF3B30', '#007AFF', '#28B84D'];
const DEFAULT_HIGHLIGHTER_COLOR_SLOTS: [string, string, string] = ['#FFE84D', '#6CE89B', '#6AD0FF'];
const DEFAULT_LASER_COLOR_SLOTS: [string, string, string] = ['#FF2D55', '#00B8FF', '#10D978'];

export const DEFAULT_PEN_SETTINGS: PenSettings = {
  color: DEFAULT_PEN_COLOR_SLOTS[0],
  colorSlots: DEFAULT_PEN_COLOR_SLOTS,
  activeColorSlot: 0,
  size: DEFAULT_PEN_SLOTS[1],
  sizeSlots: DEFAULT_PEN_SLOTS,
  activeSizeSlot: 1,
  opacity: 0.96,
  smoothing: 0.78,
  smartShapes: true,
  scribbleErase: true,
};

export const DEFAULT_HIGHLIGHTER_SETTINGS: HighlighterSettings = {
  color: DEFAULT_HIGHLIGHTER_COLOR_SLOTS[0],
  colorSlots: DEFAULT_HIGHLIGHTER_COLOR_SLOTS,
  activeColorSlot: 0,
  size: DEFAULT_HIGHLIGHTER_SLOTS[1],
  sizeSlots: DEFAULT_HIGHLIGHTER_SLOTS,
  activeSizeSlot: 1,
  opacity: 0.56,
  smoothing: 0.76,
  straightAssist: true,
};

export const DEFAULT_LASER_SETTINGS: LaserSettings = {
  color: DEFAULT_LASER_COLOR_SLOTS[0],
  colorSlots: DEFAULT_LASER_COLOR_SLOTS,
  activeColorSlot: 0,
  mode: 'trail',
  size: 4.6,
  smoothing: 0.75,
};

export const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  size: DEFAULT_ERASER_SLOTS[1],
  sizeSlots: DEFAULT_ERASER_SLOTS,
  activeSizeSlot: 1,
};
