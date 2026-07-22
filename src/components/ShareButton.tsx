import React, { useState } from 'react';
import { playSound } from '../utils/sounds';

interface ShareButtonProps {
  url: string;
  name: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ url, name }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: `Check out ${name} on Nexus Directory!`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        playSound('snap');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or error
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-zinc-400 hover:text-accent transition-colors p-1"
      aria-label={copied ? 'Copied!' : 'Share tool'}
      title={copied ? 'Copied!' : 'Share'}
    >
      {copied ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
};

export default ShareButton;
