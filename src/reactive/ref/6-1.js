import { createRef } from '../../../二、响应系统/6、原始值的响应方案/reactive/ref.js'
import { createReactive } from '../../../二、响应系统/5、非原始值的响应式方案/8、代理Set和Map/reactive/api.js'

const reactive = createReactive(false, false, '6-1')()
const shallowReactive = createReactive(true, false, '6-1')()
const readonlyReactive = createReactive(false, true, '6-1')()
const shallowReadonlyReactive = createReactive(true, true, '6-1')()

const ref = createRef(reactive)
const shallowRef = createRef(shallowReactive)
const readonlyRef = createRef(readonlyReactive)
const shallowReadonlyRef = createRef(shallowReadonlyReactive)

export { ref, shallowRef, readonlyRef, shallowReadonlyRef }
