const keys = {
  ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39],
  Control: ['ControlLeft', 17], Alt: ['AltLeft', 18], Shift: ['ShiftLeft', 16], Escape: ['Escape', 27],
  Enter: ['Enter', 13], ' ': ['Space', 32], z: ['KeyZ', 90], x: ['KeyX', 88], '5': ['Digit5', 53], '1': ['Digit1', 49],
};
export function makeKeyboardScript(key, down) {
  if (!Object.hasOwn(keys, key)) return 'true;';
  const [code, keyCode] = keys[key];
  const options = JSON.stringify({ key, code, keyCode, which: keyCode, bubbles: true, cancelable: true });
  return `(document.activeElement || document.body).dispatchEvent(new KeyboardEvent('${down ? 'keydown' : 'keyup'}', ${options})); true;`;
}
