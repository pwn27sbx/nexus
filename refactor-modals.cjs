const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
};

// 1. AppProvider.tsx
replaceInFile('src/contexts/AppProvider.tsx', [
  { from: 'import { ModalProvider } from \'./ModalContext\';\n', to: '' },
  { from: '<ModalProvider>', to: '<>' },
  { from: '</ModalProvider>', to: '</>' }
]);

// 2. Simple "setter only" components:
const simpleSetterFiles = [
  'src/components/SpatialCommunityHub.tsx',
  'src/components/ListCard.tsx',
  'src/components/HeroBentoCard.tsx',
  'src/components/CollectionsView.tsx',
  'src/components/BentoCard.tsx'
];

for (const file of simpleSetterFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/import \{ useModals \} from '(..\/|\.\/)contexts\/ModalContext';/g, 'import { isAuthModalOpen } from \'../stores/modals\';');
  // BentonCard uses 'import { useModals } from '../contexts/ModalContext';' which is captured above.
  
  // Replace setter destruction
  content = content.replace(/const \{ setIsAuthModalOpen \} = useModals\(\);/g, 'const setIsAuthModalOpen = isAuthModalOpen.set;');
  
  fs.writeFileSync(file, content);
}

// 3. Modal Components (AuthModal, UserProfile, LeaderboardModal, AdminPanel, Directory, CategoriesModal)
// Let's just do them manually with replace_file_content or multi_replace_file_content because they are complex.

console.log("Simple refactors applied.");
