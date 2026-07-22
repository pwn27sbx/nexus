// === Tool Types ===
export interface Tool {
  id: string | number;
  name: string;
  category: string;
  url: string;
  imageUrl: string;
  description: string;
  tags?: string[];
  gridHeight?: 'normal' | 'tall';
  screenshotUrl?: string;
  status?: 'pending' | 'approved';
  submittedBy?: number | User | null;
}

// === User Types ===
export interface User {
  id: number;
  email: string;
  nickname?: string;
  role?: 'user' | 'admin';
  bookmarks?: (number | Tool)[];
  level?: 'Explorer' | 'Contributor' | 'Expert Curator' | 'Master Curator';
  approvedCount?: number;
  score?: number;
  collections?: UserCollection[];
  updatedAt?: string;
  createdAt?: string;
}

export interface UserCollection {
  name: string;
  tools?: (number | Tool)[];
  id?: string;
}

// === UI Types ===
export interface SavePopoverConfig {
  tool: Tool;
  rect: DOMRect;
}

export interface AccentColor {
  name: string;
  hex: string;
  darkHex: string;
}

export interface FontOption {
  id: string;
  name: string;
  value: string;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface TagOption {
  id: string;
  label: string;
}

export interface UserLevel {
  min: number;
  icon: string;
}

export interface Badge {
  name: string;
  icon: string;
  minScore: number;
  color: string;
}

// === Props Types ===
export interface BentoCardProps {
  tool: Tool;
  user: User | null;
  onRequireAuth: () => void;
  isFocused: boolean;
  index: number;
  total: number;
  onSaveRequest: (config: SavePopoverConfig) => void;
  isDark?: boolean;
}

export interface ListCardProps {
  tool: Tool;
  user: User | null;
  onRequireAuth: () => void;
  isFocused: boolean;
  indexNumber: number;
  onSaveRequest: (config: SavePopoverConfig) => void;
  isDark?: boolean;
  delay?: string;
}

export interface SavePopoverProps {
  config: SavePopoverConfig | null;
  onClose: () => void;
  user: User | null;
  setUser: (user: User) => void;
}

export interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  tools: Tool[];
}

export interface AutoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
}

export interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

// === Sound Types ===
export type SoundType = 'pop' | 'woosh' | 'snap' | 'success';

// === App Config ===
export interface AppConfig {
  MAX_DESCRIPTION_LENGTH: number;
  DEBOUNCE_MS: number;
  ITEMS_PER_PAGE: number;
  BENTO_COLS_MD: number;
  BENTO_COLS_LG: number;
  LIST_PAGE_SIZE: number;
  ALGOLIA_HITS_PER_PAGE: number;
}

export interface HeroBentoCardProps {
  tool: Tool;
  user: User | null;
  onRequireAuth: () => void;
  isFocused: boolean;
  onSaveRequest: (config: SavePopoverConfig) => void;
  isDark: boolean;
}

export interface SpatialCommunityHubProps {
  isDark: boolean;
  onRequireAuth: () => void;
  user: User | null;
  searchQuery: string;
  setIsCommandPaletteOpen: (isOpen: boolean) => void;
}
