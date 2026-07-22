import React, { useState, useEffect } from 'react';
import { GlobeIcon, DescIcon, CloseIcon, CheckIcon, SpinnerIcon, PlusIcon } from '../utils/icons';
import { ALL_CATEGORIES, API_BASE_URL, APP_CONFIG, COMMON_TAGS } from '../utils/constants';
import { isValidUrl } from '../utils/helpers';
import { playSound } from '../utils/sounds';
import type { AutoCaptureModalProps } from '../types';
import { useAuth } from '../contexts/AuthContext';

const AutoCaptureModal: React.FC<AutoCaptureModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Design');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [urlError, setUrlError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const isDark =
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  useEffect(() => {
    if (isValidUrl(url)) {
      const timer = setTimeout(() => setPreviewUrl(url), 600);
      return () => clearTimeout(timer);
    } else {
      setPreviewUrl('');
    }
  }, [url]);

  const addTag = (tag: string) => {
    const clean = tag.toLowerCase().trim();
    if (clean && !selectedTags.includes(clean) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (val && !isValidUrl(val)) {
      setUrlError('Please enter a valid URL (https://...)');
    } else {
      setUrlError('');
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
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
          setPreviewUrl('');
          setErrorMessage('');
        }, 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.error || errorData.message || 'Server connection failed.');
        setSubmitStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred.');
      setSubmitStatus('error');
    }
  };

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.65)',
    borderRadius: '16px',
    padding: '14px 18px',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 600,
    color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(20,15,50,0.85)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(180,195,240,0.45)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Suggest a tool"
    >
      {/* Close pill */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:scale-105"
        style={{
          background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.88)',
          border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.95)',
          color: isDark ? 'rgba(230,220,255,0.9)' : 'rgba(40,30,70,0.8)',
          backdropFilter: 'blur(16px)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(80,60,180,0.12)',
          zIndex: 10,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Close
      </button>

      {/* Main content */}
      <div
        className="relative w-full submit-layout animate-scale-in flex flex-col md:flex-row"
        style={{ maxWidth: '960px', padding: '0 16px', maxHeight: '95vh', gap: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — Preview */}
        <div
          className="submit-preview flex-1 min-h-[220px] md:min-h-[400px] flex flex-col p-2.5 md:p-3"
          style={{
            background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.09)'
              : '1px solid rgba(255,255,255,0.62)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '2rem',
            overflow: 'hidden',
            boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.04)',
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: isDark ? 'rgba(15,12,32,0.85)' : 'rgba(248,246,255,0.9)',
              borderBottom: isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(200,192,240,0.25)',
              borderRadius: '1.25rem 1.25rem 0 0',
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ff5f57',
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#febc2e',
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#28c840',
                  opacity: 0.85,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                height: '20px',
                borderRadius: '5px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '10px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  color: isDark ? 'rgba(180,160,255,0.35)' : 'rgba(100,80,180,0.45)',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {previewUrl
                  ? previewUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
                  : 'preview.site'}
              </span>
            </div>
          </div>
          {/* Preview content */}
          <div
            style={{
              flex: 1,
              borderRadius: '0 0 1.25rem 1.25rem',
              overflow: 'hidden',
              background: isDark ? 'rgba(10,8,20,0.6)' : 'rgba(240,238,248,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {previewUrl ? (
              <>
                <img
                  src={`https://image.thum.io/get/width/1200/crop/800/${previewUrl}`}
                  alt="Website Preview"
                  style={{
                    border: 'none',
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: isDark
                      ? 'linear-gradient(to top, rgba(10,8,20,0.8), transparent)'
                      : 'linear-gradient(to top, rgba(240,238,248,0.6), transparent)',
                    pointerEvents: 'none',
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '28px',
                  }}
                >
                  🌐
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDark ? 'rgba(180,165,240,0.5)' : 'rgba(100,80,160,0.45)',
                  }}
                >
                  Enter a URL to see a live preview
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    marginTop: '6px',
                    color: isDark ? 'rgba(160,145,220,0.35)' : 'rgba(120,100,180,0.35)',
                  }}
                >
                  The website will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div
          className="submit-form w-full md:max-w-[380px] p-5 md:p-7 overflow-y-auto no-scrollbar"
          style={{
            background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.09)'
              : '1px solid rgba(255,255,255,0.62)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRadius: '2rem',
            boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.04)',
            maxHeight: '100%',
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Submit Tool
          </h2>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
              marginBottom: '24px',
            }}
          >
            Add a resource to the directory.
          </p>

          {submitStatus === 'success' ? (
            <div className="py-10 flex flex-col items-center justify-center text-center animate-scale-in">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                  marginBottom: '16px',
                }}
              >
                <CheckIcon size={32} />
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
                  marginBottom: '4px',
                }}
              >
                Received!
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.55)',
                }}
              >
                Waiting for curation review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCapture}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <input
                  type="text"
                  required
                  placeholder="Tool Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitStatus === 'loading'}
                  style={inputStyle}
                  aria-label="Tool name"
                />
                <div>
                  <div
                    style={{
                      ...inputStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 18px',
                    }}
                  >
                    <GlobeIcon />
                    <input
                      type="url"
                      required
                      placeholder="https://example.com"
                      value={url}
                      onChange={handleUrlChange}
                      disabled={submitStatus === 'loading'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(20,15,50,0.85)',
                      }}
                      aria-label="Tool URL"
                    />
                  </div>
                  {urlError && (
                    <p
                      style={{
                        color: '#ef4444',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginTop: '6px',
                        marginLeft: '4px',
                      }}
                    >
                      {urlError}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 18px',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
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
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(20,15,50,0.85)',
                    }}
                    aria-label="Description"
                  />
                </div>
                <div style={{ ...inputStyle, padding: '12px 16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: selectedTags.length > 0 ? '10px' : '0',
                    }}
                  >
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          background:
                            'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          aria-label={`Remove ${tag}`}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {selectedTags.length < 5 && (
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(tagInput);
                          } else if (e.key === ',' || e.key === 'Tab') {
                            e.preventDefault();
                            addTag(tagInput.replace(',', ''));
                          }
                        }}
                        placeholder="Add tag..."
                        disabled={submitStatus === 'loading'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          minWidth: '80px',
                          flex: 1,
                          color: isDark ? 'rgba(235,230,255,0.9)' : 'rgba(20,15,50,0.85)',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {COMMON_TAGS.filter((t) => !selectedTags.includes(t.id))
                      .slice(0, 6)
                      .map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => addTag(t.id)}
                          disabled={submitStatus === 'loading'}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            color: isDark ? 'rgba(180,165,240,0.6)' : 'rgba(80,60,140,0.55)',
                            fontSize: '10px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
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
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
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
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    textAlign: 'center',
                  }}
                >
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background:
                    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                  transition: 'all 0.2s ease',
                  opacity: submitStatus === 'loading' ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitStatus === 'loading' ? (
                  <>
                    <SpinnerIcon size={16} /> Sending...
                  </>
                ) : (
                  'Submit to Directory'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .submit-layout { flex-direction: column !important; }
          .submit-preview { min-height: 240px !important; }
          .submit-form { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default AutoCaptureModal;
