/**
 * Extrae el dominio limpio de una URL
 */
export const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
};

/**
 * Valida una URL
 */
export const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Debounce para búsquedas y otros eventos frecuentes
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name: string) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

/**
 * Trunca texto manteniendo palabras completas
 */
export const truncateText = (text: string, maxLength: number = 100) => {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

/**
 * Formatea un número para display
 */
export const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

/**
 * Obtiene el color de nivel del usuario
 */
export const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    Explorer: 'text-zinc-400',
    Contributor: 'text-blue-400',
    'Expert Curator': 'text-purple-400',
    'Master Curator': 'text-yellow-400',
  };
  return colors[level] || 'text-zinc-400';
};

/**
 * Obtiene el emoji del nivel
 */
export const getLevelEmoji = (level: string) => {
  const emojis: Record<string, string> = {
    Explorer: '🌱',
    Contributor: '⭐',
    'Expert Curator': '🏆',
    'Master Curator': '👑',
  };
  return emojis[level] || '🌱';
};

/**
 * Genera un patrón de bento grid 2.0 más orgánico y variado
 * Crea layouts asimétricos con tamaños diversos para un look premium
 */
export const getBentoSpan = (i: number, total: number) => {
  // Patrón Bento 2.0: layout orgánico con variedad visual
  const pattern = i % 12;

  // Primeros elementos destacados (hero cards)
  if (i === 0) return 'md:col-span-2 md:row-span-2';
  if (i === 1) return 'md:col-span-2 md:row-span-1';
  if (i === 2) return 'md:col-span-1 md:row-span-2';
  if (i === 3) return 'md:col-span-1 md:row-span-1';
  if (i === 4) return 'md:col-span-1 md:row-span-1';

  // Patrón orgánico repetitivo para el resto
  switch (pattern) {
    case 0:
      return 'md:col-span-2 md:row-span-2';
    case 1:
      return 'md:col-span-1 md:row-span-1';
    case 2:
      return 'md:col-span-1 md:row-span-2';
    case 3:
      return 'md:col-span-2 md:row-span-1';
    case 4:
      return 'md:col-span-1 md:row-span-1';
    case 5:
      return 'md:col-span-1 md:row-span-1';
    case 6:
      return 'md:col-span-1 md:row-span-2';
    case 7:
      return 'md:col-span-2 md:row-span-1';
    case 8:
      return 'md:col-span-1 md:row-span-1';
    case 9:
      return 'md:col-span-1 md:row-span-1';
    case 10:
      return 'md:col-span-2 md:row-span-2';
    case 11:
      return 'md:col-span-1 md:row-span-1';
    default:
      return 'md:col-span-1 md:row-span-1';
  }
};
