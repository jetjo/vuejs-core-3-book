import { createRef } from '../../../二、响应系统/6、原始值的响应方案/reactive/ref.js'

const ref = createRef()
const shallowRef = createRef(undefined, true)
const readonlyRef = createRef(undefined, false, true)
const shallowReadonlyRef = createRef(undefined, true, true)

export { ref, shallowRef, readonlyRef, shallowReadonlyRef }
