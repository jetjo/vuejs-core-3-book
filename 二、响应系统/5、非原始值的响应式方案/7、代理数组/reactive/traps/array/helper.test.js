import { log } from '../../../../../4、响应系统的作用与实现'
import { effect } from '../../../effect/index.js'
import { reactive } from '../../index.js'

const raw = [{}, {}]

const rawItem0 = raw[0]

// 这样无法代理原型链上的`includes`方法了...
// raw.includes = function (...args) {
//   log('raw.includes')
//   return Array.prototype.includes.apply(this, args)
// }
raw._includes = function (...args) {
  log('raw._includes')
  return this.includes(...args)
}

const state = reactive(raw)

effect(() => {
  // NOTE: 查找类的方法从索引`0`开始对比,如果索引为`i`的元素是要找的,那么大于`i`的元素不会被检查
  // 这就导致大于`i`的元素的变化不会触发副作用
  // log(state.includes(rawItem0), 'effect')
  // log(state._includes(rawItem0), 'effect')
  // NOTE: 下面这句是先获得`_includes`然后在获取`0`
  log(state._includes(state), 'effect')
  // state[1]
})

state[1] = 111
