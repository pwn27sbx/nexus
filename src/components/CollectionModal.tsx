import React from 'react';
import { X } from 'lucide-react';
import BentoCard from './BentoCard';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: any;
  isDark: boolean;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  isDark,
}) => {
  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-5xl h-full max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col"
        style={{
          background: isDark ? 'rgba(18,16,40,0.75)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: isDark
            ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)'
            : 'inset 0 1px 1px rgba(255,255,255,0.7), 0 20px 40px rgba(0,0,0,0.12)',
        }}
      >
        <div
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          <div>
            <h2
              className="text-2xl font-bold font-display"
              style={{ color: isDark ? 'white' : 'black' }}
            >
              {collection.title}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              Curated by {collection.author?.nickname || 'User'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'white' : 'black',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {collection.description && (
            <p
              className="mb-8 max-w-3xl"
              style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}
            >
              {collection.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {collection.tools?.length > 0 ? (
              collection.tools.map((tool: any, index: number) => (
                <BentoCard key={tool.id || index} tool={tool} index={index} isDark={isDark} />
              ))
            ) : (
              <div
                className="col-span-full py-12 text-center"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
              >
                No tools in this collection yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
