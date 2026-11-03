export const API = 'https://archive.org';
export const SAVE_KEY = '@blastback/saves';
export const LAST_KEY = '@blastback/last-session';
export const SYSTEMS = [
  { id: 'internetarcade', label: 'Arcade', emoji: '🕹️' },
  { id: 'consolelivingroom', label: 'Consoles', emoji: '📺' },
  { id: 'softwarelibrary_msdos_games', label: 'MS-DOS', emoji: '💾' },
  { id: 'softwarelibrary_c64_games', label: 'Commodore 64', emoji: '🖥️' },
  { id: 'softwarelibrary_zx_spectrum', label: 'ZX Spectrum', emoji: '🌈' },
  { id: 'softwarelibrary_apple', label: 'Apple II', emoji: '🍏' },
];
export const SORTS = [
  { label: 'Mais jogados', value: 'downloads desc' },
  { label: 'Nome (A-Z)', value: 'titleSorter asc' },
  { label: 'Mais recentes', value: 'year desc' },
];
export const thumb = id => `${API}/services/img/${encodeURIComponent(id)}`;
export const embed = id => `${API}/embed/${encodeURIComponent(id)}`;
