import { createReactive } from '../../5、非原始值的响应式方案/8、代理Set和Map/reactive/api.js'

const reactive = createReactive()()
const shallowReactive = createReactive(true)()
const readonlyReactive = createReactive(false, true)()
const shallowReadonlyReactive = createReactive(true, true)()

export { reactive, shallowReactive, readonlyReactive, shallowReadonlyReactive }
