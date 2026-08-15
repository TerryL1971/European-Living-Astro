// src/components/admin/BusinessDataEntry.tsx
// Astro port of the original src/pages/admin/BusinessDataEntry.tsx.
// Direct port — no react-router/BaseContext deps. Works as a client:load
// island as-is. Only change from the original: the Supabase client is
// created inline (matching the lib/supabaseDayTrips.ts pattern used
// elsewhere in this repo) instead of importing a shared services/supabaseClient.ts,
// which doesn't exist here.
import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Save,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader,
  MapPin,
  Plus,
  X,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const BASES = [
  { id: 'ramstein', name: 'Ramstein AB' },
  { id: 'stuttgart', name: 'USAG Stuttgart' },
  { id: 'kaiserslautern', name: 'KMC Area' },
  { id: 'wiesbaden', name: 'USAG Wiesbaden' },
  { id: 'grafenwoehr', name: 'USAG Bavaria' },
  { id: 'spangdahlem', name: 'Spangdahlem AB' },
];

type ConsentMethod = 'email' | 'paper_form' | 'verbal_in_person';
type ConsentStatus = 'pending' | 'confirmed' | 'revoked';

interface Business {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  englishFluency?: "fluent" | "conversational" | "basic";
  verified?: boolean;
  featured?: boolean;
  featuredTier?: "free" | "verified" | "featured" | "sponsored";
  baseDistance?: string;
  notes?: string;
  imageUrl?: string;
  status?: "active" | "pending" | "inactive";
  basesServed?: string[];
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  city?: string;
  isVisible?: boolean;
  consentStatus?: ConsentStatus;
  consentMethod?: ConsentMethod;
  consentProofUrl?: string;
  consentNote?: string;
  consentConfirmedAt?: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

interface BusinessRow {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  english_fluency?: string;
  verified?: boolean;
  featured?: boolean;
  featured_tier?: string;
  base_distance?: string;
  notes?: string;
  image_url?: string;
  status?: string;
  bases_served?: string[];
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  created_at?: string;
  updated_at?: string;
  city?: string;
  is_visible?: boolean;
  consent_status?: string;
  consent_method?: string;
  consent_proof_url?: string;
  consent_note?: string;
  consent_confirmed_at?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
}

function mapBusinessRow(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    location: row.location,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    englishFluency: row.english_fluency as Business["englishFluency"],
    verified: row.verified,
    featured: row.featured,
    featuredTier: row.featured_tier as Business["featuredTier"],
    baseDistance: row.base_distance,
    notes: row.notes,
    imageUrl: row.image_url,
    status: row.status as Business["status"],
    basesServed: row.bases_served,
    latitude: row.latitude,
    longitude: row.longitude,
    googleMapsUrl: row.google_maps_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    city: row.city,
    isVisible: row.is_visible,
    consentStatus: row.consent_status as ConsentStatus,
    consentMethod: (row.consent_method as ConsentMethod) || 'email',
    consentProofUrl: row.consent_proof_url,
    consentNote: row.consent_note,
    consentConfirmedAt: row.consent_confirmed_at,
    submittedByName: row.submitted_by_name,
    submittedByEmail: row.submitted_by_email,
  };
}

const generateGoogleMapsUrl = (lat: number, lon: number): string => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
};

const isValidUrl = (url?: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Empty business template for new entries
const createEmptyBusiness = (): Business => ({
  id: 'new-' + Date.now(),
  name: '',
  category: '',
  subcategory: '',
  description: '',
  location: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  englishFluency: 'conversational',
  verified: false,
  featured: false,
  featuredTier: 'free',
  notes: '',
  imageUrl: '',
  status: 'pending',
  basesServed: [],
  latitude: undefined,
  longitude: undefined,
  googleMapsUrl: '',
  city: '',
  isVisible: false,
  consentStatus: 'pending',
  consentMethod: 'email',
  consentProofUrl: '',
  consentNote: '',
});

const normalizeSubcategory = (subcategory: string): string => {
  if (!subcategory) return '';
  return subcategory
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
};

const CONSENT_BADGE_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  revoked: 'bg-red-100 text-red-800',
};

const CONSENT_METHOD_LABELS: Record<ConsentMethod, string> = {
  email: 'Email (double opt-in)',
  paper_form: 'Paper Form',
  verbal_in_person: 'Verbal, In-Person',
};

export default function BusinessDataEntry() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isNewBusiness, setIsNewBusiness] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    if (!supabase) {
      console.error('Supabase client not configured — check PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name');

      if (error) throw error;

      const mapped = (data as BusinessRow[]).map(mapBusinessRow);
      setBusinesses(mapped);

      if (mapped.length > 0) {
        const initialFilteredIndex = mapped.findIndex(b => b.status === 'pending');
        const startIndex = initialFilteredIndex !== -1 ? initialFilteredIndex : 0;

        setFormData(mapped[startIndex]);
        setCurrentIndex(startIndex);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  }

  const getMissingFields = (business: Business) => {
    const missing: string[] = [];
    if (!business.address) missing.push('address');
    if (!business.phone) missing.push('phone');
    if (!business.email) missing.push('email');
    if (!business.website) missing.push('website');
    if (!business.latitude || !business.longitude) missing.push('coordinates');
    if (!business.googleMapsUrl) missing.push('googleMapsUrl');
    if (!business.description || business.description.length < 20) missing.push('description');
    return missing;
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'all') return matchesSearch;
      if (filter === 'missing-data') return matchesSearch && getMissingFields(b).length > 0;
      if (filter === 'unverified') return matchesSearch && !b.verified;
      if (filter === 'pending') return matchesSearch && b.status === 'pending';
      if (filter === 'no-coordinates') return matchesSearch && (!b.latitude || !b.longitude);
      if (filter === 'no-contact') return matchesSearch && (!b.phone && !b.email && !b.website);
      if (filter === 'hidden') return matchesSearch && !b.isVisible;
      if (filter === 'non-email-consent') return matchesSearch && b.consentMethod && b.consentMethod !== 'email';
      if (filter === 'needs-proof') return matchesSearch && b.consentMethod && b.consentMethod !== 'email' && !b.consentProofUrl && b.consentStatus !== 'confirmed';

      return matchesSearch;
    });
  }, [businesses, searchTerm, filter]);

  useEffect(() => {
    if (!isNewBusiness && filteredBusinesses.length > 0) {
      const currentBusiness = filteredBusinesses[currentIndex];
      setFormData(currentBusiness);
      setValidationErrors([]);
    }
  }, [currentIndex, filteredBusinesses, isNewBusiness]);

  const handleInputChange = (field: keyof Business, value: unknown) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleBasesServedChange = (baseId: string, isChecked: boolean) => {
    if (!formData) return;

    let updatedBases = formData.basesServed ? [...formData.basesServed] : [];

    if (isChecked) {
      if (!updatedBases.includes(baseId)) {
        updatedBases.push(baseId);
      }
    } else {
      updatedBases = updatedBases.filter(id => id !== baseId);
    }

    handleInputChange('basesServed', updatedBases);
  };

  const validateForm = (data: Business): string[] => {
    const errors: string[] = [];

    if (data.website && !isValidUrl(data.website)) {
      errors.push('Website URL is invalid.');
    }
    if (data.googleMapsUrl && !isValidUrl(data.googleMapsUrl)) {
      errors.push('Google Maps URL is invalid.');
    }
    if (data.consentProofUrl && !isValidUrl(data.consentProofUrl)) {
      errors.push('Consent Proof URL is invalid.');
    }
    if (!data.name || !data.location || !data.category) {
      errors.push('Name, Location, and Category are required fields.');
    }
    if (
      data.consentMethod &&
      data.consentMethod !== 'email' &&
      data.consentStatus === 'confirmed' &&
      !data.consentProofUrl &&
      !data.consentNote
    ) {
      errors.push(
        'For paper/verbal consent marked as Confirmed, add a Consent Proof URL (link to the scanned form in the consent-documents bucket) or at minimum a Consent Note describing how/when consent was obtained.'
      );
    }

    return errors;
  };

  const handleSave = async () => {
    if (!formData || !supabase) return;

    const errors = validateForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
      return;
    }

    setSaveStatus('saving');
    setValidationErrors([]);

    const previousBusiness = businesses.find(b => b.id === formData.id);

    // Detect whether visibility changed since the last load, so we know
    // whether to log a revoke/restore event after a successful save.
    const visibilityChanged = !isNewBusiness
      && previousBusiness !== undefined
      && previousBusiness.isVisible !== formData.isVisible;

    // Detect a manual (non-email) consent confirmation happening right now,
    // so we can stamp consent_confirmed_at and log it. The email flow
    // stamps this itself via confirm-business-consent — this only fires
    // for paper_form / verbal_in_person, which have no other path to
    // "confirmed".
    const isManualConsentConfirmation = !isNewBusiness
      && formData.consentMethod !== 'email'
      && formData.consentStatus === 'confirmed'
      && previousBusiness?.consentStatus !== 'confirmed';

    const consentConfirmedAtToSave = isManualConsentConfirmation
      ? new Date().toISOString()
      : formData.consentConfirmedAt;

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        subcategory: normalizeSubcategory(formData.subcategory || ''),
        location: formData.location,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        description: formData.description,
        english_fluency: formData.englishFluency,
        verified: formData.verified,
        featured: formData.featured,
        featured_tier: formData.featuredTier,
        latitude: formData.latitude,
        longitude: formData.longitude,
        google_maps_url: formData.googleMapsUrl,
        notes: formData.notes,
        image_url: formData.imageUrl,
        status: formData.status,
        bases_served: formData.basesServed,
        is_visible: formData.isVisible,
        consent_method: formData.consentMethod || 'email',
        consent_proof_url: formData.consentProofUrl || null,
        consent_note: formData.consentNote || null,
        // Only ever write consent_status / consent_confirmed_at here for
        // non-email methods. Email-consented businesses are managed
        // exclusively by the confirm-business-consent Edge Function —
        // touching consent_status here for those would let the admin
        // panel silently overwrite a value the automated flow owns.
        ...(formData.consentMethod !== 'email'
          ? {
              consent_status: formData.consentStatus,
              consent_confirmed_at: consentConfirmedAtToSave,
            }
          : {}),
        updated_at: new Date().toISOString()
      };

      if (isNewBusiness) {
        const { data, error } = await supabase
          .from('businesses')
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.error('Error inserting business:', error);
          setValidationErrors([`Insert failed: ${error.message}`]);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 5000);
          return;
        }

        if (data && data.length > 0) {
          const newBusiness = mapBusinessRow(data[0] as BusinessRow);
          setBusinesses(prev => [...prev, newBusiness]);
          setFormData(newBusiness);
          setIsNewBusiness(false);
          setSaveStatus('saved');
          setTimeout(() => {
            setSaveStatus('idle');
            loadBusinesses();
          }, 2000);
        }
      } else {
        const { data, error } = await supabase
          .from('businesses')
          .update(payload)
          .eq('id', formData.id)
          .select();

        if (error) {
          console.error('Error updating business:', error);
          setValidationErrors([`Update failed: ${error.message}`]);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 5000);
          return;
        }

        if (!data || data.length === 0) {
          setValidationErrors(['Update returned no rows. Check console for details.']);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 5000);
          return;
        }

        // Log the revoke/restore event now that the update succeeded.
        if (visibilityChanged) {
          const { error: logError } = await supabase.from('business_consent_log').insert({
            business_id: formData.id,
            event_type: formData.isVisible ? 'restored' : 'revoked',
            email: formData.submittedByEmail || formData.email || 'unknown',
          });
          if (logError) {
            // Don't fail the whole save over a logging error — but do
            // surface it, since the audit trail matters here.
            console.error('Failed to log visibility change:', logError);
          }
        }

        // Log the manual consent confirmation for the audit trail, same as
        // the email flow logs its own "confirmed" event.
        if (isManualConsentConfirmation) {
          const { error: logError } = await supabase.from('business_consent_log').insert({
            business_id: formData.id,
            event_type: 'confirmed',
            email: formData.submittedByEmail || formData.email || 'unknown',
            note: `Manually confirmed via admin panel — method: ${formData.consentMethod}.${
              formData.consentNote ? ` Note: ${formData.consentNote}` : ''
            }`,
          });
          if (logError) {
            console.error('Failed to log manual consent confirmation:', logError);
          }
        }

        setBusinesses(prev => prev.map(b => b.id === formData.id ? { ...formData, consentConfirmedAt: consentConfirmedAtToSave } : b));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error saving:', error);
      setValidationErrors(['A database error occurred. See console for details.']);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleAddNew = () => {
    const newBusiness = createEmptyBusiness();
    setFormData(newBusiness);
    setIsNewBusiness(true);
    setSaveStatus('idle');
    setValidationErrors([]);
  };

  const handleCancelNew = () => {
    setIsNewBusiness(false);
    if (filteredBusinesses.length > 0) {
      setFormData(filteredBusinesses[currentIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredBusinesses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSaveStatus('idle');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSaveStatus('idle');
    }
  };

  const handleGenerateGoogleMapsUrl = () => {
    if (formData && formData.latitude && formData.longitude) {
      const url = generateGoogleMapsUrl(formData.latitude, formData.longitude);
      handleInputChange('googleMapsUrl', url);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!formData?.address) {
      alert('Please enter an address first');
      return;
    }

    setGeocoding(true);
    setValidationErrors([]);
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address + ', Germany')}`;

      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const url = generateGoogleMapsUrl(latitude, longitude);

        setFormData(prev => prev ? {
          ...prev,
          latitude,
          longitude,
          googleMapsUrl: url
        } : null);

        alert(`Coordinates added successfully! Latitude: ${latitude}, Longitude: ${longitude}`);
      } else {
        alert('Could not find coordinates for this address. Try adding more detail.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error getting coordinates. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No businesses found matching current filter/search.</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add New Business
          </button>
        </div>
      </div>
    );
  }

  const missingFields = getMissingFields(formData);
  const completionPercentage = Math.round(((7 - missingFields.length) / 7) * 100);
  const pendingCount = businesses.filter(b => b.status === 'pending').length;
  const hiddenCount = businesses.filter(b => !b.isVisible).length;
  const nonEmailConsentCount = businesses.filter(b => b.consentMethod && b.consentMethod !== 'email').length;
  const needsProofCount = businesses.filter(
    b => b.consentMethod && b.consentMethod !== 'email' && !b.consentProofUrl && b.consentStatus !== 'confirmed'
  ).length;

  const isNonEmailConsent = formData.consentMethod && formData.consentMethod !== 'email';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Data Entry</h1>
              <p className="text-gray-600">
                {isNewBusiness ? 'Add a new business to the directory' : 'Fill in missing information for businesses'}
              </p>
            </div>
            <button
              onClick={isNewBusiness ? handleCancelNew : handleAddNew}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                isNewBusiness
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isNewBusiness ? (
                <>
                  <X className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Business
                </>
              )}
            </button>
          </div>
        </div>

        {/* Standing reminder — shows up every time you load this page, not
            just when you're already looking at the record in question. This
            is the "don't forget where the paper form goes" catch. */}
        {needsProofCount > 0 && !isNewBusiness && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {needsProofCount} paper/verbal {needsProofCount === 1 ? 'consent is' : 'consents are'} still missing proof
              </p>
              <p className="text-sm text-amber-800 mt-0.5">
                Upload the signed form to the "consent-documents" bucket and paste the link into
                Consent Proof URL — or add a Consent Note — before marking these Confirmed.
              </p>
            </div>
            <button
              onClick={() => {
                setFilter('needs-proof');
                setCurrentIndex(0);
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-semibold whitespace-nowrap"
            >
              Review Now
            </button>
          </div>
        )}

        {!isNewBusiness && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={({ target }) => setSearchTerm(target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filter}
                  onChange={({ target }) => {
                    setFilter(target.value);
                    setCurrentIndex(0);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Businesses ({businesses.length})</option>
                  <option value="pending">
                    Pending Review ({pendingCount})
                    {pendingCount > 0 && ' 🔔'}
                  </option>
                  <option value="missing-data">Missing Data ({businesses.filter(b => getMissingFields(b).length > 0).length})</option>
                  <option value="unverified">Unverified ({businesses.filter(b => !b.verified).length})</option>
                  <option value="no-coordinates">No Coordinates ({businesses.filter(b => !b.latitude || !b.longitude).length})</option>
                  <option value="no-contact">No Contact Info ({businesses.filter(b => !b.phone && !b.email && !b.website).length})</option>
                  <option value="hidden">Hidden ({hiddenCount})</option>
                  <option value="non-email-consent">Paper/Verbal Consent ({nonEmailConsentCount})</option>
                  <option value="needs-proof">Needs Proof Upload ({needsProofCount})</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-gray-700">
                    {currentIndex + 1} of {filteredBusinesses.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === filteredBusinesses.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Completion:</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-700">{completionPercentage}%</span>
                </div>
              </div>

              {missingFields.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Missing Fields:</p>
                    <p className="text-sm text-amber-700">{missingFields.join(', ')}</p>
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Validation Errors:</p>
                    <ul className="text-sm text-red-700 list-disc ml-4">
                      {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isNewBusiness && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Adding New Business</p>
              <p className="text-sm text-blue-700">Fill in as much information as possible. Required fields: Name, Category, Location</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isNewBusiness ? 'New Business' : formData.name}
            {formData.status === 'pending' && !isNewBusiness && (
              <span className="ml-3 px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full">
                Pending Review
              </span>
            )}
          </h2>

          {/* Visibility & Consent */}
          {!isNewBusiness && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Visibility & Consent</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {formData.consentStatus && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        CONSENT_BADGE_STYLES[formData.consentStatus] || 'bg-gray-100 text-gray-800'
                      }`}>
                        Consent: {formData.consentStatus}
                      </span>
                    )}
                    {formData.consentMethod && (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                        {CONSENT_METHOD_LABELS[formData.consentMethod]}
                      </span>
                    )}
                    {(formData.submittedByName || formData.submittedByEmail) && (
                      <span className="text-xs text-gray-500">
                        Submitted by {formData.submittedByName || 'unknown'}
                        {formData.submittedByEmail ? ` (${formData.submittedByEmail})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    {formData.isVisible ? (
                      <><Eye className="w-4 h-4 text-green-600" /> Visible on site</>
                    ) : (
                      <><EyeOff className="w-4 h-4 text-gray-500" /> Hidden from site</>
                    )}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!formData.isVisible}
                    onClick={() => {
                      const nextVisible = !formData.isVisible;
                      setFormData(prev => prev ? {
                        ...prev,
                        isVisible: nextVisible,
                        // Keep the legacy status field in sync automatically —
                        // having these driftable independently is what caused
                        // a business to vanish from the site without this
                        // toggle or the consent log reflecting it.
                        status: nextVisible ? 'active' : 'inactive',
                      } : null);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isVisible ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Toggling this off hides the listing from the public site immediately on save, without
                deleting it or its consent record — flip it back on any time to restore it, no
                resubmission needed. This is separate from the "Status" field below.
              </p>
            </div>
          )}

          {/* Consent Record — method, proof, manual confirmation for
              paper/verbal consent. The email double opt-in flow doesn't
              need this section touched; it manages consent_status and
              consent_confirmed_at itself via the confirm-business-consent
              Edge Function. */}
          {!isNewBusiness && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Consent Record</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Consent Method
                  </label>
                  <select
                    value={formData.consentMethod || 'email'}
                    onChange={({ target }) => handleInputChange('consentMethod', target.value as ConsentMethod)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email (double opt-in)</option>
                    <option value="paper_form">Paper Form</option>
                    <option value="verbal_in_person">Verbal, In-Person</option>
                  </select>
                  {formData.consentMethod === 'email' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Managed automatically by the email confirmation flow — consent status
                      below is not editable for this method.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Consent Status {isNonEmailConsent ? '' : '(read-only)'}
                  </label>
                  {isNonEmailConsent ? (
                    <select
                      value={formData.consentStatus || 'pending'}
                      onChange={({ target }) => handleInputChange('consentStatus', target.value as ConsentStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500">
                      {formData.consentStatus || 'pending'}
                    </div>
                  )}
                </div>

                {isNonEmailConsent && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Consent Proof URL
                      </label>
                      <input
                        type="url"
                        value={formData.consentProofUrl || ''}
                        onChange={({ target }) => handleInputChange('consentProofUrl', target.value)}
                        placeholder="Link to the scanned/signed form in the consent-documents bucket"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formData.consentProofUrl && !isValidUrl(formData.consentProofUrl)
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload the signed form to the private "consent-documents" bucket in
                        Supabase Storage, then paste its link here.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Consent Note
                      </label>
                      <textarea
                        value={formData.consentNote || ''}
                        onChange={({ target }) => handleInputChange('consentNote', target.value)}
                        rows={2}
                        placeholder="e.g. Signed by owner Maria Schmidt at the shop, 12 Aug 2026, form filed same day"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {formData.consentConfirmedAt && (
                      <p className="md:col-span-2 text-xs text-gray-500">
                        Confirmed at: {new Date(formData.consentConfirmedAt).toLocaleString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={({ target }) => handleInputChange('name', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={({ target }) => handleInputChange('category', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory || ''}
                onChange={({ target }) => handleInputChange('subcategory', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., car-dealerships"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={({ target }) => handleInputChange('location', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address {!formData.address && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={({ target }) => handleInputChange('address', target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full street address"
                />
                <button
                  onClick={handleGeocodeAddress}
                  disabled={!formData.address || geocoding}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                >
                  {geocoding ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  Get Coords
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone {!formData.phone && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={({ target }) => handleInputChange('phone', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email {!formData.email && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={({ target }) => handleInputChange('email', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@business.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website {!formData.website && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={({ target }) => handleInputChange('website', target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.website && !isValidUrl(formData.website) ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {formData.website && isValidUrl(formData.website) && (
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description {(!formData.description || formData.description.length < 20) && <span className="text-amber-600">⚠️ Too short</span>}
              </label>
              <textarea
                value={formData.description || ''}
                onChange={({ target }) => handleInputChange('description', target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of the business..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description?.length || 0} characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude {!formData.latitude && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude ?? ''}
                onChange={({ target }) => handleInputChange('latitude', target.value ? parseFloat(target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="48.1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude {!formData.longitude && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude ?? ''}
                onChange={({ target }) => handleInputChange('longitude', target.value ? parseFloat(target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9.5678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps URL {!formData.googleMapsUrl && <span className="text-amber-600">⚠️ Missing</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.googleMapsUrl || ''}
                  onChange={({ target }) => handleInputChange('googleMapsUrl', target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.googleMapsUrl && !isValidUrl(formData.googleMapsUrl) ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://www.google.com/maps/search/?api=1&query=lat,lon"
                />
                {formData.googleMapsUrl && isValidUrl(formData.googleMapsUrl) && (
                  <a
                    href={formData.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={handleGenerateGoogleMapsUrl}
                  disabled={!formData.latitude || !formData.longitude}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bases Served</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                {BASES.map((base) => (
                  <label key={base.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.basesServed?.includes(base.id) || false}
                      onChange={({ target }) => handleBasesServedChange(base.id, target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{base.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">English Fluency</label>
                <select
                  value={formData.englishFluency || 'conversational'}
                  onChange={({ target }) => handleInputChange('englishFluency', target.value as 'fluent' | 'conversational' | 'basic')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fluent">Fluent</option>
                  <option value="conversational">Conversational</option>
                  <option value="basic">Basic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-gray-400 font-normal">(set by the toggle above)</span>
                </label>
                <div className={`w-full px-4 py-2 border rounded-lg ${
                  formData.status === 'active'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : formData.status === 'inactive'
                    ? 'bg-gray-100 border-gray-300 text-gray-600'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Pending (never toggled)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Tier</label>
                <select
                  value={formData.featuredTier || 'free'}
                  onChange={({ target }) => handleInputChange('featuredTier', target.value as Business["featuredTier"])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="verified">Verified</option>
                  <option value="featured">Featured</option>
                  <option value="sponsored">Sponsored</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={({ target }) => handleInputChange('notes', target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Internal notes..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={({ target }) => handleInputChange('imageUrl', target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verified || false}
                  onChange={({ target }) => handleInputChange('verified', target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Verified</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={({ target }) => handleInputChange('featured', target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {isNewBusiness ? 'Business added successfully!' : 'Changes saved successfully!'}
                  </span>
                </div>
              )}
              {(saveStatus === 'error' && validationErrors.length === 0) && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Database Error saving changes</span>
                </div>
              )}
              {(saveStatus === 'error' && validationErrors.length > 0) && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Validation Failed. See error section above.</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {isNewBusiness ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isNewBusiness ? 'Add Business' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}