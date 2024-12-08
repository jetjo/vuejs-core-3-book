import { warn } from '#root/utils'
// @ts-ignore
import { NOOP, extend, isArray, isFunction, isObject, isPromise } from '@vue/shared'
import { createAppContext } from './apiCreateApp'
import { emit, normalizeEmitsOptions } from './componentEmits'
import { initProps, normalizePropsOptions } from './componentProps'
import { initSlots } from './componentSlots'
import { proxyRefs } from '#root/reactive/ref/convention.js'
// @ts-ignore
import { compile } from 'vue'
import { reactive } from '#vue-fixed/reactive'
import { callHook } from './componentOptions'

/**@typedef {import('vue').ConcreteComponent} ConcreteComponent */
/**@typedef {import('vue').ObjectEmitsOptions} ObjectEmitsOptions */

/**@typedef {import('vue').ComponentInternalInstance} ComponentInternalInstance */

let uid = 0
const emptyAppContext = createAppContext()

/**@type {ComponentInternalInstance | null} */
export let currentInstance = null

// @ts-ignore
const getCurrentInstance = () => currentInstance

let internalSetCurrentInstance

if (typeof __SSR__ !== 'undefined') {
  throw new Error('暂不支持SSR!')
} else {
  // @ts-ignore
  internalSetCurrentInstance = instance => {
    currentInstance = instance
  }
}

// @ts-ignore
export const setCurrentInstance = instance => {
  const prev = currentInstance
  internalSetCurrentInstance(instance)
  // TODO: instance.scope.on()
  return () => {
    // instance.scope.off()
    internalSetCurrentInstance(prev)
  }
}

/**
 * @template HN, Ele
 * @param {VComponent<HN, Ele>} vnode
 * @param {VComponent<HN, Ele>['component']} parent
 * @returns {Partial<NonNullable<VComponent<HN, Ele>['component']>> & {uid: number, type: ConcreteComponent, parent: ComponentInternalInstance | null, isMounted: boolean, propsOptions: unknown[], emitsOptions: ObjectEmitsOptions | null, emit: typeof emit}}
 */
export function createComponentInstance(vnode, parent) {
  /**@type {import('vue').ConcreteComponent} */
  // @ts-ignore
  const type = vnode.type
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext
  /**@type {import('#shims').VCom_InternalInstance} */
  const instance = {
    uid: uid++,
    // @ts-ignore
    vnode,
    parent,
    type,
    // subTree: null,
    isMounted: false,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext)
  }
  instance.ctx = { _: instance }
  instance.root = parent ? parent.root : instance
  // @ts-ignore
  instance.emit = emit.bind(null, instance)
  // @ts-ignore
  return instance
}

/**@todo 未实现 */
// @ts-ignore
export function isStatefulComponent(instance) {
  return true // instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 */
export function setupComponent(instance, isSSR = false) {
  isSSR && warn('暂未支持SSR!')
  const { props: rawPropsData, children } = instance.vnode
  const isStateful = isStatefulComponent(instance)
  initProps(instance, rawPropsData, isStateful, isSSR)
  initSlots(instance, children)

  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : undefined

  return setupResult
}

/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 */
function setupStatefulComponent(instance, isSSR = false) {
  /**@type {import('vue').ComponentOptions} */
  // @ts-ignore
  const Com = instance.type
  // 0. 为`render proxy`创建缓存
  instance.accessCache = Object.create(null)
  // TODO:  1. create public instance / render proxy
  // // also mark it raw so it's never observed
  // instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers))
  const { setup } = Com.type
  // 2. call setup
  if (setup) {
    const setupContext = (instance.setupContext = createSetupContext(instance))

    // NOTE: 将当前实例设置为活动实例,以便在`setup`中的`onMounted`等钩子可以将`callback`关联到当前实例
    const reset = setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContext)
    reset()

    if (isPromise(setupResult)) {
      throw new Error('暂不支持 Promise!')
    } else {
      handleSetupResult(instance, setupResult, isSSR)
    }
  } else {
    finishComponentSetup(instance, isSSR)
  }
}

/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 * @param {unknown} setupResult
 */
export function handleSetupResult(instance, setupResult, isSSR = false) {
  if (isFunction(setupResult)) {
    // setup returned an inline render function
    // @ts-ignore
    if (__SSR__ && instance.type.__ssrInlineRender) {
      // when the function's name is `ssrRender` (compiled by SFC inline mode),
      // set it as ssrRender instead.
      instance.ssrRender = setupResult
    } else {
      instance.render = setupResult //as InternalRenderFunction
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance, isSSR)
}

/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 */
export function finishComponentSetup(instance, isSSR = false, skipOptions = false) {
  // @ts-ignore
  const Component = instance.type //as ComponentOptions

  if (__COMPAT__) {
    throw new Error('暂不支持!')
  }

  // template / render function normalization
  // could be already set when returned from setup()
  if (!instance.render) {
    throw new Error('暂不支持!')
    // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
    // is done by server-renderer
    // if (!isSSR && compile && !Component.render) {
    //   const template =
    //     (__COMPAT__ &&
    //       instance.vnode.props &&
    //       instance.vnode.props['inline-template']) ||
    //     Component.template ||
    //     resolveMergedOptions(instance).template
    //   if (template) {

    //     const { isCustomElement, compilerOptions } = instance.appContext.config
    //     const { delimiters, compilerOptions: componentCompilerOptions } =
    //       Component
    //     const finalCompilerOptions: CompilerOptions = extend(
    //       extend(
    //         {
    //           isCustomElement,
    //           delimiters,
    //         },
    //         compilerOptions,
    //       ),
    //       componentCompilerOptions,
    //     )
    //     if (__COMPAT__) {
    //      throw new Error('暂不支持!')
    //     }
    //     Component.render = compile(template, finalCompilerOptions)
    //   }
    // }

    // instance.render = (Component.render || NOOP) //as InternalRenderFunction

    // TODO: // for runtime-compiled render functions using `with` blocks, the render
    // // proxy used needs a different `has` handler which is more performant and
    // // also only allows a whitelist of globals to fallthrough.
    // if (installWithProxy) {
    //   installWithProxy(instance)
    // }
  }

  // support for 2.x options
  if (__FEATURE_OPTIONS_API__ && !(__COMPAT__ && skipOptions)) {
    const reset = setCurrentInstance(instance)
    applyOptions(instance)
    reset()
  }
}

export let shouldCacheAccess = true
/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 */
export function applyOptions(instance) {
  const options = { ...instance } // for options api mixins and extends,  resolveMergedOptions(instance)
  const publicThis = instance.proxy
  // const ctx = instance.ctx

  // do not cache property access on public proxy during state initialization
  shouldCacheAccess = false

  // TODO: // call beforeCreate first before accessing other options since
  // // the hook may mutate resolved options (#2791)
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance)// , LifecycleHooks.BEFORE_CREATE)
  }

  const {
    // state
    data: dataOptions,
    // @ts-ignore
    computed: computedOptions,
    // @ts-ignore
    methods,
    // watch: watchOptions,
    // @ts-ignore
    provide: provideOptions,
    // @ts-ignore
    inject: injectOptions,
    // lifecycle
    created,
    // beforeMount,
    // mounted,
    // beforeUpdate,
    // updated,
    // activated,
    // deactivated,
    // beforeDestroy,
    // beforeUnmount,
    // destroyed,
    // unmounted,
    render,
    // renderTracked,
    // renderTriggered,
    // errorCaptured,
    // serverPrefetch,
    // public API
    // @ts-ignore
    expose
    // inheritAttrs,
    // // assets
    // components,
    // directives,
    // filters,
  } = options

  // const checkDuplicateProperties = __DEV__ ? createDuplicateChecker() : null

  // options initialization order (to be consistent with Vue 2):
  // - props (already done outside of this function)
  // - inject
  // - methods
  // - data (deferred since it relies on `this` access)
  // - computed
  // - watch (deferred since it relies on `this` access)

  // TODO: if (injectOptions) {
  //   resolveInjections(injectOptions, ctx, checkDuplicateProperties)
  // }

  if (methods) {
    throw new Error('暂不支持!')
  }

  if (dataOptions) {
    // @ts-ignore
    const data = dataOptions.call(publicThis, publicThis)

    if (!isObject(data)) {
      __DEV__ && warn(`data() should return an object.`)
    } else {
      instance.data = reactive(data)
    }
  }

  // state initialization complete at this point - start caching access
  shouldCacheAccess = true

  if (computedOptions) {
    warn('暂不支持!')
  }

  // if (watchOptions) {
  //   for (const key in watchOptions) {
  //     createWatcher(watchOptions[key], ctx, publicThis, key)
  //   }
  // }

  if (provideOptions) {
    warn('暂不支持!')
    // const provides = isFunction(provideOptions)
    //   ? provideOptions.call(publicThis)
    //   : provideOptions
    // Reflect.ownKeys(provides).forEach(key => {
    //   provide(key, provides[key])
    // })
  }

  if (created) {
    callHook(created, instance)//, LifecycleHooks.CREATED)
  }

  /**
   * @param {Function} register
   * @param {Function|Function[]} hook
   */
  // @ts-ignore
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach(_hook => register(_hook.bind(publicThis)))
    } else if (hook) {
      register(hook.bind(publicThis))
    }
  }

  // TODO: registerLifecycleHook(onBeforeMount, beforeMount)
  // registerLifecycleHook(onMounted, mounted)
  // registerLifecycleHook(onBeforeUpdate, beforeUpdate)
  // registerLifecycleHook(onUpdated, updated)
  // registerLifecycleHook(onActivated, activated)
  // registerLifecycleHook(onDeactivated, deactivated)
  // registerLifecycleHook(onErrorCaptured, errorCaptured)
  // registerLifecycleHook(onRenderTracked, renderTracked)
  // registerLifecycleHook(onRenderTriggered, renderTriggered)
  // registerLifecycleHook(onBeforeUnmount, beforeUnmount)
  // registerLifecycleHook(onUnmounted, unmounted)
  // registerLifecycleHook(onServerPrefetch, serverPrefetch)

  if (__COMPAT__) {
    throw new Error('不再支持!')
  }

  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {})
      expose.forEach(key => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: val => (publicThis[key] = val)
        })
      })
    } else if (!instance.exposed) {
      instance.exposed = {}
    }
  }

  // options that are handled when creating the instance but also need to be
  // applied from mixins
  if (render && instance.render === NOOP) {
    instance.render = render // as InternalRenderFunction
  }
  // if (inheritAttrs != null) {
  //   instance.inheritAttrs = inheritAttrs
  // }

  // // asset options.
  // if (components) instance.components = components as any
  // if (directives) instance.directives = directives
}

/**
 * @template HN, Ele
 * @param {NonNullable<VComponent<HN, Ele>['component']>} instance
 * @returns { import('vue').SetupContext}
 */
export function createSetupContext(instance) {
  // @ts-ignore
  const expose = expose => {
    instance.exposed = expose
  }
  return {
    // TODO: get attrs() {
    //   return getAttrsProxy(instance)
    // },
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose
  }
}
