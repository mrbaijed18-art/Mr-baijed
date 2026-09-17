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
  Maximize2,
  CheckCircle2,
  Trash2,
  Loader2
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

  // Image Upload state - default to upload tab for seamless user photo addition
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
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
    setUploadProgress(15);
    setUploadedFileName(file.name);
    try {
      const url = await uploadPromptImage(file, undefined, (percent) => {
        setUploadProgress(percent);
      });
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

      const promptId = editPromptId || `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const promptData: PromptItem = {
        id: promptId,
        title: title.trim(),
        prompt: promptText.trim(),
        category,
        tags: parsedTags,
        modelUsed,
        aspectRatio,
        imageUrl: imageUrl.trim(),
        isPremium,
        isFeatured,
        status,
        likes: 0,
        copies: 0,
        views: 0,
        authorName: 'PromptVerse Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing && editPromptId) {
        await updatePrompt(editPromptId, promptData);
        showToast('Prompt updated successfully!', 'success');
      } else {
        await createPrompt(promptData);
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
              className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {isEditing ? 'Edit Prompt' : 'Create New AI Prompt'}
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
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
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Prompt Identification
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Prompt Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Geisha with Holographic Kanji"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Full Prompt Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Complete Prompt Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Paste the verbatim prompt text here..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-xs"
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="neon, cyberpunk, 8k, portrait"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload / URL Input */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Preview Image *
                </h2>

                <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      imageTab === 'url' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      imageTab === 'upload' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    File Upload
                  </button>
                </div>
              </div>

              {imageTab === 'url' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Direct Web Image URL (HTTPS)
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <img
                        src={imageUrl}
                        alt="URL preview"
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-200 dark:bg-neutral-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> URL Linked
                        </span>
                        <p className="text-[11px] text-neutral-400 truncate">{imageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : uploadingImage ? (
                /* Uploading in Progress */
                <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Optimizing & uploading photo... {uploadProgress}%
                  </p>
                  <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2">
                    Auto-compressing image to ensure fast cloud storage upload
                  </p>
                </div>
              ) : imageUrl ? (
                /* Uploaded Photo Preview Card */
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden border border-emerald-500/40 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-sm">
                    <img
                      src={imageUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Photo Uploaded & Ready</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {uploadedFileName || 'Uploaded Photo'}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate font-mono">
                      {imageUrl.startsWith('data:') ? 'Local preview ready' : imageUrl}
                    </p>

                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('file-upload-input');
                          if (input) input.click();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setUploadedFileName('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

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
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/40'
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
                  <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Click to select photo or drag & drop here
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    PNG, JPG, WebP supported (auto-optimized & compressed)
                  </p>
                </div>
              )}
            </div>

            {/* Model Used, Aspect Ratio & Toggles */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Metadata & Access
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    AI Model Engine
                  </label>
                  <input
                    type="text"
                    value={modelUsed}
                    onChange={(e) => setModelUsed(e.target.value)}
                    placeholder="Midjourney v6.1 / Flux Schnell"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
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
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white block">PRO Tier</span>
                    <span className="text-[10px] text-neutral-500">Highlight as Premium</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-indigo-500 focus:ring-indigo-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white block">Featured</span>
                    <span className="text-[10px] text-neutral-500">Boost on Home feed</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 'published'}
                    onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white block">Published</span>
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
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
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
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  Live Gallery Preview
                </span>
                <span className="text-[10px] text-neutral-500">Updates as you type</span>
              </div>

              {/* Centered Preview Card */}
              <div className="max-w-xs mx-auto">
                <PromptCard prompt={previewPrompt} />
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-2 shadow-xs">
                <p className="font-semibold text-neutral-900 dark:text-neutral-200">Admin Tip:</p>
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
