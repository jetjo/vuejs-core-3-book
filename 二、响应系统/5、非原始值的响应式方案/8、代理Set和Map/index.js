import { createReactive } from './reactive/api.js'

const reactive = createReactive()()
const shallowReactive = createReactive(true)()
const readonly = createReactive(false, true)()
const shallowReadonly = createReactive(true, true)()

export { reactive, shallowReactive, readonly, shallowReadonly }
