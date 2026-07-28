// src/data/features.ts

import {
  Bus,
  Hotel,
  Handshake,
  Languages,
  PiggyBank,
  Plane,
} from "lucide-react";

export const features = [
  {
    id: "transportation",
    title: "Transportation in Germany", // ← CHANGE THIS
    description: "Navigate trains, buses, and driving in Germany with confidence.",
    icon: Bus,
  },
  {
    id: "accommodations",
    title: "Finding Housing in Germany", // ← CHANGE THIS
    description: "Find apartments, understand rental contracts, and navigate German housing.",
    icon: Hotel,
  },
  {
    id: "services",
    title: "English-Speaking Services in Germany", // ← CHANGE THIS
    description: "Verified English-speaking doctors, mechanics, lawyers, and businesses.",
    icon: Handshake,
  },
  {
    id: "phrases",
    title: "Essential German Phrases",
    description: "Learn key German phrases with pronunciation to navigate daily life.",
    icon: Languages,
  },
  {
    id: "budgeting",
    title: "Banking & Money in Germany",
    description: "Open German bank accounts, understand payments, and manage your finances.",
    icon: PiggyBank,
  },
  {
    id: "etiquette",
    title: "German Cultural Etiquette", // ← CHANGE THIS
    description: "Do's and don'ts for living in Germany — blend in like a local.",
    icon: Plane,
  },
];
