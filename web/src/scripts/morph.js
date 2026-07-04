export const MORPH_FROM = 'polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)';
export const MORPH_TO   = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
export function morphTargets(root = document) { return [...root.querySelectorAll('[data-morph]')]; }
