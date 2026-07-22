const fs = require('fs');

let content = fs.readFileSync('src/components/Directory.tsx', 'utf-8');

// Replace import
content = content.replace(
  "import { useModals } from '@/contexts/ModalContext';",
  "import { useStore } from '@nanostores/react';\nimport { isAuthModalOpen, isCategoryModalOpen, isCommandPaletteOpen, isSubmitModalOpen, isProfileOpen, isLeaderboardOpen, isAdminPanelOpen } from '@/stores/modals';"
);

// Replace destructuring
const fromModals = `  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isSubmitModalOpen: isModalOpen,
    setIsSubmitModalOpen: setIsModalOpen,
    isProfileOpen,
    setIsProfileOpen,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    setIsAdminPanelOpen,
  } = useModals();`;

const toModals = `  const isAuthModalOpenVal = useStore(isAuthModalOpen);
  const setIsAuthModalOpen = isAuthModalOpen.set;
  const isCategoryModalOpenVal = useStore(isCategoryModalOpen);
  const setIsCategoryModalOpen = isCategoryModalOpen.set;
  const isCommandPaletteOpenVal = useStore(isCommandPaletteOpen);
  const setIsCommandPaletteOpen = isCommandPaletteOpen.set;
  const isModalOpen = useStore(isSubmitModalOpen);
  const setIsModalOpen = isSubmitModalOpen.set;
  const isProfileOpenVal = useStore(isProfileOpen);
  const setIsProfileOpen = isProfileOpen.set;
  const isLeaderboardOpenVal = useStore(isLeaderboardOpen);
  const setIsLeaderboardOpen = isLeaderboardOpen.set;
  const setIsAdminPanelOpen = isAdminPanelOpen.set;`;

content = content.replace(fromModals, toModals);

// Replace variables in useEffect
content = content.replace(/isAuthModalOpen \|\|/g, 'isAuthModalOpenVal ||');
content = content.replace(/isProfileOpen \|\|/g, 'isProfileOpenVal ||');
content = content.replace(/isLeaderboardOpen \|\|/g, 'isLeaderboardOpenVal ||');
content = content.replace(/isCommandPaletteOpen \|\|/g, 'isCommandPaletteOpenVal ||');
content = content.replace(/isCategoryModalOpen \|\|/g, 'isCategoryModalOpenVal ||');

// Replace remaining usages
content = content.replace(/isAuthModalOpen &&/g, 'isAuthModalOpenVal &&');
content = content.replace(/isProfileOpen &&/g, 'isProfileOpenVal &&');
content = content.replace(/isLeaderboardOpen &&/g, 'isLeaderboardOpenVal &&');
content = content.replace(/isCommandPaletteOpen &&/g, 'isCommandPaletteOpenVal &&');
content = content.replace(/isCategoryModalOpen &&/g, 'isCategoryModalOpenVal &&');

fs.writeFileSync('src/components/Directory.tsx', content);
console.log("Directory refactored.");
