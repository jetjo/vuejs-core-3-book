export * from '../../6、浅只读与深只读/reactive/index.js'

/**@typedef {import('../../6、浅只读与深只读/reactive/index.js').ProxyTrapOption} ProxyTrapOptionBase */
/**@typedef {import('./track-trigger.js').Trigger} Trigger */
/**@typedef {import('./track-trigger.js').Track} Track */
/**@typedef {import('./traps/convention.js').GetTarget} GetTarget */
/**@typedef {Omit<ProxyTrapOptionBase, 'trigger'|'track'> & {trigger: Trigger, track: Track, getTarget:GetTarget}} ProxyTrapOption */

// import { createReactive } from './api.js'

// const reactive = createReactive()()
// const shallowReactive = createReactive(true)()
// const readonly = createReactive(false, true)()
// const shallowReadonly = createReactive(true, true)()

// export { reactive, shallowReactive, readonly, shallowReadonly }
