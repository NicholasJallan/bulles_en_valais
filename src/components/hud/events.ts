/** Fired on the document when the reader enters another section (`detail.id`). */
export const SECTION_EVENT = 'bv:section';

export interface SectionDetail {
  readonly id: string;
}
