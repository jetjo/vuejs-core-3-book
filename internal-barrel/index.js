import { createReactive } from './reactive/api/5-8.js'
import { createRef } from './reactive/ref/6-1.js'
export { effect } from './effect/index/4-11.js'

const reactive = createReactive(false, false, '6-1')()
const shallowReactive = createReactive(true, false, '6-1')()
const readonlyReactive = createReactive(false, true, '6-1')()
const shallowReadonlyReactive = createReactive(true, true, '6-1')()

const ref = createRef(reactive)
const shallowRef = createRef(shallowReactive)
const readonlyRef = createRef(readonlyReactive)
const shallowReadonlyRef = createRef(shallowReadonlyReactive)

export { ref, shallowRef, readonlyRef, shallowReadonlyRef }

export { reactive, shallowReactive, readonlyReactive, shallowReadonlyReactive }
