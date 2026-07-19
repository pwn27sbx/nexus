import React from 'react';

// Wrapper para todos los iconos con aria-label de accesibilidad
const IconWrapper = ({ children, className = '', size = 18, label = '', strokeWidth = '2.5' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden={label ? undefined : 'true'}
    aria-label={label || undefined}
    role={label ? 'img' : undefined}
  >
    {children}
  </svg>
);

export const SearchIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
);

export const UserIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
);

export const PlusIcon = ({ className, size = 14 }) => (
  <IconWrapper className={className} size={size}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

export const GlobeIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </IconWrapper>
);

export const HeartIcon = ({ className, isSaved, size }) => (
  <IconWrapper
    className={`transition-transform duration-300 hover:scale-110 ${className || ''}`}
    size={size}
    label={isSaved ? 'Remove from saved' : 'Save tool'}
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={isSaved ? 'currentColor' : 'none'}
    />
  </IconWrapper>
);

export const GridIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </IconWrapper>
);

export const ListIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </IconWrapper>
);

export const DescIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size} strokeWidth="2">
    <line x1="21" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </IconWrapper>
);

export const ArrowUpRight = ({ className, size = 16 }) => (
  <IconWrapper className={className} size={size} strokeWidth="3">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </IconWrapper>
);

export const TrophyIcon = ({ className, size }) => (
  <IconWrapper className={className} size={size}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </IconWrapper>
);

export const LayersIcon = ({ className, size = 16 }) => (
  <IconWrapper className={className} size={size}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </IconWrapper>
);

export const CloseIcon = ({ className, size = 20 }) => (
  <IconWrapper className={className} size={size}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const CheckIcon = ({ className, size = 20 }) => (
  <IconWrapper className={className} size={size}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const SpinnerIcon = ({ className, size = 24 }) => (
  <svg
    className={`animate-spin ${className || ''}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
  </svg>
);

export const FolderIcon = ({ className, size = 24 }) => (
  <IconWrapper className={className} size={size} strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const SunIcon = ({ className, size = 18 }) => (
  <IconWrapper className={className} size={size}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </IconWrapper>
);

export const MoonIcon = ({ className, size = 18 }) => (
  <IconWrapper className={className} size={size}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </IconWrapper>
);

export const ShareIcon = ({ className, size = 16 }) => (
  <IconWrapper className={className} size={size}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </IconWrapper>
);

export const SortIcon = ({ className, size = 16 }) => (
  <IconWrapper className={className} size={size} strokeWidth="2">
    <line x1="16" y1="3" x2="16" y2="21" />
    <polyline points="8 3 3 8 13 8" />
    <polyline points="16 21 21 16 11 16" />
  </IconWrapper>
);

export const ArrowLeftIcon = ({ className, size = 20 }) => (
  <IconWrapper className={className} size={size}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconWrapper>
);
