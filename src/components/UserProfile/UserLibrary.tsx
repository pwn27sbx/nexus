import React from 'react';
import type { Tool, UserCollection } from '../../types';

interface UserLibraryProps {
  arsenal: (Tool | number)[];
  collections: UserCollection[];
  activeFolder: UserCollection | 'all' | null;
  setActiveFolder: (folder: UserCollection | 'all' | null) => void;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (isCreating: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: (e: React.FormEvent) => void;
  isLoading: boolean;
  isDark: boolean;
}

const UserLibrary: React.FC<UserLibraryProps> = ({
  arsenal,
  collections,
  activeFolder,
  setActiveFolder,
  isCreatingFolder,
  setIsCreatingFolder,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  isLoading,
  isDark,
}) => {
  const glassCard = {
    background: isDark ? 'rgba(18,16,40,0.72)' : 'rgba(255,255,255,0.42)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.62)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: '2rem',
    boxShadow: isDark
      ? '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 8px 30px rgba(80,60,180,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
  };

  return (
    <div style={{ ...glassCard, padding: '32px', minHeight: '360px' }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <svg
            className="animate-spin"
            style={{ width: '32px', height: '32px', color: isDark ? '#c084fc' : '#7c3aed' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
          </svg>
        </div>
      ) : !activeFolder ? (
        <div className="animate-fade-up">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}
          >
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
              }}
            >
              My Library
            </h3>
            <button
              onClick={() => setIsCreatingFolder(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Folder
            </button>
          </div>

          {isCreatingFolder && (
            <form
              onSubmit={handleCreateFolder}
              className="animate-fade-up"
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '18px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)',
                border: isDark
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                }}
              />
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.6)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
                }}
              >
                Create
              </button>
            </form>
          )}

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '18px' }}
            className="library-grid"
          >
            <div
              onClick={() => setActiveFolder('all')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '22px',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  gap: '6px',
                  marginBottom: '10px',
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.07)'
                    : '1px solid rgba(255,255,255,0.7)',
                  transition: 'transform 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {arsenal.slice(0, 4).map((tool: any, i) => (
                  <img
                    loading="lazy"
                    decoding="async"
                    key={i}
                    src={`https://www.google.com/s2/favicons?domain=${tool.url || ''}&sz=64`}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
                }}
              >
                All Saved
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                }}
              >
                {arsenal.length} items
              </span>
            </div>

            {collections.map((folder, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFolder(folder)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '22px',
                    padding: '8px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: '6px',
                    marginBottom: '10px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.07)'
                      : '1px solid rgba(255,255,255,0.7)',
                    transition: 'transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {folder.tools && folder.tools.length > 0
                    ? folder.tools.slice(0, 4).map((tool: any, i) => (
                        <img
                          loading="lazy"
                          decoding="async"
                          key={i}
                          src={`https://www.google.com/s2/favicons?domain=${tool.url || ''}&sz=64`}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                          }}
                        />
                      ))
                    : Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            borderRadius: '8px',
                            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.4)',
                          }}
                        />
                      ))}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isDark ? 'rgba(240,235,255,0.9)' : 'rgba(15,10,40,0.85)',
                  }}
                >
                  {folder.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                  }}
                >
                  {folder.tools ? folder.tools.length : 0} items
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-up">
          <button
            onClick={() => setActiveFolder(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? 'rgba(180,165,235,0.6)' : 'rgba(80,60,140,0.6)',
              fontWeight: 700,
              marginBottom: '20px',
              transition: 'color 0.15s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Library
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? 'rgba(240,235,255,0.95)' : 'rgba(10,8,30,0.88)',
              }}
            >
              {activeFolder === 'all' ? 'All Saved Tools' : (activeFolder as UserCollection)?.name}
            </h3>

            {activeFolder !== 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: isDark ? '#ccc' : '#555',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(activeFolder as UserCollection)?.isPublic || false}
                    onChange={async (e) => {
                      const isPublic = e.target.checked;
                      const folderName = (activeFolder as UserCollection).name;
                      const updatedCollections = collections.map((c) =>
                        c.name === folderName ? { ...c, isPublic } : c
                      );
                      // optimistic update
                      setActiveFolder({ ...(activeFolder as UserCollection), isPublic });
                      try {
                        const token = localStorage.getItem('payload-token');
                        await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `JWT ${token}`,
                          },
                          body: JSON.stringify({ collections: updatedCollections }),
                        });
                      } catch (err) {
                        console.error('Failed to update public status');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  Public
                </label>
                {(activeFolder as UserCollection)?.isPublic &&
                  (activeFolder as UserCollection)?.slug && (
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/collection/${user.id}/${(activeFolder as UserCollection).slug}`;
                        navigator.clipboard.writeText(url);
                        alert('Link copied to clipboard!');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(124,58,237,0.1)',
                        color: '#7c3aed',
                        border: '1px solid rgba(124,58,237,0.2)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Copy Link
                    </button>
                  )}
              </div>
            )}
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}
            className="tools-grid"
          >
            {(() => {
              const toolsToShow =
                activeFolder === 'all' ? arsenal : (activeFolder as UserCollection)?.tools || [];
              if (toolsToShow.length === 0)
                return (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isDark ? '#a855f7' : '#7c3aed'}
                        strokeWidth="1.5"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? 'rgba(240,235,255,0.8)' : 'rgba(15,10,40,0.7)',
                      }}
                    >
                      This folder is empty.
                    </p>
                    <p
                      style={{
                        fontSize: '13px',
                        color: isDark ? 'rgba(180,165,235,0.5)' : 'rgba(80,60,140,0.5)',
                        marginTop: '6px',
                      }}
                    >
                      Save tools from the directory to see them here.
                    </p>
                  </div>
                );

              return toolsToShow.map((tool: any) => (
                <a
                  key={tool.id}
                  href={tool.url || ''}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.07)'
                      : '1px solid rgba(255,255,255,0.7)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? 'rgba(124,58,237,0.12)'
                      : 'rgba(124,58,237,0.07)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.5)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={`https://www.google.com/s2/favicons?domain=${tool.url}&sz=64`}
                    alt=""
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isDark ? 'rgba(240,235,255,0.92)' : 'rgba(15,10,40,0.88)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {tool.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isDark ? 'rgba(180,160,255,0.5)' : 'rgba(120,90,200,0.5)',
                      }}
                    >
                      {tool.category}
                    </span>
                  </div>
                </a>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLibrary;
