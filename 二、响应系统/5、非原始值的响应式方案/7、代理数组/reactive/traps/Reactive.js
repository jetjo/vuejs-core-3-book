import { getReactive as _getReactive } from '../../../6、浅只读与深只读/reactive/traps/Reactive.js'
import { TRY_PROXY_NO_RESULT } from './convention.js'

function getReactive(options = {}) {
  const Reactive = _getReactive(options)
  const _tryGet = Reactive.tryGet
  // _tryGet.bind(Reactive) // 不能使用bind,否则会导致this丢失???
  Reactive._tryGet = _tryGet

  Reactive.tryGet = function (target, key, receiver) {
    const _res = Reactive._tryGet(target, key, receiver)
    if (_res !== TRY_PROXY_NO_RESULT) return _res
    // 为了避免意外及性能考虑,不宜对symbol类型的key继续追踪
    if (typeof key === 'symbol') return target[key]
    // 使用for...of遍历可迭代对象如数组时,需要读取Symbol.iterator属性
    if (key === Symbol.iterator) return target[key]
    return TRY_PROXY_NO_RESULT
  }

  return Reactive
}

export { getReactive }
