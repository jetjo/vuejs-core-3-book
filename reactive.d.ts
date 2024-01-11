interface Reactive {
  <T>(target: T): T
}

type Track = (target: any, key: string | Symbol) => void

declare const TRIGGER_TYPE: {
  readonly ADD: 'TRIGGER_TYPE.ADD'
  readonly SET: 'TRIGGER_TYPE.SET'
  readonly DELETE: 'TRIGGER_TYPE.DELETE'
  readonly CLEAR: 'TRIGGER_TYPE.CLEAR'
  readonly EmptySlotSet: 'TRIGGER_TYPE.EmptySlotSet'
  readonly LengthSubtract: 'TRIGGER_TYPE.LengthSubtract'
}

type TRIGGER_TYPE_TD = typeof TRIGGER_TYPE

type TriggerType = TRIGGER_TYPE_TD[keyof TRIGGER_TYPE_TD]

type Trigger = (
  target: any,
  key: string,
  type: TriggerType,
  newVal: any,
  isArrayProperty: boolean
) => void

declare const TRY_PROXY_NO_RESULT: 'TRY_PROXY_NO_RESULT'
interface ReactiveCtor {
  trySet<T>(
    target: T,
    key: any,
    newVal: any,
    receiver: T
  ): false | typeof TRY_PROXY_NO_RESULT
  /**@deprecated */
  handleSetFail<T>(
    target: T,
    key: any,
    newVal: any,
    receiver: T,
    suc?: boolean
  ): boolean
  handleArray(
    target: Array<any>,
    key: string | symbol,
    receiver: Array<any>
  ): ((...args: any[]) => any) | typeof TRY_PROXY_NO_RESULT | any
  tryGetFlag<T>(
    target: T,
    key: any,
    receiver: T
  ): T | boolean | typeof TRY_PROXY_NO_RESULT
  tryGet<T>(
    target: T,
    key: any,
    receiver: T,
    isSetOrMap?: boolean
  ):
    | T
    | boolean
    | number
    | ((...args: any[]) => any)
    | typeof TRY_PROXY_NO_RESULT
    | never
    | any
  tryGetForSetOrMap<T>(
    target: T,
    key: any,
    receiver: T
  ): (...args: any[]) => any | number | never
}

interface ProxyTrapOption {
  version?: string
  Effect: EffectM
  Reactive: ReactiveCtor
  isShallow: boolean
  isReadonly: boolean
  readonly: Reactive
  reactive: Reactive
  track: Track
  trigger: Trigger
  reactiveInfo: WeakMap<object, object>
}

type SetProto = SetConstructor['prototype']
type SetProtoKeys = 'add' | 'delete' | 'has' | 'clear'
type WsProto = WeakSetConstructor['prototype']
type MapProto = MapConstructor['prototype']
type WmProto = WeakMapConstructor['prototype']

type SetMap = SetConstructor | MapConstructor

type SetMapWsWm =
  | SetConstructor
  | MapConstructor
  | WeakSetConstructor
  | WeakMapConstructor

type SetMapWsWmPrototype = SetMapWsWm['prototype']

type SetWs = SetConstructor | WeakSetConstructor

type SetWsPrototype = SetWs['prototype']

type SetMapPrototype = SetMap['prototype']

interface WithRecordTrapOption {
  <F>(e: {
    factory: (option?: ProxyTrapOption) => F
    factoryName: string
    version: string
    option?: ProxyTrapOption
    getDiff?: GetDiff<ProxyTrapOption>
    isShallow: boolean
    isReadonly: boolean
    [key: keyof ProxyTrapOption]: ProxyTrapOption[key]
  }): F
}

type GetTrap = ProxyHandler<any>['get'] & {
  trapForSetAndMap?: ProxyHandler<any>['get']
}

type ProxyHandlerKeyNoGet =
  | 'set'
  | 'deleteProperty'
  | 'has'
  | 'ownKeys'
  | 'getOwnPropertyDescriptor'
  | 'defineProperty'
  | 'apply'
type ProxyHandlerKey = 'get' | ProxyHandlerKeyNoGet

interface TrapInnerFactory {
  (
    isShallow: boolean,
    isReadonly: boolean,
    options: ProxyTrapOption
  ): (...args: any[]) => any
}
interface ReactiveCtorFactory {
  // (
  //   isShallow: boolean,
  //   isReadonly: boolean,
  //   options: ProxyTrapOption
  // ): ReactiveCtor
  (
    options: ProxyTrapOption & {
      ReactiveBase: ReactiveCtor
      arrayInstrumentations?: any[]
      setMapInstrumentations?: WeakMap<object, SetMapWsWmPrototype>
    }
  ): ReactiveCtor
}
interface ArrayProtoProxyFactory {
  (
    options: {
      isShallow: boolean
      isReadonly: boolean
      applyWithoutEffect?: EffectM['applyWithoutEffect']
      finds?: ArrayConstructor['prototype']
      stacks?: ArrayConstructor['prototype']
    } & ProxyTrapOption
  ): ArrayConstructor['prototype']
}

type Trap<K extends ProxyHandlerKey> = (Omit<ProxyHandler<any>, 'get'> & {
  get: GetTrap
})[K]

interface TrapFactory<K extends ProxyHandlerKey> {
  // (isShallow: boolean, isReadonly: boolean, options: ProxyTrapOption): Trap<K>
  (options: ProxyTrapOption): Trap<K>
}

interface TrapGetter<K extends ProxyHandlerKey> {
  (options: ProxyTrapOption): Trap<K>
}

interface CreateReactive {
  (
    isShallow?: boolean,
    isReadonly?: boolean,
    version?: string
  ): {
    (callFromSelfTrap?: boolean): Reactive
    trapGetters?: TrapGetter<K>
    trapOption?: ProxyTrapOption
    reactiveInfo?: ProxyTrapOption['reactiveInfo']
    getProxyHandler?(target?: object): ProxyHandler<object>
  }
}

type ReactiveApiCreator = ReturnType<CreateReactive>
