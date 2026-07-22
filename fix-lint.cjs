const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
};

// 1. src/utils/helpers.ts
replaceInFile('src/utils/helpers.ts', [
  { from: 'export const getBentoSpan = (i: number, total: number) => {', to: 'export const getBentoSpan = (i: number, _total: number) => {' }
]);

// 2. src/components/SavePopover.tsx
replaceInFile('src/components/SavePopover.tsx', [
  { from: '} catch (err) {', to: '} catch (_err) {' }
]);

// 3. src/components/AutoCaptureModal.tsx
replaceInFile('src/components/AutoCaptureModal.tsx', [
  { from: 'import { GlobeIcon, DescIcon, CloseIcon, CheckIcon, SpinnerIcon, PlusIcon } from \'../utils/icons\';', to: 'import { GlobeIcon, DescIcon, CheckIcon, SpinnerIcon } from \'../utils/icons\';' }
]);

// 4. src/components/LeaderboardModal.tsx
replaceInFile('src/components/LeaderboardModal.tsx', [
  { from: 'import { API_BASE_URL, SCORE_THRESHOLDS } from \'../utils/constants\';', to: 'import { API_BASE_URL } from \'../utils/constants\';' },
  { from: '} catch (error) {', to: '} catch (_error) {' }
]);

// 5. src/components/HeroBentoCard.tsx
replaceInFile('src/components/HeroBentoCard.tsx', [
  { from: 'import type { Tool, User, SavePopoverConfig, HeroBentoCardProps } from \'../types\';', to: 'import type { HeroBentoCardProps } from \'../types\';' }
]);

// 6. src/components/SpatialCommunityHub.tsx
replaceInFile('src/components/SpatialCommunityHub.tsx', [
  { from: '  searchQuery,\n  setIsCommandPaletteOpen,', to: '  _searchQuery,\n  setIsCommandPaletteOpen,' }
]);

// 7. src/components/Directory.tsx
replaceInFile('src/components/Directory.tsx', [
  { from: 'import React, { useState, useEffect, useCallback, useRef } from \'react\';', to: 'import React, { useState, useEffect, useCallback } from \'react\';' },
  { from: 'import { GridIcon, ListIcon, TrophyIcon, SunIcon, MoonIcon, LayersIcon } from \'@/utils/icons\';', to: 'import { GridIcon, ListIcon, TrophyIcon, SunIcon, MoonIcon } from \'@/utils/icons\';' },
  { from: 'import type { Tool, SavePopoverConfig } from \'@/types\';\n', to: '' },
  { from: 'icon: (active: boolean) => (', to: 'icon: (_active: boolean) => (' },
  { from: 'const [activeTags, setActiveTags] = useState<string[]>([]);', to: 'const [activeTags] = useState<string[]>([]);' },
  { from: 'isAdminPanelOpen,\n    setIsAdminPanelOpen,', to: 'setIsAdminPanelOpen,' },
  { from: 'const { user, logout: handleLogout } = useAuth();', to: 'const { user } = useAuth();' }
]);

// 8. src/components/BentoCard.tsx
replaceInFile('src/components/BentoCard.tsx', [
  { from: '({ tool, isFocused, index, total, onSaveRequest, isDark }) => {', to: '({ tool, isFocused, index, _total, onSaveRequest, isDark }) => {' },
  { from: 'import { HeartIcon, ArrowUpRight } from \'../utils/icons\';', to: 'import { ArrowUpRight } from \'../utils/icons\';' },
  { from: 'import ShareButton from \'./ShareButton\';\n', to: '' }
]);

// 9. src/components/AdminPanel.tsx
replaceInFile('src/components/AdminPanel.tsx', [
  { from: 'const [expandedToolId, setExpandedToolId] = useState<string | number | null>(null);', to: '' },
  { from: /\} catch \(error\) \{/g, to: '} catch (_error) {' }
]);

// 10. src/components/UserProfile.tsx
replaceInFile('src/components/UserProfile.tsx', [
  { from: /\} catch \(error\) \{/g, to: '} catch (_error) {' }
]);

// 11. src/components/AuthModal.tsx
replaceInFile('src/components/AuthModal.tsx', [
  { from: /\} catch \(error\) \{/g, to: '} catch (_error) {' }
]);

// 12. src/utils/sounds.ts
replaceInFile('src/utils/sounds.ts', [
  { from: /\} catch \(e\) \{/g, to: '} catch (_e) {' }
]);

// 13. src/components/ListCard.tsx (missed it in my first scan)
replaceInFile('src/components/ListCard.tsx', [
  { from: 'const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains(\'dark\'));', to: 'const [isDark] = useState(() => document.documentElement.classList.contains(\'dark\'));' }
]);

console.log("Fixes applied.");
