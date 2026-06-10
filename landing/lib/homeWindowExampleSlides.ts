export type HomeWindowExampleSlide = {
  src: string;
  alt: string;
};

function slide(folder: string, num: string, windowCount: number, index: number): HomeWindowExampleSlide {
  return {
    src: `/images/home/${folder}/example-${num}.jpg`,
    alt: `Approved ${windowCount}-window qualifying example ${index}`,
  };
}

/** Approved 1-window examples — 4 slides (a–d). */
export const HOME_ONE_WINDOW_SLIDES: HomeWindowExampleSlide[] = [
  slide('one-window', '01', 1, 1),
  slide('one-window', '02', 1, 2),
  slide('one-window', '03', 1, 3),
  slide('one-window', '04', 1, 4),
];

/** Approved 2-window examples — 3 slides so far (a, b, d). */
export const HOME_TWO_WINDOW_SLIDES: HomeWindowExampleSlide[] = [
  slide('two-window', '01', 2, 1),
  slide('two-window', '02', 2, 2),
  slide('two-window', '04', 2, 3),
];

/** Approved 3-window examples — 2 slides so far (a, b). */
export const HOME_THREE_WINDOW_SLIDES: HomeWindowExampleSlide[] = [
  slide('three-window', '01', 3, 1),
  slide('three-window', '02', 3, 2),
];

/** Approved 4-window examples — 3 slides so far (a, b, d). */
export const HOME_FOUR_WINDOW_SLIDES: HomeWindowExampleSlide[] = [
  slide('four-window', '01', 4, 1),
  slide('four-window', '02', 4, 2),
  slide('four-window', '04', 4, 3),
];

const SLIDES_BY_WINDOW_COUNT: Record<number, HomeWindowExampleSlide[]> = {
  1: HOME_ONE_WINDOW_SLIDES,
  2: HOME_TWO_WINDOW_SLIDES,
  3: HOME_THREE_WINDOW_SLIDES,
  4: HOME_FOUR_WINDOW_SLIDES,
};

export function getHomeWindowExampleSlides(windowCount: number): HomeWindowExampleSlide[] {
  return SLIDES_BY_WINDOW_COUNT[windowCount] ?? [];
}

export function hasHomeWindowExampleSlides(windowCount: number): boolean {
  return getHomeWindowExampleSlides(windowCount).length > 0;
}