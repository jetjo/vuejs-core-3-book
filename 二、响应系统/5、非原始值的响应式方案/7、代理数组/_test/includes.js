import { readonly, shallowReactive, shallowReadonly } from '../index.js'

// import { effect } from "./effect/index.js";
const { effect } = await import('../effect/index.js')
const { reactive } = await import('../index.js')
const arr = [{}, {}]
arr.includes = Array.prototype.includes
// arr.includes = () => true
// Array.prototype.includes = function () {
//   return 'oooo'
// }
const state = reactive(arr)
effect(() => {
  // 调用`includes`方法时,
  // 会把`state`中的每个元素取出(即`state[index]`),
  // 后与`state[0]`进行比较,
  // 在索引为0的元素是引用类型并且state是通过深度响应式api(`reactive`和
  // `readonly`)创建的情况下,
  // 可能两次对于索引为0的元素的取值(`state[0]`)结果不一致
  console.log(state.includes(state[0]))
  console.log(state.includes(readonly(state[0])))
  console.log(state.includes(shallowReactive(state[0])))
  console.log(state.includes(shallowReadonly(state[0])))
  // 这里应该返回true,但是由于includes方法还没有重写,目前返回false
  console.log(state.includes(arr[0]))
})

// state.length = 1
// state[0] = 0
state[1] = 1

export {}
