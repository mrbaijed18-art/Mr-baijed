import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { PromptItem, CategoryItem } from '../../types';
import { getPromptById, createPrompt, updatePrompt } from '../../supabase/promptService';
import { getCategories } from '../../supabase/categoryService';
import { uploadPromptImage } from '../../supabase/storageService';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { PromptCard } from '../../components/PromptCard';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  ArrowLeft, 
  Check, 
  Link as LinkIcon, 
  Cpu, 
  Tag, 
  Maximize2 
} from 'lucide-react';

interface PromptEditorPageProps {
  editPromptId?: string;
}

export const PromptEditorPage: React.FC<PromptEditorPageProps> = ({ editPromptId }) => {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const isEditing = Boolean(editPromptId);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('Cinematic');
  const [tagsInput, setTagsInput] = useState('');
  const [modelUsed, setModelUsed] = useState('Midjourney v6.1');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [imageUrl, setImageUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Image Upload state
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load existing prompt if in edit mode
  useEffect(() => {
    async function init() {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (editPromptId) {
          const existing = await getPromptById(editPromptId);
          if (existing) {
            setTitle(existing.title);
            setPromptText(existing.prompt);
            setCategory(existing.category);
            setTagsInput((existing.tags || []).join(', '));
            setModelUsed(existing.modelUsed || 'Midjourney v6.1');
            setAspectRatio(existing.aspectRatio || '4:5');
            setImageUrl(existing.imageUrl);
            setIsPremium(Boolean(existing.isPremium));
            setIsFeatured(Boolean(existing.isFeatured));
            setStatus(existing.status || 'published');
          }
        }
      } catch (err) {
        showToast('Failed to load editor data', 'error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [editPromptId]);

  // Handle file drop or selection
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadPromptImage(file);
      setImageUrl(url);
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!title.trim()) {
      showToast('Please provide a prompt title', 'error');
      return;
    }
    if (!promptText.trim()) {
      showToast('Please enter the full prompt text', 'error');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('Please upload an image or provide an image URL', 'error');
      return;
    }

    setSaving(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const promptData: Partial<PromptItem> = {
        title: title.trim(),
        prompt: promptText.trim(),
        category,
        tags: parsedTags,
        modelUsed,
        aspectRatio,
        imageUrl: imageUrl.trim(),
        isPremium,
        isFeatured,
        status
      };

      if (isEditing && editPromptId) {
        await updatePrompt(editPromptId, promptData);
        showToast('Prompt updated successfully!', 'success');
      } else {
        await createPrompt(promptData as any);
        showToast('New prompt created and published!', 'success');
      }

      navigate('/admin/prompts');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save prompt', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Preview Prompt Object for Real-Time Card
  const previewPrompt: PromptItem = {
    id: editPromptId || 'preview-id',
    title: title || 'Untitled Prompt Preview',
    prompt: promptText || 'Type prompt description to see how it looks on the public gallery...',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    category: category || 'General',
    tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    likes: 12,
    copies: 4,
    views: 89,
    isPremium,
    isFeatured,
    status: status || 'published',
    modelUsed,
    aspectRatio,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <AdminLayout activeSection={isEditing ? 'prompts' : 'new-prompt'}>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/prompts')}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {isEditing ? 'Edit Prompt' : 'Create New AI Prompt'}
              </h1>
              <p className="text-xs text-neutral-400">
                {isEditing ? 'Update catalog prompt attributes and preview' : 'Upload an AI image and catalog its exact prompt text'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Editor + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: 7 columns */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {/* Title */}
            <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Prompt Identification
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Prompt Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Geisha with Holographic Kanji"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Full Prompt Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Complete Prompt Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Paste the verbatim prompt text here..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs sm:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="neon, cyberpunk, 8k, portrait"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload / URL Input */}
            <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Preview Image *
                </h2>

                <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      imageTab === 'url' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      imageTab === 'upload' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                    }`}
                  >
                    File Upload
                  </button>
                </div>
              </div>

              {imageTab === 'url' ? (
                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">
                    Direct Web Image URL (HTTPS)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or https://..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                  }`}
                  onClick={() => {
                    const input = document.getElementById('file-upload-input');
                    if (input) input.click();
                  }}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-200">
                    {uploadingImage ? 'Uploading image...' : 'Click to select or drag & drop image'}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    PNG, JPG, WebP supported
                  </p>
                </div>
              )}
            </div>

            {/* Model Used, Aspect Ratio & Toggles */}
            <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Metadata & Access
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    AI Model Engine
                  </label>
                  <input
                    type="text"
                    value={modelUsed}
                    onChange={(e) => setModelUsed(e.target.value)}
                    placeholder="Midjourney v6.1 / Flux Schnell"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="4:5">4:5 (Standard Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Cinematic Landscape)</option>
                    <option value="9:16">9:16 (Story / Phone)</option>
                    <option value="3:4">3:4 (Classic Portrait)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">PRO Tier</span>
                    <span className="text-[10px] text-neutral-500">Highlight as Premium</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Featured</span>
                    <span className="text-[10px] text-neutral-500">Boost on Home feed</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 'published'}
                    onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Published</span>
                    <span className="text-[10px] text-neutral-500">Live in public gallery</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Save CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isEditing ? 'Update Prompt' : 'Create & Publish Prompt'}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Real-Time Live Preview (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Live Gallery Preview
                </span>
                <span className="text-[10px] text-neutral-500">Updates as you type</span>
              </div>

              {/* Centered Preview Card */}
              <div className="max-w-xs mx-auto">
                <PromptCard prompt={previewPrompt} />
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <p className="font-semibold text-neutral-200">Admin Tip:</p>
                <p>
                  Ensure the prompt verbatim includes camera details, lighting cues, and style tokens to maximize copy utility for users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
