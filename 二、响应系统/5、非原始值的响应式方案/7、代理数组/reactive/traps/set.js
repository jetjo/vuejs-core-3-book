import { warn, notNaN, isValidArrayIndex } from '../../../index.js'
import {
  TRIGGER_TYPE,
  TRY_PROXY_NO_RESULT,
  isReactive,
  getTarget,
  SceneProtectedFlag
} from './convention.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['set']}
 */
function getSetTrap(options = {}) {
  if (options.isReadonly) {
    return function set() {
      warn(`不能更改只读对象的属性值!`)
      return true
    }
  }

  const { trigger, handleThrow, Reactive, isReadonly, Effect } = options
  /**@type {{length: number}} */
  let targetRaw
  let propertyName
  let hasProperty
  let isCommonArrayPropertySet
  let oldVal
  let oldLen
  let getType
  let _target
  let _receiver
  let valAfterSet
  function withSceneStatus(restore = true, cb, ...args) {
    const bak = {
      __proto__: null,
      get [SceneProtectedFlag]() {
        return true
      },
      targetRaw,
      propertyName,
      hasProperty,
      isCommonArrayPropertySet,
      oldVal,
      oldLen,
      getType,
      _target,
      _receiver,
      valAfterSet
    }
    if (!restore) return cb.apply(bak, args)
    try {
      return cb.apply(bak, args)
    } finally {
      targetRaw = bak.targetRaw
      propertyName = bak.propertyName
      hasProperty = bak.hasProperty
      isCommonArrayPropertySet = bak.isCommonArrayPropertySet
      oldVal = bak.oldVal
      oldLen = bak.oldLen
      getType = bak.getType
      _target = bak._target
      _receiver = bak._receiver
      valAfterSet = bak.valAfterSet
    }
  }
  const getArrLen = (function () {
    const gl = () => targetRaw.length
    return () => Effect.runWithoutEffect(gl)
  })()

  const getPropertyVal = (function () {
    const gv = () => targetRaw[propertyName]
    return () => Effect.runWithoutEffect(gv)
  })()

  function checkArrayOperateType() {
    isCommonArrayPropertySet = false
    if (!Array.isArray(targetRaw)) return
    if ('length' === propertyName || isValidArrayIndex(propertyName)) {
      isCommonArrayPropertySet = true
    }
  }

  function getCommonArrLengthTriggerType() {
    const newLen = getArrLen()
    return newLen > oldLen ? TRIGGER_TYPE.SET : TRIGGER_TYPE.LengthSubtract
  }

  function getCommonArrIndexTriggerType() {
    const index = Number(propertyName)
    if (index >= oldLen) return TRIGGER_TYPE.ADD
    return hasProperty ? TRIGGER_TYPE.SET : TRIGGER_TYPE.EmptySlotSet
  }

  function getCommonTriggerType() {
    return hasProperty ? TRIGGER_TYPE.SET : TRIGGER_TYPE.ADD
  }

  function handleArrTriggerType() {
    oldLen = getArrLen()

    if ('length' === propertyName) {
      return getCommonArrLengthTriggerType
    }

    return getCommonArrIndexTriggerType
  }

  function getTypeGetter() {
    checkArrayOperateType()
    if (isCommonArrayPropertySet) {
      return handleArrTriggerType()
    }
    return getCommonTriggerType
  }

  function setTargetRaw() {
    let i = 10
    while (isReactive(_target) && i > 0) {
      i--
      _target = getTarget(_target, true)
    }
    targetRaw = _target
  }

  function beforeSet(target, key, receiver) {
    _target = target
    setTargetRaw()
    propertyName = key
    // hasOwnProperty调用不会被has trap捕获到
    hasProperty = Object.prototype.hasOwnProperty.call(targetRaw, key)
    oldVal = getPropertyVal()
    getType = getTypeGetter()
    _receiver = receiver
  }

  function canTrigger() {
    valAfterSet = getPropertyVal()
    return (
      // 考虑到有代理的情况下赋值结果suc并不可靠. 比如target是readonly时
      // oldVal !== newVal &&
      // (notNaN(oldVal) || notNaN(newVal)) &&
      oldVal !== valAfterSet &&
      (notNaN(oldVal) || notNaN(valAfterSet)) &&
      getTarget(_receiver, true) === _target
    )
  }

  /**@type {ProxyHandler['set']} */
  return function set(target, key, newVal, receiver) {
    const trySuc = Reactive.trySet(target, key, newVal, receiver)
    if (trySuc !== TRY_PROXY_NO_RESULT) return trySuc
    warn('set2 trap...')
    beforeSet(target, key, receiver)
    const suc = Reflect.set(...arguments)
    if (key === 'length') {
      // debugger
    }
    if (suc && canTrigger()) {
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
      // const type = set.getType(targetRaw, key, valAfterSet, oldVal)
      // trigger(target, key, type, valAfterSet)
      withSceneStatus(
        false,
        trigger,
        target,
        key,
        getType(),
        valAfterSet,
        isCommonArrayPropertySet
      )
      // trigger(target, key, getType(), valAfterSet, isCommonArrayPropertySet)
      return true
    }
    if (!suc && handleThrow) return Reactive.handleSetFail(...arguments, false)
    return suc
  }
}

export { getSetTrap }
