import { warn, notNaN } from '../../../index.js'
import {
  TRIGGER_TYPE,
  TRY_PROXY_NO_RESULT,
  isReactive,
  getTarget
} from './convention.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['set']}
 */
function getSetTrap(options = {}) {
  const { trigger, handleThrow, Reactive, isReadonly, Effect } = options
  if (isReadonly) {
    return function set() {
      warn(`不能更改只读对象的属性值!`)
      return true
    }
  }
  function getType(target, key) {
    const has =
      // Effect.runWithoutEffect(() =>
      // key in target
      // 假如target是代理, 这句也不会被has trap捕获到
      // has trap是用来捕获in操作的
      Object.prototype.hasOwnProperty.call(target, key)
    // )
    return has ? TRIGGER_TYPE.SET : TRIGGER_TYPE.ADD
  }

  function getTargetPropertyVal(target, key, targetRaw) {
    if (!targetRaw) {
      while (isReactive(target)) {
        target = getTarget(target, true)
      }
      targetRaw = target
    }
    return { targetRaw, val: Effect.runWithoutEffect(() => targetRaw[key]) }
  }

  /**@type {ProxyHandler['set']} */
  const set = function set(target, key, newVal, receiver) {
    warn('set trap...')
    const trySuc = Reactive.trySet(target, key, newVal, receiver)
    if (trySuc !== TRY_PROXY_NO_RESULT) return trySuc
    const { val: oldVal, targetRaw } = getTargetPropertyVal(target, key)
    const suc = Reflect.set(...arguments)
    if (suc) {
      // #region NOTE: 根据ES语言规范对[[Set]]方法的执行过程描述,
      // 当执行target[key]=xxx的赋值语句时,如果target自身没有key属性,
      // 那么会执行[[getPrototypeOf]]获取target的原型parent,
      // 并执行parent.[[Set]](key, newVal, receiver);
      // 如果parent也没有key属性,会继续上溯原型链,直到找到一个拥有key属性的原型proto,
      // 并执行proto.[[Set]](key, newVal, receiver);或者没有找到任何拥有key属性的原型而终止寻找;
      // 在上溯原型链的过程中,可能多次调用原型的[[Set]]方法,并传递同样的参数(key, newVal, receiver),
      // 假如其中有原型是代理,那么也会被set拦截到;
      // 但是无论被对象O自身拦截到还是被其原型的set trap拦截到,set trap收到的receiver参数始终时对象O的代理;
      // 而set trap的target参数可能是对象O,也可能是对象O的原型;
      // 这样当给O设置属性key的值时,可能导致多次拦截并重复执行副作用;
      // 所以需要区分target是receiver的target,还是receiver的target的原型;
      // 如果是原型,则没必要再重复执行副作用;
      // #endregion
      const { val: valAfterSet } = getTargetPropertyVal(target, key, targetRaw)
      if (
        // 考虑到有代理的情况下赋值结果suc并不可靠. 比如target是readonly时
        // oldVal !== newVal &&
        // (notNaN(oldVal) || notNaN(newVal)) &&
        oldVal !== valAfterSet &&
        (notNaN(oldVal) || notNaN(valAfterSet)) &&
        getTarget(receiver, true) === target
      ) {
        const type = set.getType(...arguments)
        trigger(target, key, type)
        return true
      }
    }
    if (!suc && handleThrow) return Reactive.handleSetFail(...arguments, false)
    return suc
  }
  set.getType = getType
  return set
}

export { getSetTrap }
