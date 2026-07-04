import React, { useState, useEffect, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite'; // Usamos la versión 'lite' para que cargue más rápido en el navegador

// Inicializamos Algolia usando la sintaxis correcta de Astro/Vite
const searchClient = algoliasearch(
  "P34W7YOD99",
  "0d8c3e7f27ab2d9f69f63b96b064a2a4"
);
const index = searchClient.initIndex('tools');

// Iconos convertidos a componentes válidos
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const MasonryCard = ({ tool }) => {
  return (
    // Borde exterior blanco/negro con padding para crear el efecto marco. Reducimos el mb-6 a mb-4 para juntarlas.
    <div className="break-inside-avoid mb-4 group cursor-pointer flex flex-col gap-1.5 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 p-1.5 rounded-[22px] shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1">

      {/* Caja Superior (Contiene Header e Imagen) */}
      <div className="bg-[#f4f4f5] dark:bg-[#161616] rounded-[16px] p-3 flex flex-col transition-colors">

        {/* Header (Textos separados e insertados en el área gris) */}
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-zinc-900 dark:text-white text-[13px] font-medium tracking-tight truncate pr-4">
            {tool.name}
          </h3>
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium whitespace-nowrap">
            {tool.category}
          </span>
        </div>

        {/* Contenedor de la Imagen Inset */}
        <div className={`relative w-full ${tool.heightClass} rounded-[10px] overflow-hidden bg-white dark:bg-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`}>
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Caja Inferior (Botón visualmente separado pero dentro del marco general) */}
      <div className="bg-[#f4f4f5] dark:bg-[#161616] rounded-[14px] py-2.5 flex justify-center items-center text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
        {tool.actionText}
      </div>

    </div>
  );
};

const AutoCaptureModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Design');
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error

  if (!isOpen) return null;

  const handleCapture = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      // Enviamos los datos directamente a tu Payload CMS
      const response = await fetch('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          url,
          category,
          // El estado "pending" se asigna automáticamente en el backend
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Esperamos unos segundos para que el usuario lea el mensaje de éxito
        setTimeout(() => {
          onClose();
          setName('');
          setUrl('');
          setCategory('Design');
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/10 dark:bg-black/40 backdrop-blur-md transition-opacity">
      <div className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 w-[90%] max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-lg font-medium text-black dark:text-white mb-1">Suggest a tool</h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-5">Submissions will be reviewed before appearing on the directory.</p>

        {submitStatus === 'success' ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-black dark:text-white font-medium mb-1">Tool Submitted!</h3>
            <p className="text-[13px] text-zinc-500">The automation is generating the preview. It's now waiting for approval.</p>
          </div>
        ) : (
          <form onSubmit={handleCapture}>
            <div className="flex flex-col gap-3 mb-5">
              <input
                type="text"
                required
                placeholder="Tool Name (e.g. Figma)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitStatus === 'loading'}
                className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white placeholder:text-zinc-400 transition-all"
              />

              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
                <GlobeIcon />
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={submitStatus === 'loading'}
                  className="bg-transparent border-none outline-none w-full text-sm text-black dark:text-white placeholder:text-zinc-400"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitStatus === 'loading'}
                className="w-full bg-zinc-50 dark:bg-black border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm text-black dark:text-white transition-all appearance-none cursor-pointer"
              >
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="AI Tools">AI Tools</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            {submitStatus === 'error' && (
              <p className="text-red-500 text-[12px] mb-3 text-center">Something went wrong. Make sure the server is running.</p>
            )}

            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitStatus === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sending to server...
                </>
              ) : "Submit to Directory"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Escuchar los cambios de tema del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => document.documentElement.classList.toggle('dark', e.matches);
    document.documentElement.classList.toggle('dark', mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Hacer el Fetch a Algolia
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        // Buscamos en Algolia usando el searchQuery actual
        const { hits } = await index.search(searchQuery);

        const fetchedTools = hits.map((tool, index) => {
          const heights = ["h-[200px]", "h-[240px]", "h-[220px]", "h-[260px]", "h-[280px]"];
          const assignedHeight = tool.gridHeight === 'tall'
            ? (index % 2 === 0 ? "h-[450px]" : "h-[500px]")
            : heights[index % heights.length];

          return {
            id: tool.objectID, // Algolia usa objectID
            name: tool.name,
            category: tool.category,
            url: tool.url,
            // Las URLs de Microlink ya vienen completas
            imageUrl: tool.screenshotUrl || "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2340&auto=format&fit=crop",
            heightClass: assignedHeight,
            actionText: "View Production",
          };
        });

        setTools(fetchedTools);
      } catch (error) {
        console.error("Error buscando en Algolia:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [searchQuery]); // Añadimos searchQuery a las dependencias para que se ejecute al teclear

  const filteredTools = useMemo(() => {
    // Ya no filtramos por nombre aquí, Algolia lo hace. Solo aplicamos el filtro de categoría localmente.
    return tools.filter(tool => {
      return activeCategory === "All" || tool.category === activeCategory;
    });
  }, [activeCategory, tools]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] transition-colors duration-300 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700 pb-32">

      {/* Navbar Minimalista */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-lg flex items-center justify-between p-1.5 transition-all">
        <div className="flex items-center gap-2 pl-3">
          <div className="w-4 h-4 rounded bg-black dark:bg-white flex items-center justify-center">
            <div className="w-1 h-1 bg-white dark:bg-black rounded-full"></div>
          </div>
        </div>

        <div className="flex-1 flex items-center px-3 py-1.5 mx-2 focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/20 rounded-full transition-all">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-200 text-[12px] px-2 w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
          />
        </div>

        <div className="flex gap-1 pr-1">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer">
            <UserIcon />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"
          >
             <PlusIcon />
          </button>
        </div>
      </nav>

      {/* Menú de Categorías Flotante */}
      <div className="pt-28 pb-8 flex justify-center w-full z-30 sticky top-0 bg-gradient-to-b from-[#fafafa] dark:from-[#050505] to-transparent pointer-events-none">
        <div className="flex gap-2 p-1.5 rounded-full bg-white/50 dark:bg-[#111]/50 backdrop-blur-md border border-black/5 dark:border-white/5 pointer-events-auto overflow-x-auto max-w-[95%] no-scrollbar">
          {["All", "Design", "Development", "AI Tools", "Productivity"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal */}
      <main className="max-w-[1600px] w-[95%] mx-auto mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle></svg>
            Loading tools...
          </div>
        ) : filteredTools.length > 0 ? (
          /* Reducimos gap-6 a gap-4 para juntar visualmente las columnas */
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {filteredTools.map(tool => (
              <MasonryCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <SearchIcon />
            {/* Texto actualizado para reflejar la búsqueda vacía */}
            <p className="mt-4 text-sm">No tools found matching your search.</p>
          </div>
        )}
      </main>

      {/* Modal de Auto-Captura */}
      <AutoCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
