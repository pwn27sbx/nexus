const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
};

// 1. AuthModal.tsx
replaceInFile('src/components/AuthModal.tsx', [
  { from: 'import { useModals } from \'../contexts/ModalContext\';', to: 'import { useStore } from \'@nanostores/react\';\nimport { isAuthModalOpen } from \'../stores/modals\';' },
  { from: 'const { isAuthModalOpen: isOpen, setIsAuthModalOpen } = useModals();', to: 'const isOpen = useStore(isAuthModalOpen);\n  const setIsAuthModalOpen = isAuthModalOpen.set;' }
]);

// 2. UserProfile.tsx
replaceInFile('src/components/UserProfile.tsx', [
  { from: 'import { useModals } from \'../contexts/ModalContext\';', to: 'import { useStore } from \'@nanostores/react\';\nimport { isProfileOpen } from \'../stores/modals\';' },
  { from: 'const { isProfileOpen: isOpen, setIsProfileOpen } = useModals();', to: 'const isOpen = useStore(isProfileOpen);\n  const setIsProfileOpen = isProfileOpen.set;' }
]);

// 3. LeaderboardModal.tsx
replaceInFile('src/components/LeaderboardModal.tsx', [
  { from: 'import { useModals } from \'../contexts/ModalContext\';', to: 'import { useStore } from \'@nanostores/react\';\nimport { isLeaderboardOpen } from \'../stores/modals\';' },
  { from: 'const { isLeaderboardOpen: isOpen, setIsLeaderboardOpen } = useModals();', to: 'const isOpen = useStore(isLeaderboardOpen);\n  const setIsLeaderboardOpen = isLeaderboardOpen.set;' }
]);

// 4. AdminPanel.tsx
replaceInFile('src/components/AdminPanel.tsx', [
  { from: 'import { useModals } from \'../contexts/ModalContext\';', to: 'import { useStore } from \'@nanostores/react\';\nimport { isAdminPanelOpen } from \'../stores/modals\';' },
  { from: 'const { isAdminPanelOpen: isOpen, setIsAdminPanelOpen } = useModals();', to: 'const isOpen = useStore(isAdminPanelOpen);\n  const setIsAdminPanelOpen = isAdminPanelOpen.set;' }
]);

// 5. CategoriesModal.tsx - wait, does this exist? I'll check first.
// 6. Directory.tsx

console.log("Modal refactors applied.");
