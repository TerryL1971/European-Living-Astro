// src/data/pcsGuideContacts.ts
//
// Key-contacts reference grid for the PCS Guide — rendered by
// src/components/pcs-guide/KeyContacts.astro.

export interface Contact {
  label: string;
  number: string;
  note: string;
}

export const KEY_CONTACTS: Contact[] = [
  {
    label: 'German Emergency Services',
    number: '112 (Fire/Medical) / 110 (Police)',
    note: 'Works from any phone in Germany',
  },
  {
    label: 'TRICARE Europe',
    number: '1-888-777-8343',
    note: 'Available 24/7 from Germany',
  },
  {
    label: 'Frankfurt Airport (FRA)',
    number: '+49 69 690 0',
    note: 'Main passenger terminal',
  },
  {
    label: 'US Embassy Berlin',
    number: '+49 30 8305 0',
    note: 'Consular services and emergencies',
  },
  {
    label: 'US Army Europe Emergency',
    number: 'DSN 118',
    note: 'On-post emergency line — confirm current DSN routing with your installation',
  },
  {
    label: 'USAREUR Transportation',
    number: 'Check your installation directory',
    note: 'HHG and vehicle shipping questions — numbers vary by installation',
  },
];