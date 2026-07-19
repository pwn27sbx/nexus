// Configuración del Backend
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://nexus-production-8dca.up.railway.app';

// Algolia - usar variables de entorno
export const ALGOLIA_APP_ID = import.meta.env.PUBLIC_ALGOLIA_APP_ID || 'P34W7YOD99';
export const ALGOLIA_SEARCH_KEY = import.meta.env.PUBLIC_ALGOLIA_SEARCH_KEY || '0d8c3e7f27ab2d9f69f63b96b064a2a4';

// Categorías
export const TOP_CATEGORIES = ['All', 'Design', 'Development', 'AI Tools'];

export const ALL_CATEGORIES = [
  'Design',
  'Development',
  'AI Tools',
  'Productivity',
  'Medicine',
  'Accounting',
  'Engineering',
  'Entertainment',
  'Finance',
  'Education',
  'Marketing',
  'Utilities',
  'Crypto',
  'Security',
  'Open Source',
];

// Colores de acento
export const ACCENTS = [
  { name: 'Monochrome', hex: '#000000', darkHex: '#ffffff' },
  { name: 'Azure', hex: '#3b82f6', darkHex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981', darkHex: '#10b981' },
  { name: 'Cherry', hex: '#ef4444', darkHex: '#ef4444' },
  { name: 'Cyber', hex: '#f59e0b', darkHex: '#f59e0b' },
];

// Fuentes disponibles
export const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'system', name: 'System', value: "system-ui, -apple-system, sans-serif" },
  { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif" },
  { id: 'jetbrains', name: 'JetBrains', value: "'JetBrains Mono', monospace" },
  { id: 'geist', name: 'Geist Mono', value: "'Geist Mono', monospace" },
];

// Niveles de usuario
export const USER_LEVELS = {
  Explorer: { min: 0, icon: '🌱' },
  Contributor: { min: 5, icon: '⭐' },
  'Expert Curator': { min: 15, icon: '🏆' },
  'Master Curator': { min: 30, icon: '👑' },
};

// Umbrales de puntuación para leaderboard
export const SCORE_THRESHOLDS = {
  BRONZE: 10,
  SILVER: 50,
  GOLD: 100,
  PLATINUM: 250,
};

// Tags predefinidos
const COMMON_TAGS = [
  { id: 'gratis', label: 'Free' },
  { id: 'pago', label: 'Paid' },
  { id: 'opensource', label: 'Open Source' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'web', label: 'Web App' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'api', label: 'API' },
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'plantillas', label: 'Templates' },
  { id: 'icons', label: 'Icons' },
  { id: 'colores', label: 'Colors' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'imagenes', label: 'Images' },
  { id: 'ia', label: 'AI-Powered' },
  { id: 'colaboracion', label: 'Collaboration' },
  { id: 'automatizacion', label: 'Automation' },
  { id: 'analitica', label: 'Analytics' },
  { id: 'hosting', label: 'Hosting' },
  { id: 'base-de-datos', label: 'Database' },
  { id: 'seguridad', label: 'Security' },
];

export { COMMON_TAGS };

// Configuración de la app
export const APP_CONFIG = {
  MAX_DESCRIPTION_LENGTH: 100,
  DEBOUNCE_MS: 300,
  ITEMS_PER_PAGE: 12,
  BENTO_COLS_MD: 3,
  BENTO_COLS_LG: 4,
  LIST_PAGE_SIZE: 20,
  ALGOLIA_HITS_PER_PAGE: 12,
};
