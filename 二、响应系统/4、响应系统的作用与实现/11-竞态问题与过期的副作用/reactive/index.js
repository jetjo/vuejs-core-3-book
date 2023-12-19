/* @4-4 [分支切换与cleanup] */
/* @4-6 [无限递归循环] */
/* @4-7 [调度执行] */
/* @4-7-1 [副作用列队与中间态] */
/* @4-9 [深度响应] */
/* @4-9-1 [对象成员遍历、添加、删除时依赖收集与effect触发] */
// import { getApi } from './api.js'
// export * from './api.js'
export * from './traps/index.js'
export * from './traps/helper.js'

/**@typedef {import('../effect').EFn} EffectFn */
/**@typedef {import('../effect').EffectM} EffectM */

/**@typedef {import('./traps/Reactive.js').ReactiveCtor} ReactiveCtor*/
/**@typedef {import('./track-trigger.js').Track} Track*/
/**@typedef {import('./track-trigger.js').Trigger} Trigger*/

/**@typedef {ProxyHandler} PH*/
/**@typedef {PH[keyof PH]} ProxyTrap */
/**
 * @typedef {Object} ProxyTrapOption
 * @property {EffectM} Effect
 * @property {import('./track-trigger.js').Track} track
 * @property {import('./track-trigger.js').Trigger} trigger
 * @property {boolean} isShallow
 * @property {import('./traps/Reactive.js').ReactiveCtor} Reactive
 * @property {(target:any) => any} reactive
 * @property {boolean} handleProto
 */
/**@typedef {(opt: ProxyTrapOption) => ProxyTrap} ProxyTrapGetter */

/**@typedef {import('./traps/convention.js').TriggerType} TriggerType */

// const reactive = getApi()()
// const shallowReactive = getApi(true)()

// export { reactive, shallowReactive }
export {}
