export const TRANSITIONS = ['Cut', 'Fade', 'Zoom', 'Wipe', 'Slide', 'Fly', 'CrossZoom', 'FlyRotate', 'Cube', 'CubeZoom', 'VerticalWipe', 'VerticalSlide', 'Merge', 'WipeReverse', 'SlideReverse', 'VerticalWipeReverse', 'VerticalSlideReverse', 'BarnDoor', 'RollerDoor', 'AlphaFade', 'Stinger1', 'Stinger2', 'Stinger3', 'Stinger4', 'Stinger5', 'Stinger6', 'Stinger7', 'Stinger8'] as const;
export function hasDuration(effect: string) { return effect !== 'Cut' && !effect.startsWith('Stinger'); }
export function transitionParameters(effect: unknown = 'Cut', duration: unknown = 500): Record<string, string> {
  if (typeof effect !== 'string' || !TRANSITIONS.some(value => value === effect)) throw new Error('Nieobsługiwane przejście.');
  if (hasDuration(effect)) {
    if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 1 || duration > 10000) throw new Error('Czas przejścia musi wynosić od 1 do 10000 ms.');
    return { Function: effect, Duration: String(duration) };
  }
  return { Function: effect };
}
