// Gift voucher offers (I-12): their texts are in the dictionaries (gifts.offers); the price of the
// try-dive comes from the course catalogue.
import type { CourseId } from './courses.ts';

export interface GiftOffer {
  readonly id: string;
  /** Course whose price the offer shows. */
  readonly course?: CourseId;
}

export const GIFT_OFFERS = [
  { id: 'baptism', course: 'padi-dsd' },
  { id: 'course' },
  { id: 'amount' },
] as const satisfies readonly GiftOffer[];

export type GiftOfferId = (typeof GIFT_OFFERS)[number]['id'];
