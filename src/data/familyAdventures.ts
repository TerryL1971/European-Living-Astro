// src/data/familyAdventures.ts
// Ported verbatim from FamilyAdventuresPage.tsx's inline GERMANY_RESOURCES /
// COUNTRY_HIGHLIGHTS / AGE_LABELS constants — all hardcoded, no Supabase.

export type AgeGroup = 'all' | 'toddler' | 'school' | 'teen';
export type Country = 'uk' | 'italy' | 'spain';

export interface FamilyItem {
  name: string;
  type: string;
  ages: string;
  description: string;
  link?: string | null;
}

export interface BaseResources {
  base: string;
  emoji: string;
  items: FamilyItem[];
}

export const GERMANY_RESOURCES: BaseResources[] = [
  {
    base: 'USAG Stuttgart',
    emoji: '🏛️',
    items: [
      { name: 'LEGOLAND Deutschland', type: '🎢 Theme Park', ages: 'all', description: 'Günzburg, ~1.5hr from Stuttgart. A full day of LEGO fun for all ages.', link: 'https://www.legoland.de' },
      { name: 'Europa-Park', type: '🎢 Theme Park', ages: 'all', description: 'Germany\'s largest theme park in Rust. 2hr from Stuttgart. Incredible for families.', link: 'https://www.europapark.de' },
      { name: 'Wilhelma Zoo & Botanical Garden', type: '🦁 Zoo', ages: 'all', description: 'Stuttgart\'s world-class zoo. 11,000 animals, beautiful gardens. Kid favorite.', link: 'https://www.wilhelma.de' },
      { name: 'Schwaben Quelle', type: '🏊 Water Park', ages: 'school', description: 'Massive indoor/outdoor water park in Stuttgart. Great for all ages year-round.', link: 'https://www.schwaben-quellen.de' },
      { name: 'Hohenzollern Castle', type: '🏰 Castle', ages: 'school', description: 'Fairy-tale castle 1hr from Stuttgart. Kids love the knights\' armor and crown jewels.', link: 'https://www.burg-hohenzollern.com' },
      { name: 'Kinderbauernhof (Children\'s Farm)', type: '🌿 Nature', ages: 'toddler', description: 'Petting zoos and children\'s farms around Stuttgart. Great for toddlers.', link: null },
      { name: 'The Used Car Guys', type: '🚗 Car Dealership', ages: 'all', description: 'English-speaking used car dealership near Panzer gate. Specializes in helping military families find reliable vehicles quickly. Perfect for new PCS arrivals.', link: 'https://www.usedcarguys.net' },
    ],
  },
  {
    base: 'Ramstein / KMC',
    emoji: '✈️',
    items: [
      { name: 'Phantasialand', type: '🎢 Theme Park', ages: 'school', description: 'World-class theme park near Cologne. 1.5hr from Ramstein. Thrilling for older kids.', link: 'https://www.phantasialand.de' },
      { name: 'Heidelberg Castle & Old Town', type: '🏰 Castle', ages: 'all', description: '45min from Ramstein. Castle ruins, cable car, and charming old town kids love.', link: 'https://www.schloss-heidelberg.de' },
      { name: 'Tropical Islands', type: '🏊 Water Park', ages: 'all', description: 'Indoor tropical paradise near Berlin. Worth the drive for a weekend trip.', link: 'https://www.tropical-islands.de' },
      { name: 'Kaiserslautern City Park', type: '🌿 Park', ages: 'toddler', description: 'Large park with playgrounds right in KMC. Perfect for young children.', link: 'https://www.kaiserslautern.de' },
      { name: 'Ritterburg Lichtenberg', type: '🏰 Castle', ages: 'school', description: 'Medieval castle ruins 30min from Ramstein. Free entry, great for exploring.', link: 'https://www.burg-lichtenberg.de' },
      { name: 'Nürburgring', type: '🏎️ Activity', ages: 'teen', description: 'Legendary race track with driving experiences for teens and car-obsessed kids.', link: 'https://www.nuerburgring.de' },
      { name: 'The Used Car Guys — Stuttgart', type: '🚗 Car Dealership', ages: 'all', description: 'English-speaking used car dealership near Panzer gate in Stuttgart. Many KMC families make the trip — they specialize in finding reliable vehicles fast for military families.', link: 'https://www.usedcarguys.net' },
    ],
  },
  {
    base: 'USAG Grafenwöhr',
    emoji: '🏔️',
    items: [
      { name: 'LEGOLAND Deutschland', type: '🎢 Theme Park', ages: 'all', description: '1hr from Grafenwöhr. One of the best LEGOLAND parks in the world.', link: 'https://www.legoland.de' },
      { name: 'Neuschwanstein Castle', type: '🏰 Castle', ages: 'all', description: 'The real fairy-tale castle that inspired Disney. 2hr from Graf. Unmissable.', link: 'https://www.neuschwanstein.de' },
      { name: 'Nuremberg Toy Museum', type: '🧸 Museum', ages: 'all', description: 'Nuremberg is the toy capital of the world. This museum is magical for kids.', link: 'https://www.spielzeugmuseum-nuernberg.de' },
      { name: 'Tierpark Nürnberg', type: '🦁 Zoo', ages: 'all', description: 'Nuremberg\'s excellent zoo. 45min from Graf. Full day activity.', link: 'https://www.tiergarten.nuernberg.de' },
      { name: 'Steinwald Nature Park', type: '🌿 Nature', ages: 'all', description: 'Beautiful hiking and nature exploration right near Grafenwöhr.', link: 'https://www.naturpark-steinwald.de' },
      { name: 'Bayreuth Festspielhaus', type: '🎓 Culture', ages: 'teen', description: 'World-famous opera house. Great for teens interested in music and culture.', link: 'https://www.bayreuther-festspiele.de' },
    ],
  },
  {
    base: 'USAG Wiesbaden',
    emoji: '🏢',
    items: [
      { name: 'Frankfurt Zoo', type: '🦁 Zoo', ages: 'all', description: 'One of Germany\'s oldest and best zoos. 30min from Wiesbaden.', link: 'https://www.zoo-frankfurt.de' },
      { name: 'Opel Zoo', type: '🦁 Zoo', ages: 'all', description: 'Unique open-air zoo near Kronberg. Kids can get close to the animals.', link: 'https://www.opel-zoo.de' },
      { name: 'Neroberg Park & Cable Car', type: '🌿 Park', ages: 'all', description: 'Beautiful hilltop park with a historic cable car. Free in summer. Kids love it.', link: 'https://www.wiesbaden.de' },
      { name: 'Phantasialand', type: '🎢 Theme Park', ages: 'school', description: '1.5hr from Wiesbaden. One of Europe\'s best theme parks.', link: 'https://www.phantasialand.de' },
      { name: 'Rhine River Cruise', type: '🚢 Activity', ages: 'all', description: 'Day boat trips along the Rhine. Castles, vineyards, and villages from the water.', link: 'https://www.k-d.com' },
      { name: 'Mainz Roman Museum', type: '🎓 Museum', ages: 'school', description: 'Kids love the Roman exhibits and interactive displays. Free for under 18.', link: 'https://www.landesmuseum-mainz.de' },
      { name: 'The Used Car Guys — Stuttgart', type: '🚗 Car Dealership', ages: 'all', description: 'English-speaking used car dealership near Panzer gate in Stuttgart. A common stop for Wiesbaden families heading south — fast, reliable vehicle sourcing for military families.', link: 'https://www.usedcarguys.net' },
    ],
  },
  {
    base: 'Spangdahlem Air Base',
    emoji: '🛩️',
    items: [
      { name: 'Phantasialand', type: '🎢 Theme Park', ages: 'school', description: 'World-class theme park near Cologne. 1.5hr from Spangdahlem. Thrilling for older kids.', link: 'https://www.phantasialand.de' },
      { name: 'Cochem Castle', type: '🏰 Castle', ages: 'all', description: '45min from Spangdahlem on the Moselle River. Stunning medieval castle kids love exploring.', link: 'https://www.reichsburg-cochem.de' },
      { name: 'Trier Roman Ruins', type: '🎓 Historic', ages: 'school', description: 'Germany\'s oldest city, 30min away. Roman amphitheater and Porta Nigra fascinate kids.', link: 'https://www.trier-info.de' },
      { name: 'Nürburgring', type: '🏎️ Activity', ages: 'teen', description: 'Legendary race track 1hr from Spangdahlem. Driving experiences for teens and car fans.', link: 'https://www.nuerburgring.de' },
      { name: 'Mosel River Bike Trail', type: '🌿 Nature', ages: 'school', description: 'Family cycling along the beautiful Moselle River. Flat, easy, and scenic for all ages.', link: null },
      { name: 'Bitburg City Park', type: '🌿 Park', ages: 'toddler', description: 'Playgrounds and green spaces right near base. Perfect for young children.', link: null },
      { name: 'The Used Car Guys — Stuttgart', type: '🚗 Car Dealership', ages: 'all', description: 'English-speaking used car dealership near Panzer gate in Stuttgart. Worth knowing about even from Spangdahlem — they specialize in fast, reliable vehicles for military families.', link: 'https://www.usedcarguys.net' },
    ],
  },
];

export const COUNTRY_HIGHLIGHTS: Record<Country, {
  emoji: string;
  title: string;
  subtitle: string;
  highlights: FamilyItem[];
}> = {
  uk: {
    emoji: '🇬🇧',
    title: 'United Kingdom',
    subtitle: 'Family highlights when visiting',
    highlights: [
      { name: 'Tower of London', type: '🏰 Historic', description: 'Crown Jewels, Yeoman Warders, and 1,000 years of history. Kids are mesmerized.', ages: 'school', link: 'https://www.hrp.org.uk/tower-of-london' },
      { name: 'Natural History Museum', type: '🦕 Museum', description: 'Free! Dinosaur skeletons, the blue whale, and incredible exhibits. All ages.', ages: 'all', link: 'https://www.nhm.ac.uk' },
      { name: 'Warner Bros. Studio Tour (Harry Potter)', type: '🧙 Theme', description: 'Outside London. The real sets, costumes, and magic. Book months ahead.', ages: 'school', link: 'https://www.wbstudiotour.co.uk' },
      { name: 'Edinburgh Castle', type: '🏰 Castle', description: 'Scotland\'s most iconic castle. Crown Jewels, cannons, and bagpipers.', ages: 'all', link: 'https://www.edinburghcastle.scot' },
      { name: 'Brighton Beach & Pier', type: '🌊 Beach', description: 'Arcade games, rides, fish & chips. Easy day trip from London.', ages: 'all', link: 'https://www.brightonpier.co.uk' },
      { name: 'Stonehenge', type: '🗿 Historic', description: 'Mysterious and awe-inspiring. Even young kids are fascinated by the scale.', ages: 'school', link: 'https://www.english-heritage.org.uk/visit/places/stonehenge' },
    ],
  },
  italy: {
    emoji: '🇮🇹',
    title: 'Italy',
    subtitle: 'Family highlights when visiting',
    highlights: [
      { name: 'Colosseum, Rome', type: '🏛️ Historic', description: 'Book skip-the-line tickets. Kids love the gladiator stories. Unforgettable.', ages: 'school', link: 'https://colosseo.it' },
      { name: 'Gardaland', type: '🎢 Theme Park', description: 'Italy\'s largest theme park on Lake Garda. Great for all ages.', ages: 'all', link: 'https://www.gardaland.it' },
      { name: 'Venice Gondola Ride', type: '🚢 Activity', description: 'Even young kids love the canals. Walk, get gelato, explore without cars.', ages: 'all', link: null },
      { name: 'Pompeii', type: '🌋 Historic', description: 'The ancient city frozen in time. Older kids find this absolutely fascinating.', ages: 'teen', link: 'https://pompeiisites.org' },
      { name: 'Cinque Terre Villages', type: '🌊 Scenic', description: 'Colorful villages, hiking trails, and beaches. Beautiful for family photos.', ages: 'school', link: 'https://www.parconazionale5terre.it' },
      { name: 'Pizza Making Class', type: '🍕 Activity', description: 'Cooking classes for families in Rome, Florence, Naples. Kids love making real pizza.', ages: 'all', link: null },
    ],
  },
  spain: {
    emoji: '🇪🇸',
    title: 'Spain',
    subtitle: 'Family highlights when visiting',
    highlights: [
      { name: 'PortAventura World', type: '🎢 Theme Park', description: 'One of Europe\'s best theme parks near Barcelona. Also has a water park.', ages: 'all', link: 'https://www.portaventuraworld.com' },
      { name: 'Sagrada Família', type: '🏛️ Architecture', description: 'Gaudí\'s masterpiece. The interior looks like a forest — kids are amazed.', ages: 'school', link: 'https://sagradafamilia.org' },
      { name: 'Park Güell', type: '🌿 Park', description: 'Colorful mosaics, winding paths, and great views. Kids love the dragon staircase.', ages: 'all', link: 'https://parkguell.barcelona' },
      { name: 'Beaches of Costa Brava', type: '🌊 Beach', description: 'Crystal clear water, snorkeling, and calm coves. Perfect for families.', ages: 'all', link: null },
      { name: 'Flamenco Show for Families', type: '💃 Culture', description: 'Many venues in Seville and Madrid offer family-friendly early evening shows.', ages: 'school', link: null },
      { name: 'Madrid\'s Retiro Park', type: '🌿 Park', description: 'Massive park with rowboats, puppet shows, and playgrounds. Free and beautiful.', ages: 'all', link: 'https://www.esmadrid.com' },
    ],
  },
};

export const AGE_LABELS: Record<AgeGroup, string> = {
  all: 'All Ages',
  toddler: 'Toddlers (0-4)',
  school: 'School Age (5-12)',
  teen: 'Teens (13+)',
};
