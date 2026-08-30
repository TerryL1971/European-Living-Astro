// src/components/page/ContactSection.tsx
// Direct port — no react-router-dom or external data fetching here, so
// nothing about the Astro migration required structural changes. The
// Formspree form posts directly to their endpoint exactly as before.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, Send } from 'lucide-react';

export default function ContactSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="contact" className="bg-[var(--brand-bg)] py-16 px-6 text-[var(--brand-text)]">
      <div className="max-w-4xl mx-auto text-center">
        <p className="uppercase tracking-[0.14em] text-xs font-bold text-[var(--brand-primary)] mb-3">Contact</p>
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-lg text-[var(--brand-text-muted)] mb-8 max-w-2xl mx-auto">
          Whether you're an American relocating to Europe, already living here, or simply exploring, we're here to
          make your experience smoother.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <a
            href="mailto:info@european-living.live"
            title="info@european-living.live"
            className="flex items-center gap-2 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--brand-primary-dark)] transition"
          >
            <Mail size={18} />
            Email us
          </a>

          <a
            href="https://wa.me/4915165227520"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[var(--brand-border)] text-[var(--brand-text)] px-6 py-3 rounded-full font-semibold hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[var(--brand-primary)] font-semibold underline underline-offset-4 hover:text-[var(--brand-primary-dark)] transition"
        >
          {showForm ? 'Close form' : 'Or send us a message ›'}
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form
                action="https://formspree.io/f/mnngzrdn"
                method="POST"
                className="mt-8 bg-[var(--brand-bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--brand-border)] text-left max-w-xl mx-auto"
              >
                <input type="hidden" name="_subject" value="New message from European Living website" />
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[var(--brand-text)]">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[var(--brand-text)]">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-[var(--brand-text)]">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--brand-primary-dark)] transition"
                >
                  <Send size={18} />
                  Send message
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
