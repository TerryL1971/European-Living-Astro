// src/components/page/FeaturesSection.tsx
// Ported: useNavigate (react-router) replaced with a plain <a> wrapping
// each card, since Astro navigates via real page loads, not client-side
// routing. Everything else — the motion hover effect, the card grid —
// is unchanged.

import { Card, CardContent } from '../ui/card';
import { motion } from 'framer-motion';
import { features } from '../../data/features';

export default function FeaturesSection() {
  return (
    <section id="travel-tips" className="py-16 bg-[var(--brand-bg-alt)]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-[var(--brand-dark)]">Travel Tips & Essentials</h2>
        <p className="text-center text-[var(--brand-dark)]/70 max-w-2xl mx-auto mb-12">
          Helpful guides, how-tos, and quick reads to travel smarter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.a
                key={feature.id}
                href={`/articles/${feature.id}`}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="cursor-pointer block"
              >
                <Card className="bg-[var(--brand-light)] border border-[var(--border)] hover:border-[var(--brand-primary)] transition-all duration-300 rounded-2xl shadow-md hover:shadow-xl">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Icon className="w-10 h-10 text-[var(--brand-primary)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--brand-dark)] mb-2">{feature.title}</h3>
                    <p className="text-[var(--brand-dark)]/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
