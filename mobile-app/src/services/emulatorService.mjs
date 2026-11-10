export function detectEmulator(metadata = {}) {
  const value = [metadata.emulator, metadata.emulator_ext].flat().find(item => typeof item === 'string' && item.trim());
  return value ? { name: value.trim() } : null;
}
