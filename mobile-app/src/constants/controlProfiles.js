const directions = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
export const CONTROL_PROFILES = {
  arcade: { label: 'Arcade', keys: { ...directions, a: 'Control', b: 'Alt', select: '5', start: '1' } },
  console: { label: 'Console', keys: { ...directions, a: 'z', b: 'x', select: 'Shift', start: 'Enter' } },
  computer: { label: 'Computador', keys: { ...directions, a: ' ', b: 'Control', select: 'Escape', start: 'Enter' } },
};
export const PROFILE_IDS = Object.keys(CONTROL_PROFILES);
export function chooseControlProfile(emulator, collections = []) {
  const source = [emulator?.name, ...collections].join(' ').toLowerCase();
  if (/dos|c64|commodore|spectrum|apple/.test(source)) return { id: 'computer', reason: 'sistema de computador identificado' };
  if (/console|nes|snes|genesis|megadrive/.test(source)) return { id: 'console', reason: 'console identificado' };
  return { id: 'arcade', reason: /mame|arcade/.test(source) ? 'arcade identificado' : 'perfil padrão' };
}
