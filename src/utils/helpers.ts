/**
 * Extrae el dominio limpio de una URL
 */
export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
};

/**
 * Valida una URL
 */
export const isValidUrl = (url) => {
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
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

/**
 * Trunca texto manteniendo palabras completas
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

/**
 * Formatea un número para display
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

/**
 * Obtiene el color de nivel del usuario
 */
export const getLevelColor = (level) => {
  const colors = {
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
export const getLevelEmoji = (level) => {
  const emojis = {
    Explorer: '🌱',
    Contributor: '⭐',
    'Expert Curator': '🏆',
    'Master Curator': '👑',
  };
  return emojis[level] || '🌱';
};

/**
 * Genera un patrón de bento grid más orgánico basado en el índice
 */
export const getBentoSpan = (i, total) => {
  // Patrón más orgánico que evita repetición predecible
  const position = i / total;
  const hash = ((i * 7 + 13) * 31) % 7;

  // Herramientas importantes (primeras) tienen más espacio
  if (i === 0) return 'md:col-span-2 md:row-span-2';
  if (i === 1) return 'md:col-span-2 md:row-span-1';
  if (i === 2) return 'md:col-span-1 md:row-span-2';

  // Distribución semi-aleatoria pero determinista
  switch (hash) {
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
    default:
      return 'md:col-span-1 md:row-span-1';
  }
};


