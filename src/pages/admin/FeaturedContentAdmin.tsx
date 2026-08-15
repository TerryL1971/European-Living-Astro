// src/components/admin/FeaturedContentAdmin.tsx
// Astro port of the original src/pages/admin/FeaturedContentAdmin.tsx.
// Direct port — no react-router/BaseContext deps. Works as a client:load
// island as-is. Placed at the same relative depth (src/components/admin/)
// as the original (src/pages/admin/), so every import below resolves
// unchanged: services/featuredContentService.ts, types/featuredContent.ts,
// and components/AdminAuthWrapper.tsx.
// admin url: /admin/featured-content

import { useState, useEffect } from 'react';
import {
  getAllFeaturedContent,
  createFeaturedContent,
  updateFeaturedContent,
  deleteFeaturedContent
} from '../../services/featuredContentService';
import type { FeaturedContent } from '../../types/featuredContent';
import AdminAuthWrapper from '../../components/AdminAuthWrapper';
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Save, X } from 'lucide-react';

type FormData = {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  type: 'article' | 'video';
  bases_served: string[];
  is_sponsored: boolean;
  sponsor_name: string;
  active: boolean;
  display_order: number;
  start_date: string;
  end_date: string;
};

export default function FeaturedContentAdmin() {
  const [items, setItems] = useState<FeaturedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    cta_text: 'Learn More',
    type: 'article',
    bases_served: ['all'],
    is_sponsored: false,
    sponsor_name: '',
    active: true,
    display_order: 1,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllFeaturedContent();
    setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload - convert empty strings to undefined to match FeaturedContentCreate type
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      image_url: formData.image_url || undefined,
      link_url: formData.link_url || undefined,
      cta_text: formData.cta_text || 'Learn More',
      type: formData.type,
      bases_served: formData.bases_served,
      is_sponsored: formData.is_sponsored,
      sponsor_name: formData.is_sponsored && formData.sponsor_name ? formData.sponsor_name : undefined,
      active: formData.active,
      display_order: formData.display_order,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    };

    try {
      let result;
      if (editingId) {
        result = await updateFeaturedContent(editingId, payload);
      } else {
        result = await createFeaturedContent(payload);
      }

      if (result) {
        alert(editingId ? 'Updated successfully!' : 'Created successfully!');
        resetForm();
        loadItems();
      } else {
        alert('Error: Operation failed. Check console for details.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error: ' + error);
    }
  };

  const handleEdit = (item: FeaturedContent) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      cta_text: item.cta_text || 'Learn More',
      // Legacy items saved before this cleanup may still have "offer" or
      // "advertisement" stored in the database. Coerce anything outside the
      // current allowed set to "article" so the edit form doesn't choke on
      // a value the <select> no longer offers.
      type: (item.type === 'article' || item.type === 'video') ? item.type : 'article',
      bases_served: item.bases_served,
      is_sponsored: item.is_sponsored || false,
      sponsor_name: item.sponsor_name || '',
      active: item.active,
      display_order: item.display_order,
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this featured content?')) {
      await deleteFeaturedContent(id);
      loadItems();
    }
  };

  const toggleActive = async (item: FeaturedContent) => {
    await updateFeaturedContent(item.id, { active: !item.active });
    loadItems();
  };

  const moveItem = async (item: FeaturedContent, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? item.display_order - 1 : item.display_order + 1;
    if (newOrder < 1) return;

    await updateFeaturedContent(item.id, { display_order: newOrder });
    loadItems();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      cta_text: 'Learn More',
      type: 'article',
      bases_served: ['all'],
      is_sponsored: false,
      sponsor_name: '',
      active: true,
      display_order: items.length + 1,
      start_date: '',
      end_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const bases = ['all', 'ramstein', 'kaiserslautern', 'spangdahlem', 'grafenwoehr', 'stuttgart', 'wiesbaden'];

  return (
    <AdminAuthWrapper>
      <>
        <div className="min-h-screen bg-[var(--brand-bg)] py-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--brand-dark)] mb-2">
                  Featured Content Manager
                </h1>
                <p className="text-[var(--muted-foreground)]">
                  Manage featured items shown on the homepage
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-dark)] transition"
              >
                <Plus size={20} />
                Add Featured Content
              </button>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[var(--brand-dark)]">
                      {editingId ? 'Edit' : 'Add'} Featured Content
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-[var(--muted-foreground)] hover:text-[var(--brand-dark)]"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        placeholder="Stuttgart Christmas Markets 2025"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        placeholder="Brief description of the featured content..."
                      />
                    </div>

                    {/* Link URL */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        placeholder="https://example.com"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                        Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Row: Type & CTA */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'article' | 'video' })}
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          Call-to-Action Text
                        </label>
                        <input
                          type="text"
                          value={formData.cta_text}
                          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                          placeholder="Learn More"
                        />
                      </div>
                    </div>

                    {/* Bases Served */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                        Show for Bases (select at least one) *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {bases.map((base) => (
                          <label key={base} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.bases_served.includes(base)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    bases_served: [...formData.bases_served, base],
                                  });
                                } else {
                                  // Don't allow removing all bases
                                  if (formData.bases_served.length > 1) {
                                    setFormData({
                                      ...formData,
                                      bases_served: formData.bases_served.filter((b) => b !== base),
                                    });
                                  }
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm capitalize">{base}</span>
                          </label>
                        ))}
                      </div>
                      {formData.bases_served.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">At least one base must be selected</p>
                      )}
                    </div>

                    {/* Sponsored Checkbox */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_sponsored}
                          onChange={(e) =>
                            setFormData({ ...formData, is_sponsored: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm font-semibold text-[var(--brand-dark)]">
                          This is sponsored content
                        </span>
                      </label>
                    </div>

                    {/* Sponsor Name (conditional) */}
                    {formData.is_sponsored && (
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          Sponsor Name
                        </label>
                        <input
                          type="text"
                          value={formData.sponsor_name}
                          onChange={(e) =>
                            setFormData({ ...formData, sponsor_name: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                          placeholder="Sponsor Name"
                        />
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          Start Date (optional)
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          End Date (optional)
                        </label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        />
                      </div>
                    </div>

                    {/* Display Order & Active */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brand-dark)] mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.display_order}
                          onChange={(e) =>
                            setFormData({ ...formData, display_order: parseInt(e.target.value) })
                          }
                          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)]"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-8">
                          <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) =>
                              setFormData({ ...formData, active: e.target.checked })
                            }
                            className="rounded"
                          />
                          <span className="text-sm font-semibold text-[var(--brand-dark)]">
                            Active (show on site)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-dark)] transition font-semibold"
                      >
                        <Save size={20} />
                        {editingId ? 'Update' : 'Create'} Featured Content
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Items List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[var(--muted-foreground)]">Loading...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-[var(--border)]">
                <p className="text-[var(--muted-foreground)] mb-4">No featured content yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-[var(--brand-primary)] hover:text-[var(--brand-dark)] font-semibold"
                >
                  Create your first one
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border-2 p-6 transition ${
                      item.active
                        ? 'border-[var(--brand-primary)]'
                        : 'border-[var(--border)] opacity-60'
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => moveItem(item, 'up')}
                          className="p-2 hover:bg-gray-100 rounded transition"
                          title="Move up"
                        >
                          <MoveUp size={20} className="text-[var(--muted-foreground)]" />
                        </button>
                        <span className="text-center font-bold text-[var(--brand-dark)]">
                          {item.display_order}
                        </span>
                        <button
                          onClick={() => moveItem(item, 'down')}
                          className="p-2 hover:bg-gray-100 rounded transition"
                          title="Move down"
                        >
                          <MoveDown size={20} className="text-[var(--muted-foreground)]" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-[var(--brand-dark)] mb-1">
                              {item.title}
                            </h3>
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded capitalize">
                                {item.type}
                              </span>
                              {item.is_sponsored && (
                                <span className="text-xs px-2 py-1 bg-[var(--brand-gold)] bg-opacity-30 rounded">
                                  Sponsored by {item.sponsor_name}
                                </span>
                              )}
                              <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded">
                                {item.bases_served.join(', ')}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleActive(item)}
                              className="p-2 hover:bg-gray-100 rounded transition"
                              title={item.active ? 'Deactivate' : 'Activate'}
                            >
                              {item.active ? (
                                <Eye size={20} className="text-[var(--brand-primary)]" />
                              ) : (
                                <EyeOff size={20} className="text-[var(--muted-foreground)]" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 hover:bg-gray-100 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={20} className="text-[var(--brand-dark)]" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={20} className="text-red-600" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[var(--muted-foreground)] text-sm mb-2">
                          {item.description}
                        </p>

                        {item.link_url && (
                          <a
                            href={item.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--brand-primary)] hover:underline"
                          >
                            {item.link_url}
                          </a>
                        )}

                        {(item.start_date || item.end_date) && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-2">
                            {item.start_date && `From ${new Date(item.start_date).toLocaleDateString()}`}
                            {item.start_date && item.end_date && ' - '}
                            {item.end_date && `Until ${new Date(item.end_date).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    </AdminAuthWrapper>
  );
}