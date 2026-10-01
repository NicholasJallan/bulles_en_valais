// Styleguide controller: a radio group sets `data-<name>` on <html> and remembers the choice.
import type { Cleanup } from '@/lib/controllers.ts';

const STORAGE_PREFIX = 'bv-styleguide-';
export const SWITCH_EVENT = 'styleguide:switch';

export interface SwitchDetail {
  readonly name: string;
  readonly value: string;
}

function readChoice(name: string): string | null {
  try {
    return localStorage.getItem(STORAGE_PREFIX + name);
  } catch {
    return null; // storage blocked: start from the default choice
  }
}

function saveChoice(name: string, value: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + name, value);
  } catch {
    // storage blocked: the choice lasts until the page is reloaded
  }
}

function apply(name: string, value: string): void {
  document.documentElement.dataset[name] = value;
  const detail: SwitchDetail = { name, value };
  document.dispatchEvent(new CustomEvent(SWITCH_EVENT, { detail }));
}

export function init(fieldset: HTMLElement): Cleanup {
  const name = fieldset.dataset.switch;
  if (name === undefined || name === '') throw new Error('styleguide-switch needs data-switch');
  const inputs = Array.from(fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  const saved = readChoice(name);
  const initial =
    inputs.find((input) => input.value === saved) ?? inputs.find((input) => input.checked);
  if (initial !== undefined) {
    initial.checked = true;
    apply(name, initial.value);
  }

  const onChange = (event: Event): void => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    apply(name, input.value);
    saveChoice(name, input.value);
  };
  fieldset.addEventListener('change', onChange);
  return () => fieldset.removeEventListener('change', onChange);
}
