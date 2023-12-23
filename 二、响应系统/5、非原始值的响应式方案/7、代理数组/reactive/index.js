export * from '../../6、浅只读与深只读/reactive/index.js'

/**@typedef {import('../../6、浅只读与深只读/reactive/index.js').ProxyTrapOption} ProxyTrapOptionBase */
/**@typedef {import('./track-trigger.js').Trigger} Trigger */
/**@typedef {import('./track-trigger.js').Track} Track */
/**@typedef {import('./traps/convention.js').GetTarget} GetTarget */
/**@typedef {Omit<ProxyTrapOptionBase, 'trigger'|'track'> & {trigger: Trigger, track: Track, getTarget:GetTarget}} ProxyTrapOption */

import * as getApi from './api.js'

const reactive = getApi.reactive()
const shallowReactive = getApi.shallowReactive()
const readonly = getApi.readonly()
const shallowReadonly = getApi.shallowReadonly()

export { reactive, shallowReactive, readonly, shallowReadonly }
