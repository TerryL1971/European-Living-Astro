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
    <section id="contact" className="bg-[var(--brand-bg)] py-16 px-6 text-[#131312]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-4 tracking-tight">Get in Touch</h2>
        <p className="text-lg text-[#131312]/80 mb-8">
          Whether you're an American relocating to Europe, already living here, or simply exploring, we're here to
          make your experience smoother.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
          <a
            href="mailto:info@european-living.live"
            className="flex items-center gap-2 bg-[var(--brand-button)] text-[#f7f7ec] px-5 py-3 rounded-xl hover:bg-[#131312] transition"
          >
            <Mail size={20} />
            info@european-living.live
          </a>

          <a
            href="https://wa.me/4915165227520"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[var(--brand-dark)] text-[#f4f5f0] px-5 py-3 rounded-xl hover:bg-[#9da586] transition"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--brand-button)] text-[#f7f7ec] px-6 py-3 rounded-xl font-medium hover:bg-[#131312] hover:text-[#f4f5f0] transition"
        >
          {showForm ? 'Close Form' : 'Ask a Question'}
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
                className="mt-8 bg-[#f4f5f0] p-8 rounded-2xl shadow-sm border border-[#9da586]/30 text-left"
              >
                <input type="hidden" name="_subject" value="New message from European Living website" />
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#131312]">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#9da586]/40 focus:outline-none focus:ring-2 focus:ring-[#9da586]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-[#131312]">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#9da586]/40 focus:outline-none focus:ring-2 focus:ring-[#9da586]"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-[#131312]">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#9da586]/40 focus:outline-none focus:ring-2 focus:ring-[#9da586]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#131312] text-[#f7f7ec] px-6 py-3 rounded-xl hover:bg-[#9da586] transition"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
