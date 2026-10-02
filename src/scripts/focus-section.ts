// After a jump to a section, the keyboard carries on from its heading (without scrolling again).
export function focusSection(target: HTMLElement): void {
  const heading = target.querySelector<HTMLElement>('h1, h2') ?? target;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}
