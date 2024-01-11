interface EffectM {
  hasActive: boolean
  applyWithoutEffect(cb: (...args: any[]) => any, ...args: any[]): any
}
