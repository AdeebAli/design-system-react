import { warnOnce } from '../../utils/warn';

/** `Image`'s named ratios. Any positive number works too, such as `16 / 10`. */
export type ImageRatio = '1/1' | '4/3' | '3/2' | '16/9' | '21/9';

const presets: Record<ImageRatio, string> = {
  '1/1': '1 / 1',
  '4/3': '4 / 3',
  '3/2': '3 / 2',
  '16/9': '16 / 9',
  '21/9': '21 / 9',
};

const usable = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value) && value > 0;

/**
 * The frame's `aspect-ratio`: from `ratio`, else from both intrinsic sizes,
 * else none. A number that isn't finite and positive is ignored, with a warning.
 */
export function aspectRatio(
  ratio: ImageRatio | number | undefined,
  htmlWidth?: number,
  htmlHeight?: number,
): string | undefined {
  if (typeof ratio === 'string') return presets[ratio];
  if (typeof ratio === 'number') {
    if (usable(ratio)) return String(ratio);
    warnOnce(
      `Image-ratio-${String(ratio)}`,
      `Image: ratio={${String(ratio)}} is ignored. Use a preset, such as "16/9", or a positive number.`,
    );
  }
  if (usable(htmlWidth) && usable(htmlHeight))
    return `${htmlWidth} / ${htmlHeight}`;
  return undefined;
}
