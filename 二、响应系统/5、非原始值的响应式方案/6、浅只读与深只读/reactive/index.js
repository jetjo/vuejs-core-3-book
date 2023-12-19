import { createReactive } from './api.js'
export * from './api.js'
export * from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/index.js'

/**
 * @typedef {import('../,,/../../index.js').ProxyTrapOption} ProxyTrapOptionBase
 * @typedef {ProxyTrapOptionBase & {isReadonly: boolean, readonly: (target: any) => any}} ProxyTrapOption
 */

const reactive = createReactive()()
const shallowReactive = createReactive(true)()
const readonly = createReactive(false, true)()
const shallowReadonly = createReactive(true, true)()

export { reactive, shallowReactive, readonly, shallowReadonly }
