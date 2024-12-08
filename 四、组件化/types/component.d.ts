import { ComponentInternalInstance, PropType, SetupContext } from 'vue'
import type { Data } from './renderer'

type DefaultFactory<T> = (props: Data) => T | null | undefined
export interface PropOptions_<T = any, D = T> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: D | DefaultFactory<D> | null | undefined | object
  validator?(value: unknown, props: Data): boolean
  skipCheck?: boolean
  skipFactory?: boolean
}

type NormalizedProp =
  | null
  | (PropOptions_ & {
      [0]?: boolean
      //   [BooleanFlags.shouldCast]?: boolean
      [1]?: boolean
      //   [BooleanFlags.shouldCastTrue]?: boolean
    })

export type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>

// normalized value is a tuple of the actual normalized options
// and an array of prop keys that need value casting (booleans and defaults)
export type NormalizedProps = Record<string, NormalizedProp>
export type NormalizedPropsOptions = [NormalizedProps, string[]] | []

export interface VCom_InternalInstance extends ComponentInternalInstance {
  /**
   * - 1、作为组件实例的唯一标识
   * - 2、作为关联的`effectFn`的唯一标识
   * - - 并且这个`effectFn`的`flushType`是`pre`, 此时, `uid`用于在更新UI前从微任务列队中找出这个`effectFn`并执行.
   * - 3、作为元素类型的子节点的`data-v-owner`属性的值(读取`vnode.ctx.uid`)
   * - 4、作为`instance.update.id`
   */
  uid: number
  propsOptions: NormalizedPropsOptions
  emitsOptions: ObjectEmitsOptions | null
  // main proxy that serves as the public instance (`this`)
  proxy: ComponentPublicInstance | null
  /**
   * This is the target for the public instance proxy. It also holds properties
   * injected by user options (computed, methods etc.) and user-attached
   * custom properties (via `this.x = ...`)
   */
  ctx: Data
  accessCache: Data | null
  /**
   * cache for render function values that rely on _ctx but won't need updates
   * after initialized (e.g. inline handlers)
   */
  renderCache: (Function | VNode)[]
  setupContext: SetupContext | null
  setupState: Data
  /**
   * The render function that returns vdom tree.
   */
  render: InternalRenderFunction | null
  /**
   * SSR render function
   */
  ssrRender?: Function | null
}
