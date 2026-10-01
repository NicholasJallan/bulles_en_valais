/** Teaching credentials of Nicholas, SDI/TDI first (as everywhere since S00). */
export interface Credential {
  readonly id: string;
  /** Issuing body or diploma: « PADI », « DEJEPS ». */
  readonly issuer: string;
  /** Grade and number: « MSDT #525399 ». */
  readonly detail: string;
  /** Public register where the credential can be checked. */
  readonly verifyUrl?: string;
}

export const CREDENTIALS = [
  { id: 'sdi-tdi', issuer: 'SDI/TDI', detail: '#35812' },
  { id: 'padi', issuer: 'PADI', detail: 'MSDT #525399' },
  { id: 'ffessm', issuer: 'FFESSM', detail: 'E4' },
  {
    id: 'dejeps',
    issuer: 'DEJEPS',
    detail: '07425ED0350',
    verifyUrl: 'https://recherche-educateur.sports.gouv.fr/CartePro/07425ED0350',
  },
  { id: 'cah', issuer: 'CAH', detail: '2B' },
] as const satisfies readonly Credential[];
