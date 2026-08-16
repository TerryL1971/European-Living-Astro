// src/data/pcsGuidePhases.ts
//
// PCS Guide phase-timeline content — pure data, no styling. Rendered by
// src/components/pcs-guide/PhaseTimeline.astro.
//
// ACCURACY NOTE (see /areas/european-living-pcs-guide.md for the full
// review that drove this rewrite): the previous version of this content
// stated several regulation-derived numbers as flat universal rules
// (a 6-month USAREUR license window, a hard 60-day TLA cap, etc.) with
// more confidence than the underlying regs actually support. Every
// claim below is written to distinguish what's German law, what's
// DoD/USAREUR policy, what's installation-specific, and what's just
// practical advice — and points to the current official source instead
// of asserting a specific number where that number is circumstance-
// dependent or subject to change. Verified against AEA Regulation 190-1
// (current edition, Feb 2025) and official UTAP program pages as of
// Aug 2026 — re-verify before reusing if it's been a while.

export interface Resource {
  label: string;
  url: string;
  type: 'official' | 'download' | 'guide';
  description: string;
}

export interface Phase {
  id: string;
  timing: string;
  title: string;
  subtitle: string;
  icon: string;
  steps: string[];
  resources: Resource[];
  warning?: string;
  tip?: string;
}

export const PHASES: Phase[] = [
  {
    id: 'orders',
    timing: 'When orders arrive',
    title: 'You Got Orders',
    subtitle: 'The first 72 hours after orders drop set the tone for everything else.',
    icon: '📋',
    steps: [
      'Read your orders carefully — confirm your gaining unit, report date, and authorized dependents.',
      'Contact your gaining unit\'s sponsorship coordinator. DoD sponsorship programs generally aim to have a sponsor reach out early, but this varies a lot by unit — if nobody has contacted you within a couple weeks, don\'t wait: reach out to your gaining unit\'s S1 or rear detachment yourself.',
      'Schedule your PCS briefing with your losing unit\'s transportation office.',
      'Apply for your no-fee passport (and a tourist passport if you don\'t already have one) at your installation passport office. This can take weeks — start early.',
      'Begin researching housing. Note that "Germany" isn\'t one experience — on-post availability, off-post rental supply, commute patterns, and BAH/OHA rates vary significantly by installation. What\'s true for Stuttgart may not be true for Kaiserslautern or Grafenwöhr.',
      'Notify your children\'s school of the move and request official records.',
      'Pull medical and dental records for every family member. Germany requires vaccination documentation, and gathering records takes longer than people expect.',
      'If you have a family member with special medical or educational needs, start (or update) your Exceptional Family Member Program (EFMP) enrollment now — EFMP screening can affect where you\'re assigned and takes time to process. Don\'t wait until orders are final to start this conversation with your EFMP coordinator.',
    ],
    resources: [
      {
        label: 'Military OneSource — PCS Planning',
        url: 'https://www.militaryonesource.mil/moving-housing/moving/planning-your-move/',
        type: 'official',
        description: 'Official DoD resource for PCS planning. Start here.',
      },
      {
        label: 'No-Fee Passport — State Department',
        url: 'https://travel.state.gov/en/passports/apply/unique-needs/special-issuance-passport.html',
        type: 'official',
        description: 'Official State Department guidance for military no-fee passports.',
      },
      {
        label: 'European Living: PCS Germany Checklist',
        url: '/articles/pcs-germany-checklist?print=true',
        type: 'download',
        description: 'Full phase-by-phase checklist. Opens print dialog — save as PDF or print.',
      },
    ],
    tip: 'Ask your losing unit\'s transportation office and your gaining unit\'s S1 the same questions independently — answers can differ, and it\'s better to catch a mismatch now than after you\'ve shipped your household goods.',
  },
  {
    id: 'prepare',
    timing: '60–30 days before departure',
    title: 'What\'s Actually Coming With You',
    subtitle: 'Understanding what goes in which shipment matters more than people expect.',
    icon: '📦',
    steps: [
      'Understand the difference between your shipments: checked luggage (survives the flight), Unaccompanied Baggage / UAB (survives your first few weeks), Household Goods / HHG (your household), Non-Temporary Storage / NTS (what you\'re not taking overseas), and your POV if you\'re authorized to ship one. Work with your transportation office on weight/type entitlements before you start packing — this decides what goes where.',
      'Pack your UAB with what you\'ll actually need in the gap before HHG arrives: medications, a few days of clothing per person, basic cookware, sheets and towels, chargers and adapters, children\'s comfort items, and any documents you can\'t replace easily.',
      'Arrange pet travel now if you\'re bringing one. Requirements involve a mix of DoD policy, EU/German rules, and airline-specific restrictions — these do change, so verify current requirements with your transportation office rather than relying on an older post or guide (including this one, once enough time has passed). Start the paperwork at least 3 months out.',
      'Obtain an International Driving Permit (IDP) from AAA before you leave — it\'s a translation of your US license, not a license itself, but it\'s useful during your transition period. Your actual driving privileges in Germany run through AEA Regulation 190-1, and the exact timeline to get a U.S. Forces Certificate of License depends on your category and circumstances — confirm current requirements with your gaining installation\'s Vehicle Registration Office (VRO) rather than assuming a fixed window.',
      'Set up international banking before you go if you can. Several banks used by military families (USAA, Navy Federal, Charles Schwab) offer no-fee international ATM access. You\'ll also want to understand how money actually works day-to-day in Germany — see the Money & Banking guide below.',
      'Notify your US bank, credit cards, and subscriptions of your move.',
      'Research schools. DoDEA schools are on-post and free; German public schools and private international schools are the off-post options. Where you end up living can affect which of these is realistic — see Renting below before you commit to a neighborhood.',
      'Arrange Temporary Lodging Allowance (TLA) housing for your gap between arrival and permanent housing. TLA is reimbursed against actual costs and has an authorized period set by policy that can vary — check current limits with your finance office rather than assuming a fixed number of days, and keep every receipt regardless.',
    ],
    resources: [
      {
        label: 'DoDEA School Finder — Europe',
        url: 'https://www.dodea.edu/europe',
        type: 'official',
        description: 'Find DoDEA schools near your gaining installation.',
      },
      {
        label: 'AAA International Driving Permit',
        url: 'https://www.aaa.com/vacation/idpf.html',
        type: 'official',
        description: 'Apply in person at any AAA location. Bring two passport photos.',
      },
      {
        label: 'Army.mil — PCS to Germany with Pets',
        url: 'https://www.army.mil/article/256103/how_to_pcs_to_germany_with_pets',
        type: 'official',
        description: 'Official Army guidance — verify against your transportation office for anything time-sensitive.',
      },
      {
        label: 'European Living: Germany Banking Guide',
        url: '/articles/banking-in-germany',
        type: 'guide',
        description: 'How money actually works in Germany — cash, cards, IBAN, SEPA.',
      },
    ],
    warning: 'Certain dog breeds are prohibited or restricted in Germany, including on US installations. Verify current breed restrictions with your transportation office before making any travel arrangements — this is not reversible at the border.',
    tip: 'HHG can take 6–10 weeks; UAB is faster but still typically several weeks. Pack your UAB and a "first night bag" assuming a real gap, not a best case.',
  },
  {
    id: 'transit',
    timing: 'Travel day & first 72 hours',
    title: 'In Transit',
    subtitle: 'What to do the moment you land.',
    icon: '✈️',
    steps: [
      'Contact your sponsor or gaining unit POC on landing.',
      'Check into Army lodging or your TLA housing. Keep every receipt from the moment TLA is authorized.',
      'In-process at your gaining unit\'s S1 as soon as your unit requires — bring orders, ID cards, passports, and dependents\' documents.',
      'Visit the SOFA registration office. Your SOFA status is what unlocks most of the legal protections and privileges covered in the SOFA section below — don\'t skip this step.',
      'Get a German SIM card (Aldi Talk, Congstar, and Telekom all sell prepaid SIMs at supermarkets and electronics stores, no German ID required) or activate an international plan. On-base network coverage can be unreliable outside the gates.',
      'Visit your installation\'s Army Community Service (ACS) or equivalent Welcome Center — they maintain the current, installation-specific checklist, which will differ from a generic guide like this one in the details.',
    ],
    resources: [
      {
        label: 'USO Airport Lounges — Find a Lounge',
        url: 'https://www.uso.org/locations',
        type: 'official',
        description: 'Find the nearest USO lounge. Available to active duty, Guard, Reserve, and dependents.',
      },
      {
        label: 'European Living: First 72 Hours in Germany',
        url: '/articles/first-72-hours-germany',
        type: 'guide',
        description: 'What to do the moment you land — in the right order.',
      },
      {
        label: 'European Living: SOFA Status Explained',
        url: '/articles/sofa-status-germany',
        type: 'guide',
        description: 'What SOFA status means, what it covers, and what it doesn\'t.',
      },
    ],
    tip: 'You don\'t need to drive immediately — most installations run shuttles. Get real rest on night one; in-processing paperwork starts on day two and there\'s a lot of it.',
  },
  {
    id: 'first30',
    timing: 'Days 1–30 after arrival',
    title: 'Getting Mobile & Set Up',
    subtitle: 'Transportation, banking, and housing paperwork — in roughly that order.',
    icon: '🏠',
    steps: [
      'Get mobile. If you didn\'t ship a vehicle, on-post rental agencies generally accept a US license for a limited window, and off-post German rental agencies typically do too — book ahead, since availability near bases is tight during PCS season (June–August). See "Getting a Car in Germany" below for the full rundown on buying versus renting versus shipping.',
      'Confirm your driving-privilege timeline with your installation\'s Vehicle Registration Office — this runs on AEA Regulation 190-1 and depends on your license type and category, not a single number that applies to everyone.',
      'Get a German SIM or phone plan sorted on day one if you haven\'t already — without a local number, calling landlords or German businesses is much harder.',
      'Set up home internet if living off-post. Deutsche Telekom, Vodafone, and o2 are the main providers; contracts typically run 24 months and installation can take a few weeks, so a mobile hotspot bridges the gap.',
      'Understand German money before you need to. Germany still runs on cash more than many Americans expect — some restaurants, markets, and small shops are cash-only. You\'ll also encounter the EC/Girocard system, SEPA transfers, and IBAN — German landlords and many businesses ask for your IBAN rather than a credit card, which surprises a lot of newcomers.',
      'Open a German bank account if living off-post — your landlord will very likely require SEPA transfers for rent, and US wire transfers aren\'t a practical substitute. Deutsche Bank and Commerzbank have English-speaking staff near most bases; N26 opens fully online.',
      'Ask your installation\'s Tax Relief/VAT office about the Utility Tax Avoidance Program (UTAP) if you\'ll pay your own electricity and gas off-post. UTAP can save roughly 19% VAT on electric and gas and about 7% on water, through a utility provider under contract with the Tax Relief Office — it has a registration fee (currently around $99, reimbursable) and only covers certain utilities billed directly to you, not costs bundled into your rent as Nebenkosten. Confirm current details with your local Tax Relief Office, since fees and provider lists change.',
      'If living off-post, complete your Anmeldung (address registration) with your local Einwohnermeldeamt. German federal law requires this within two weeks of moving in — bring your passport, lease, and a Wohnungsgeberbestätigung (landlord confirmation form). This one really is a hard legal deadline, not a policy guideline, and it unlocks access to German services.',
      'Understand what you\'re actually renting before you sign. German rental listings distinguish Kaltmiete (base rent) from Warmmiete (rent plus estimated utilities/Nebenkosten) — the advertised number is often not what you\'ll actually pay monthly. You may also encounter a Kaution (deposit), a Makler (agent, sometimes with a fee), and the fact that German apartments are frequently rented as an Einbauküche situation — meaning there may be no kitchen installed at all, and you\'d need to buy or bring one. Complete a Übergabeprotokoll (move-in inspection) with photos on day one; German landlords can charge for pre-existing damage at move-out if it wasn\'t documented at move-in.',
      'Register with TRICARE Europe to use German providers and get local referrals — keep your US TRICARE card for stateside care during leave.',
      'Find an English-speaking doctor and dentist before you need one — European Living\'s services directory has verified providers near every major US base in Germany.',
      'Enroll your children in school. DoDEA enrollment goes through your installation\'s school liaison office; German or international schools should be contacted directly once your address is set.',
      'Learn where you\'ll actually shop. REWE, Edeka, and Kaufland are the main German supermarkets; Aldi and Lidl are strong for everyday items. Most stores close by 8–10pm and are closed on Sundays (gas stations stay open for basics) — running out of something on a Sunday afternoon is a rite of passage.',
    ],
    resources: [
      {
        label: 'European Living Services Directory',
        url: '/services-directory',
        type: 'guide',
        description: 'English-speaking mechanics, doctors, dentists, and more — verified near your base.',
      },
      {
        label: 'TRICARE Europe — Enrollment',
        url: 'https://www.tricare-overseas.com',
        type: 'official',
        description: 'Register with TRICARE Europe and find authorized local providers.',
      },
      {
        label: 'N26 — Online German Bank Account',
        url: 'https://n26.com/en-eu',
        type: 'official',
        description: 'Opens fully online with a passport. Good English support. Accepted by German landlords.',
      },
      {
        label: 'European Living: German Lease & Move-In Guide',
        url: '/articles/renting-off-post-germany',
        type: 'guide',
        description: 'Kaltmiete vs. Warmmiete, the Übergabeprotokoll, and your rights as a SOFA tenant.',
      },
      {
        label: 'DoDEA Europe — School Enrollment',
        url: 'https://www.dodea.edu/europe',
        type: 'official',
        description: 'Find your installation\'s DoDEA school and start enrollment.',
      },
    ],
    warning: 'The Anmeldung deadline is genuinely two weeks under German law — SOFA status doesn\'t exempt you from it, and missing it can carry a fine. Ask your landlord for the Wohnungsgeberbestätigung form before you sign the lease, since you need it to register.',
    tip: 'Getting mobile is the single biggest quality-of-life unlock in your first week. Everything else — banking, doctors, school runs — gets meaningfully easier once you can drive yourself instead of working around installation shuttles.',
  },
  {
    id: 'settled',
    timing: 'Days 30–90 and beyond',
    title: 'Getting Settled — and Learning Germany',
    subtitle: 'You\'re past the sprint. Now the country stops being a checklist.',
    icon: '🌍',
    steps: [
      'Expect some genuine culture shock in ordinary daily life — this catches almost every American family off guard, and it\'s not covered anywhere in a standard DoD checklist. Germany runs on 230V/50Hz power, not 110V — a plug adapter changes the shape of the plug, not the voltage, so plugging a non-dual-voltage American appliance straight in can destroy it. Check the voltage rating on anything you brought before using it.',
      'Learn how trash works — it\'s more involved than in the US and it\'s one of the first real adjustments. Expect separate streams for Restmüll (general waste), Biomüll (organic), Papier (paper), Gelbe Tonne/Gelber Sack (recyclable packaging), Glas (glass, often sorted by color), and Pfand (a deposit-return system for many bottles and cans, redeemed at store machines). Specifics vary by municipality, so check with your local Gemeinde or landlord.',
      'Expect more public holidays (Feiertage) than you\'re likely used to, and they vary by German state (Bundesland) — a holiday that shuts down one region may be a normal workday in another. These affect store hours, school schedules, and government office availability.',
      'Get comfortable with everyday German shopping norms: Sunday closures, cash still being widely used and sometimes required, a €1–2 coin deposit to unlock a shopping cart, bringing your own bags, and a strong bakery culture. Apotheke (pharmacy) and drugstores like dm or Rossmann serve different purposes — an Apotheke is where you get medication.',
      'Learn the basics of German driving culture beyond the paperwork: strict left-lane discipline on the Autobahn, right-before-left rules at unmarked intersections, and Umweltzonen (low-emission zones) in many city centers. Your installation\'s driver-training materials cover this in more depth than a general guide reasonably can.',
      'Explore using Germany\'s train network — Deutsche Bahn connects you to the rest of Europe, and the Deutschland-Ticket (currently around €49/month) covers regional and local transit.',
      'Learn a handful of German phrases. Most Germans near US bases speak functional English, but effort with the language opens doors, especially with landlords and neighbors.',
      'Join your installation\'s Family Readiness Group or Spouses\' Club — genuinely one of the fastest ways to get trustworthy, current local knowledge that beats any written guide.',
      'Start thinking about your PCS-out timeline earlier than feels necessary. Families who\'ve been in Germany for three years still get caught off guard by how much lead time a smooth PCS-out actually needs.',
    ],
    resources: [
      {
        label: 'Deutsche Bahn — Germany Train Network',
        url: 'https://www.bahn.de/en',
        type: 'official',
        description: 'Book trains across Germany and Europe. The DB Navigator app is essential.',
      },
      {
        label: 'European Living: Day Trips from Germany',
        url: '/day-trips',
        type: 'guide',
        description: 'Weekend trips and family adventures within driving or train distance.',
      },
      {
        label: 'European Living: Family Adventures',
        url: '/family-adventures',
        type: 'guide',
        description: 'Family-friendly activities, parks, and experiences across Germany.',
      },
      {
        label: 'ACS Germany — Army Community Service',
        url: 'https://www.armyresilience.army.mil/ACS/index.html',
        type: 'official',
        description: 'On-post programs — financial counseling, employment assistance, deployment support.',
      },
    ],
    tip: 'Your first winter in Germany will be grey and cold — that\'s normal, not a sign anything\'s wrong. Spring in Germany, by contrast, is genuinely extraordinary. Both pass.',
  },
];