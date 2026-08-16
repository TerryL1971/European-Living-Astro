// src/data/pcsGuideFaq.ts
//
// PCS Guide FAQ content — pure data, rendered by
// src/components/pcs-guide/FaqAccordion.astro.
//
// Same accuracy pass as pcsGuidePhases.ts: the TLA and driver's-license
// answers below were softened from the original's flat "60 days" / "6
// months" claims to match AEA Regulation 190-1 and current TLA policy
// being circumstance-dependent rather than a single universal number.

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is SOFA status and why does it matter in Germany?',
    answer:
      'SOFA stands for Status of Forces Agreement — a bilateral agreement between the US and Germany defining the legal status of US military personnel and their dependents living in Germany. SOFA status carries real, practical protections: exemption from German income tax on military pay, exemption from German VAT on many purchases (via the VAT form), the right to use on-post facilities, and specific provisions for driving, importing vehicles, and registering your address. Exactly which protections apply to you depends on your category — active duty, command-sponsored dependent, DoD civilian, contractor, or NAF employee all have meaningfully different rules, so confirm your specific status with your installation\'s SOFA office.',
  },
  {
    question: 'How long does it take for household goods to arrive in Germany?',
    answer:
      'Unaccompanied baggage (UAB) — your priority shipment — typically takes a few weeks to arrive. Household goods (HHG) — your main shipment — typically takes 6–10 weeks or more, depending on origin, season, and shipping lane congestion. Plan to live out of suitcases and your UAB for a couple of months. Pack UAB with what you need daily: medications, kitchen basics, children\'s comfort items, and work uniforms.',
  },
  {
    question: 'Do I need to learn German before moving to Germany?',
    answer:
      'No, but it helps significantly off-post. Most Germans near US military installations speak functional English, particularly in stores, medical offices, and restaurants. Landlords, local government offices (Einwohnermeldeamt), and neighbors, though, often communicate mainly in German. Learning basic phrases — greetings, numbers, please and thank you — goes a long way. DuoLingo and Pimsleur are both commonly used by military families in the weeks before departure.',
  },
  {
    question: 'Can I bring my pet to Germany?',
    answer:
      'Yes, but with real requirements that combine DoD policy, EU/German rules, and airline-specific restrictions — all of which can change. Dogs and cats generally need a microchip, a valid rabies vaccination given after the microchip, and an EU pet passport or official health certificate. Certain dog breeds are commonly restricted or prohibited in Germany, including on US installations, regardless of your installation\'s own policy. Start the pet travel process at least 3 months before departure, and verify current breed restrictions and documentation requirements with your transportation office rather than an older post or guide.',
  },
  {
    question: 'What is TLA and how long can I receive it?',
    answer:
      'TLA stands for Temporary Lodging Allowance — a daily allowance covering temporary housing costs while you wait for permanent housing, whether on- or off-post. TLA begins the day you report and continues until you move into permanent housing, up to an authorized period set by current policy (extensions are possible in some cases with commander approval). Keep every receipt regardless — TLA is reimbursed against actual lodging costs, and the current authorized length is worth confirming with your finance office rather than assuming a fixed number.',
  },
  {
    question: 'Are US driver\'s licenses valid in Germany?',
    answer:
      'Your US state driver\'s license is valid for a limited window after you arrive, and you\'ll need a U.S. Forces Certificate of License to keep driving — the exact process and timeline runs through AEA Regulation 190-1 and depends on your license type and category (for example, holding a valid EU/German license or a US Forces license from elsewhere in Europe can waive parts of the process). An International Driving Permit (IDP) from AAA, obtained before you leave the US, is a translation of your license, not a standalone license, but it\'s useful during your transition. Confirm the current process and timeline with your installation\'s Vehicle Registration Office — this is exactly the kind of detail that\'s genuinely installation- and status-dependent rather than universal.',
  },
];