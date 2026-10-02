// Split lines are measured: wait for the web fonts, but never for long.

/** The reveals wait for the fonts, at most this long. */
const FONTS_TIMEOUT_MS = 1500;

export function fontsSettled(): Promise<unknown> {
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => window.setTimeout(resolve, FONTS_TIMEOUT_MS)),
  ]);
}
