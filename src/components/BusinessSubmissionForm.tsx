// src/components/BusinessSubmissionForm.tsx
//
// Ported unchanged except: removed the two <SEO> calls. In the original
// SPA, this component set its own page title/meta since React Router
// swapped components without a real page navigation. In Astro, the page
// hosting this island (src/pages/submit-business.astro) already sets
// title/description/canonical once via BaseLayout — a component setting
// its own <title> a second time would just fight with that. The
// "Submission Received" state's noIndex=true is also unnecessary here:
// that state only ever shows after a client-side form submission, so it
// never gets crawled as a distinct URL in the first place.

import React, { useState } from 'react';
import { Building2, MapPin, Phone, Languages, Award, Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface FormData {
  businessName: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  nearbyBases: string[];
  phone: string;
  email: string;
  website: string;
  priceRange: string;
  englishFluency: string;
  otherLanguages: string;
  sofaFamiliar: boolean;
  militaryDiscount: boolean;
  discountPercent: string;
  onBaseAccess: boolean;
  deliveryToBase: boolean;
  hours: string;
  additionalNotes: string;
}

const EMPTY_FORM: FormData = {
  businessName: '',
  category: '',
  subcategory: '',
  description: '',
  address: '',
  city: '',
  postalCode: '',
  nearbyBases: [],
  phone: '',
  email: '',
  website: '',
  priceRange: '',
  englishFluency: '',
  otherLanguages: '',
  sofaFamiliar: false,
  militaryDiscount: false,
  discountPercent: '',
  onBaseAccess: false,
  deliveryToBase: false,
  hours: '',
  additionalNotes: '',
};

export default function BusinessSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // ids must match serviceCategories.ts / the businesses table's actual
  // `category` values. This is a write path — picking the wrong id here
  // doesn't just mis-render something, it inserts a row that then can't
  // match any category page's query (fetchBusinessesByCategory filters
  // by exact id), so the listing would be silently invisible everywhere
  // even after being approved. Same 'legal' -> 'legal-business' and
  // 'business' -> 'hbb' rename already fixed in
  // ServicesCategoriesSection.tsx — this was the last copy still stale.
  const categories = [
    { id: 'automotive', name: 'Automotive Services' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'restaurants', name: 'Restaurants & Dining' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'home-services', name: 'Home Services' },
    { id: 'real-estate', name: 'Real Estate' },
    { id: 'legal-business', name: 'Legal Services' },
    { id: 'education', name: 'Education' },
    { id: 'hbb', name: 'Business Services' },
  ];

  const bases = [
    { id: 'stuttgart', name: 'USAG Stuttgart' },
    { id: 'ramstein', name: 'Ramstein Air Base' },
    { id: 'kaiserslautern', name: 'KMC Area' },
    { id: 'wiesbaden', name: 'USAG Wiesbaden' },
    { id: 'grafenwoehr', name: 'USAG Bavaria' },
    { id: 'spangdahlem', name: 'Spangdahlem AB' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.businessName || !formData.category || !formData.city ||
        !formData.phone || !formData.email || !formData.englishFluency) {
      setError('Please fill in all required fields (marked with *)');
      setSubmitting(false);
      return;
    }

    if (formData.nearbyBases.length === 0) {
      setError('Please select at least one nearby military base');
      setSubmitting(false);
      return;
    }

    try {
      const locationParts = [formData.city];
      if (formData.postalCode) locationParts.push(formData.postalCode);
      const location = locationParts.join(', ');

      const notesArray = [];
      if (formData.sofaFamiliar) notesArray.push('SOFA-familiar');
      if (formData.militaryDiscount && formData.discountPercent) {
        notesArray.push(`Military discount: ${formData.discountPercent}%`);
      }
      if (formData.onBaseAccess) notesArray.push('On-base access available');
      if (formData.deliveryToBase) notesArray.push('Delivers to base');
      if (formData.priceRange) notesArray.push(`Price range: ${formData.priceRange}`);
      if (formData.hours) notesArray.push(`Hours: ${formData.hours}`);
      if (formData.otherLanguages) notesArray.push(`Other languages: ${formData.otherLanguages}`);
      if (formData.additionalNotes) notesArray.push(formData.additionalNotes);
      const notes = notesArray.join(' | ');

      const insertPayload = {
        name: formData.businessName,
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description || null,
        location: location,
        address: formData.address || null,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || null,
        english_fluency: formData.englishFluency,
        verified: false,
        featured: false,
        status: 'pending',
        bases_served: formData.nearbyBases,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // No trailing .select() — same fix already applied in
      // DestinationSubmissionForm.tsx (see its comment). Reading the row
      // back right after insert requires it to pass the anon SELECT
      // policy too (`is_visible = true AND consent_status = 'confirmed'`),
      // which a freshly-submitted pending/unverified business never does.
      // The insert itself succeeds — confirmed directly against
      // production — but asking for .select() on it makes Supabase
      // report the whole call as a permission-denied failure anyway.
      const { error: insertError } = await supabase.from('businesses').insert(insertPayload);

      if (insertError) {
        if (insertError.code === '42501') {
          throw new Error('Permission denied. Please contact support.');
        } else if (insertError.code === '23505') {
          throw new Error('A business with this information already exists.');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting business:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Submission failed: ${errorMessage}. Please try again or contact us at info@european-living.live`);
      setSubmitting(false);
    }
  };

  const handleChange = (name: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: keyof FormData, value: string) => {
    setFormData((prev) => {
      const current = (prev[name] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((item: string) => item !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-lg p-8 text-center border border-[var(--border)]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--brand-dark)] mb-2">Thank You!</h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-6">
              Your business submission has been received. We'll review it and get back to you within 2-3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData(EMPTY_FORM);
                }}
                className="px-6 py-3 bg-[var(--brand-gold)] text-white rounded-lg font-semibold hover:bg-[var(--brand-primary)] transition-colors duration-200"
              >
                Submit Another Business
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-white border-2 border-gray-300 text-[var(--brand-dark)] rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--brand-dark)] mb-2">Add Your Business</h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Help American military families find your English-friendly business
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Submission Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Subcategory (optional)</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="e.g., car-dealerships, general-practitioners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Describe your business and what makes it great for American families..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Stuttgart"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="70173"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-3">
                  Nearby Military Bases * (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bases.map((base) => (
                    <label key={base.id} className="flex items-center cursor-pointer hover:bg-[var(--muted)] p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.nearbyBases.includes(base.id)}
                        onChange={() => handleMultiSelect('nearbyBases', base.id)}
                        className="w-4 h-4 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)]"
                      />
                      <span className="ml-2 text-sm text-[var(--brand-dark)]">{base.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="+49 711 555-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="info@yourbusiness.de"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="https://yourbusiness.de"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Languages className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Language Support</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">English Fluency Level *</label>
                <select
                  required
                  value={formData.englishFluency}
                  onChange={(e) => handleChange('englishFluency', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                >
                  <option value="">Select fluency level</option>
                  <option value="fluent">Fluent - Native or near-native speakers</option>
                  <option value="conversational">Conversational - Can handle most situations</option>
                  <option value="basic">Basic - Simple conversations only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Other Languages Spoken</label>
                <input
                  type="text"
                  value={formData.otherLanguages}
                  onChange={(e) => handleChange('otherLanguages', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="e.g., French, Spanish, Italian"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Military-Friendly Features</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-start cursor-pointer p-3 hover:bg-[var(--muted)] rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.sofaFamiliar}
                  onChange={(e) => handleChange('sofaFamiliar', e.target.checked)}
                  className="w-5 h-5 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)] mt-0.5"
                />
                <div className="ml-3">
                  <span className="font-medium text-[var(--brand-dark)]">SOFA Status Familiar</span>
                  <p className="text-sm text-[var(--muted-foreground)]">You understand SOFA status and military regulations</p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer p-3 hover:bg-[var(--muted)] rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.militaryDiscount}
                  onChange={(e) => handleChange('militaryDiscount', e.target.checked)}
                  className="w-5 h-5 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)] mt-0.5"
                />
                <div className="ml-3">
                  <span className="font-medium text-[var(--brand-dark)]">Military Discount Offered</span>
                  <p className="text-sm text-[var(--muted-foreground)]">You offer a discount to military personnel</p>
                </div>
              </label>

              {formData.militaryDiscount && (
                <div className="ml-8 p-4 bg-[var(--brand-bg-alt)] rounded border border-[var(--border)]">
                  <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Discount Percentage</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => handleChange('discountPercent', e.target.value)}
                      min="0"
                      max="100"
                      className="w-32 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                      placeholder="10"
                    />
                    <span className="text-[var(--brand-dark)] font-medium">%</span>
                  </div>
                </div>
              )}

              <label className="flex items-start cursor-pointer p-3 hover:bg-[var(--muted)] rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.onBaseAccess}
                  onChange={(e) => handleChange('onBaseAccess', e.target.checked)}
                  className="w-5 h-5 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)] mt-0.5"
                />
                <div className="ml-3">
                  <span className="font-medium text-[var(--brand-dark)]">On-Base Access</span>
                  <p className="text-sm text-[var(--muted-foreground)]">You can provide services on military bases</p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer p-3 hover:bg-[var(--muted)] rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.deliveryToBase}
                  onChange={(e) => handleChange('deliveryToBase', e.target.checked)}
                  className="w-5 h-5 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)] mt-0.5"
                />
                <div className="ml-3">
                  <span className="font-medium text-[var(--brand-dark)]">Delivery to Base</span>
                  <p className="text-sm text-[var(--muted-foreground)]">You deliver to on-base housing</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Business Hours</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Operating Hours</label>
              <textarea
                value={formData.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200 font-mono text-sm"
                placeholder={'Mon-Fri: 9:00-18:00\nSat: 10:00-16:00\nSun: Closed'}
              />
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <h2 className="text-2xl font-bold text-[var(--brand-dark)] mb-6">Additional Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Price Range</label>
                <select
                  value={formData.priceRange}
                  onChange={(e) => handleChange('priceRange', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                >
                  <option value="">Select price range</option>
                  <option value="$">$ - Budget-friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Any other information that would be helpful for American military families..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-[var(--border)] rounded-lg text-[var(--brand-dark)] font-medium hover:bg-[var(--muted)] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[var(--brand-gold)] text-white rounded-lg font-semibold hover:bg-[var(--brand-primary)] transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-[var(--brand-bg-alt)] border-2 border-[var(--secondary)] rounded-lg p-6">
          <h3 className="font-bold text-[var(--brand-dark)] mb-3 text-lg">What happens next?</h3>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>We'll review your submission within 2-3 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>We may contact you for additional information or verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Once approved, your business will appear in the directory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>You can update your information anytime by contacting us</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
