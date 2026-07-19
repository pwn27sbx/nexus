import React, { useState } from 'react';
import { GlobeIcon, DescIcon, CloseIcon, CheckIcon, SpinnerIcon, PlusIcon } from '../utils/icons';
import { ALL_CATEGORIES, API_BASE_URL, APP_CONFIG, COMMON_TAGS } from '../utils/constants';
import { isValidUrl } from '../utils/helpers';
import { playSound } from '../utils/sounds';

const AutoCaptureModal = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Design');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [urlError, setUrlError] = useState('');

  const addTag = (tag) => {
    const clean = tag.toLowerCase().trim();
    if (clean && !selectedTags.includes(clean) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  if (!isOpen) return null;

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val && !isValidUrl(val)) {
      setUrlError('Please enter a valid URL (https://...)');
    } else {
      setUrlError('');
    }
  };

  const handleCapture = async (e) => {
    e.preventDefault();
    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL (https://...)');
      return;
    }
    setSubmitStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          url,
          category,
          description,
          tags: selectedTags,
          status: 'pending',
          submittedBy: user ? user.id : null,
        }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        playSound('success');
        setTimeout(() => {
          onClose();
          setName('');
          setUrl('');
          setDescription('');
          setCategory('Design');
          setSelectedTags([]);
          setTagInput('');
          setSubmitStatus('idle');
          setUrlError('');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl transition-opacity p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Suggest a tool"
    >
      <div className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-3xl border border-white/20 dark:border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight mb-2">
          Suggest Tool
        </h2>
        <p className="text-[15px] text-zinc-500 font-medium mb-8">
          Add a resource to the directory.
        </p>

        {submitStatus === 'success' ? (
          <div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center shadow-lg mb-5">
              <CheckIcon size={40} />
            </div>
            <h3 className="text-black dark:text-white font-extrabold text-2xl tracking-tight mb-1">
              Received!
            </h3>
            <p className="text-[15px] text-zinc-500">Waiting for curation review.</p>
          </div>
        ) : (
          <form onSubmit={handleCapture}>
            <div className="flex flex-col gap-5 mb-8">
              <input
                type="text"
                required
                placeholder="Tool Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitStatus === 'loading'}
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 ring-accent transition-all text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500"
                aria-label="Tool name"
              />
              <div>
                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                  <GlobeIcon />
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={url}
                    onChange={handleUrlChange}
                    disabled={submitStatus === 'loading'}
                    className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500"
                    aria-label="Tool URL"
                  />
                </div>
                {urlError && (
                  <p className="text-red-500 text-[12px] font-bold mt-2 ml-2">{urlError}</p>
                )}
              </div>
              <div className="flex items-start gap-3 bg-black/5 dark:bg-white/5 rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                <div className="mt-0.5">
                  <DescIcon />
                </div>
                <input
                  type="text"
                  required
                  maxLength={APP_CONFIG.MAX_DESCRIPTION_LENGTH}
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitStatus === 'loading'}
                  className="bg-transparent border-none outline-none w-full text-[16px] font-bold text-black dark:text-white placeholder:text-zinc-500"
                  aria-label="Description"
                />
              </div>
              {/* Tags Section */}
              <div className="bg-black/5 dark:bg-white/5 rounded-[16px] px-5 py-4 focus-within:ring-2 focus-within:ring-accent transition-all">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-white text-[11px] font-bold">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:opacity-70" aria-label={`Remove ${tag}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </span>
                  ))}
                  {selectedTags.length < 5 && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
                          else if (e.key === ',' || e.key === 'Tab') { e.preventDefault(); addTag(tagInput.replace(',', '')); }
                        }}
                        placeholder="Add tag..."
                        disabled={submitStatus === 'loading'}
                        className="bg-transparent border-none outline-none text-[14px] font-bold text-black dark:text-white placeholder:text-zinc-500 min-w-[80px] flex-1"
                      />
                    </div>
                  )}
                </div>
                {/* Common Tags Suggestion */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TAGS.filter((t) => !selectedTags.includes(t.id)).slice(0, 8).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addTag(t.id)}
                      disabled={submitStatus === 'loading'}
                      className="px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-zinc-500 text-[10px] font-bold hover:bg-accent hover:text-white transition-all"
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitStatus === 'loading'}
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-[16px] px-5 py-4 outline-none focus:ring-2 focus:ring-accent transition-all text-[16px] font-bold text-black dark:text-white appearance-none"
                aria-label="Category"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {submitStatus === 'error' && (
              <p className="text-red-500 text-[14px] font-bold mb-4 text-center">
                Server connection failed.
              </p>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full bg-accent text-white text-[18px] font-extrabold tracking-tight py-4 rounded-[16px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
            >
              {submitStatus === 'loading' ? (
                <>
                  <SpinnerIcon size={18} /> Sending...
                </>
              ) : (
                'Submit to Directory'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AutoCaptureModal;
