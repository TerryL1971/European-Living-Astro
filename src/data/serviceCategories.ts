// src/data/serviceCategories.ts
//
// This exact list already exists duplicated inline in both
// BusinessSubmissionForm.tsx and ServicesCategoriesSection.tsx. Rather
// than add a third copy for these new listing pages, this is a shared
// source — worth eventually pointing those two at this file as well,
// though that's a small optional cleanup, not required for the listing
// pages to work.

export interface ServiceCategoryDef {
  id: string;
  title: string;
  description: string;
}

export const serviceCategories: ServiceCategoryDef[] = [
  { id: 'automotive', title: 'Automotive Services', description: 'Car dealers, mechanics, and auto services that work with Americans' },
  { id: 'healthcare', title: 'Healthcare', description: 'English-speaking doctors, dentists, veterinarians, and specialists near European US Bases' },
  { id: 'restaurants', title: 'Restaurants & Dining', description: 'English-friendly restaurants throughout Europe serving Americans living abroad' },
  { id: 'shopping', title: 'Shopping / Personal Services', description: 'Stores, malls, and beauty salons with English-speaking staff' },
  { id: 'home-services', title: 'Home Services', description: 'Plumbers, electricians, and handymen who work with American families' },
  { id: 'real-estate', title: 'Real Estate', description: 'Housing agents familiar with American military housing needs' },
  { id: 'legal', title: 'Legal Services', description: 'Lawyers who understand SOFA status and military regulations' },
  { id: 'education', title: 'Education', description: 'International schools and tutors for military families' },
  { id: 'business', title: 'Business Services', description: 'Tax advisors and accountants familiar with US/German requirements' },
];
