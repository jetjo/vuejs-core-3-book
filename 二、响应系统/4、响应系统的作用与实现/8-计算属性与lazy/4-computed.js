/* vueJs computed Api简单实现 */

import { effect } from './1-effect-fn-reg.js'
import { track, trigger } from './2-reactive.js'

function computed(fn) {
  let _val
  let dirty = true
  // nested effect
  const effectFn = effect(fn, {
    lazy: true,
    scheduler(efn) {
      // console.log('efn === effectFn: ', efn === effectFn)
      dirty = true
      trigger(obj, 'value')
    },
    queueJob: true
  })
  const obj = {
    get value() {
      // 当一个外部副作用依赖于这个计算属性`obj`时,
      // 为了当这个计算属性(netsted effect)的依赖变化时,
      // 重新执行外部的副作用,
      // 需要手动收集
      track(obj, 'value')
      if (dirty) {
        dirty = false
        return (_val = effectFn())
      } else {
        return _val
      }
    }
  }

  return obj
}

export { computed }
