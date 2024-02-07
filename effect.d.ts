interface EffectM {
  hasActive: boolean
  latestActiveEffect: EFn | null
  activeEffects: EFn[]
  applyWithoutEffect(cb: (...args: any[]) => any, ...args: any[]): any
  track: ({
    deps,
    effectJustPopOutFromStack
  }: {
    deps: Set<EFn>
    effectJustPopOutFromStack: EFn
  }) => void
  scheduler(efn: EFn): void
  cleanup: (eFn: EFn) => void
  runWithoutEffect(cb: any): any
}

type CB = () => any

type EFn = EFnConf & {
  options: EFnOptions
} & CB

type EFnConf = {
  deps: Set<EFn>[]
  triggers: Set<Set<string>>
  __number_id: BigInt
  microTaskLen: number
}

type EFnOptions = {
  lazy?: boolean | undefined
  queueJob?: boolean | undefined
  scheduler?: ((e: EFn) => void | (() => void)) | undefined
  mustSynCallPre?: (() => void) | undefined
}
