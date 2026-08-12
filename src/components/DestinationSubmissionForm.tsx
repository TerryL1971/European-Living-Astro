// src/components/DestinationSubmissionForm.tsx
//
// Mirrors BusinessSubmissionForm.tsx's structure and conventions: same
// section-card layout, same error/submitting/submitted states, same
// button styling. Inserts into destination_submissions with
// status: 'pending' — Terry reviews submissions and manually creates
// the real, polished articles row (category = 'City Guides') once
// approved, the same hands-on curation already used for businesses.
//
// Photos upload directly to the existing `pending-images` Supabase
// storage bucket (same bucket already used for business logo uploads
// pending consent) under a destination-submissions/ prefix, so nothing
// public-facing is touched until Terry reviews and moves the photos he
// wants into a public bucket himself.

import React, { useState } from 'react';
import { MapPin, User, Image as ImageIcon, CheckCircle, Loader, AlertCircle, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface FormData {
  destinationName: string;
  location: string;
  writeUp: string;
  submitterName: string;
  submitterEmail: string;
  consentToPublish: boolean;
}

const EMPTY_FORM: FormData = {
  destinationName: '',
  location: '',
  writeUp: '',
  submitterName: '',
  submitterEmail: '',
  consentToPublish: false,
};

const MAX_PHOTOS = 5;

export default function DestinationSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [photos, setPhotos] = useState<File[]>([]);

  const handleChange = (name: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (
      !formData.destinationName ||
      !formData.location ||
      !formData.writeUp ||
      !formData.submitterName ||
      !formData.submitterEmail
    ) {
      setError('Please fill in all required fields (marked with *)');
      setSubmitting(false);
      return;
    }

    if (!formData.consentToPublish) {
      setError('Please confirm you own or have permission to share these photos and this write-up before submitting.');
      setSubmitting(false);
      return;
    }

    try {
      const submissionId = crypto.randomUUID();
      const photoPaths: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `destination-submissions/${submissionId}/${i}-${safeName}`;

        const { error: uploadError } = await supabase.storage.from('pending-images').upload(path, file);

        if (uploadError) {
          throw new Error(`Photo upload failed (${file.name}): ${uploadError.message}`);
        }

        photoPaths.push(path);
      }

      const insertPayload = {
        id: submissionId,
        destination_name: formData.destinationName,
        location: formData.location,
        write_up: formData.writeUp,
        submitter_name: formData.submitterName,
        submitter_email: formData.submitterEmail,
        photo_paths: photoPaths,
        status: 'pending',
        consent_to_publish: formData.consentToPublish,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // No trailing .select() here on purpose: unlike `businesses`, this
      // table has no public SELECT policy (submissions should stay
      // private until reviewed), and asking Supabase to read back the
      // inserted row would fail under RLS even though the insert itself
      // succeeds — that mismatch was the actual cause of the "Permission
      // denied" error during testing, not a missing INSERT policy.
      const { error: insertError } = await supabase.from('destination_submissions').insert(insertPayload);

      if (insertError) {
        if (insertError.code === '42501') {
          throw new Error('Permission denied. Please contact support.');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting destination:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Submission failed: ${errorMessage}. Please try again or contact us at info@european-living.live`);
      setSubmitting(false);
    }
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
              Your destination submission has been received. We'll review it and may feature it as a full guide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData(EMPTY_FORM);
                  setPhotos([]);
                }}
                className="px-6 py-3 bg-[var(--brand-gold)] text-white rounded-lg font-semibold hover:bg-[var(--brand-primary)] transition-colors duration-200"
              >
                Submit Another Destination
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
          <h1 className="text-4xl font-bold text-[var(--brand-dark)] mb-2">Suggest a Destination</h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Don't see your favorite destination? Tell us about it and share a few photos.
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
              <MapPin className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">About the Destination</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Destination Name *</label>
                <input
                  type="text"
                  required
                  value={formData.destinationName}
                  onChange={(e) => handleChange('destinationName', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="e.g., Rothenburg ob der Tauber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="City, region, country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">
                  Tell us about it *
                </label>
                <textarea
                  required
                  value={formData.writeUp}
                  onChange={(e) => handleChange('writeUp', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="What makes this place worth visiting? What did you do there? Any tips for other military families?"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Photos (optional, up to {MAX_PHOTOS})</h2>
            </div>

            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                disabled={photos.length >= MAX_PHOTOS}
                className="w-full text-sm text-[var(--brand-dark)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-[var(--brand-primary)] file:text-white hover:file:bg-[var(--brand-gold)] file:cursor-pointer disabled:opacity-50"
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-lg border border-[var(--border)]"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--brand-bg-card)] rounded-lg shadow-md p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-[var(--brand-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Your Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.submitterName}
                  onChange={(e) => handleChange('submitterName', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-dark)] mb-2">Your Email *</label>
                <input
                  type="email"
                  required
                  value={formData.submitterEmail}
                  onChange={(e) => handleChange('submitterEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--brand-bg-card)] text-[var(--brand-dark)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <label className="flex items-start cursor-pointer p-3 mt-4 hover:bg-[var(--muted)] rounded transition-colors">
              <input
                type="checkbox"
                checked={formData.consentToPublish}
                onChange={(e) => handleChange('consentToPublish', e.target.checked)}
                className="w-5 h-5 text-[var(--brand-primary)] rounded focus:ring-2 focus:ring-[var(--brand-primary)] mt-0.5"
              />
              <div className="ml-3">
                <span className="font-medium text-[var(--brand-dark)]">
                  I own or have permission to share this write-up and these photos, and I'm okay with
                  European Living publishing them if selected. *
                </span>
              </div>
            </label>
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
              <span>We'll review your submission and photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>We may reach out if we need more details or higher-resolution photos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>If selected, we'll turn it into a full destination guide and credit you if you'd like</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
