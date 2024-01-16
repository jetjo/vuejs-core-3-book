import { withRecordTrapOption } from '../../../../reactive/_traps/option.js'
import { warn, notNaN, isValidArrayIndex } from '../../../../utils/index.js'
import { canTrigger } from '../trigger-helper.js'
import { TRIGGER_TYPE, TRY_PROXY_NO_RESULT, RAW } from './convention.js'

/**@type {TrapFactory<'set'>} */
function factory({ isReadonly, trigger, Reactive }) {
  if (isReadonly) {
    return function set() {
      warn(`不能更改只读对象的属性值!`)
      return true
    }
  }

  let receiverRaw, propertyName

  const arrayGetter = (() => {
    let oldLen, hasProperty
    const getArrLengthTriggerType = () => {
      return receiverRaw.length > oldLen
        ? TRIGGER_TYPE.SET
        : TRIGGER_TYPE.LengthSubtract
    }

    const getArrIndexTriggerType = () => {
      if (Number(propertyName) >= oldLen) return TRIGGER_TYPE.ADD
      return hasProperty ? TRIGGER_TYPE.SET : TRIGGER_TYPE.EmptySlotSet
    }

    const res = () => {
      oldLen = receiverRaw.length
      hasProperty = Object.hasOwn(receiverRaw, propertyName)
      return 'length' === propertyName
        ? getArrLengthTriggerType
        : getArrIndexTriggerType
    }

    Object.defineProperty(res, 'save', {
      value() {
        return { __proto__: null, hasProperty, oldLen }
      },
      enumerable: true
    })
    Object.defineProperty(res, 'restore', {
      value(s) {
        hasProperty = s.hasProperty
        oldLen = s.oldLen
      },
      enumerable: true
    })
    return res
  })()

  const getTypeGetter = (() => {
    let hasProperty
    const getArrayOperateTypeFlag = () =>
      Array.isArray(receiverRaw) &&
      ('length' === propertyName || isValidArrayIndex(propertyName))

    const commonGetter = () =>
      hasProperty ? TRIGGER_TYPE.SET : TRIGGER_TYPE.ADD

    const res = () => {
      hasProperty = Object.hasOwn(receiverRaw, propertyName)
      const isArray = getArrayOperateTypeFlag()
      const getType = isArray ? arrayGetter() : commonGetter
      return {
        __proto__: null,
        isArrayProperty: isArray,
        getType,
        s: res.save(isArray)
      }
    }

    Object.defineProperty(res, 'save', {
      value(isArrayProperty) {
        return {
          __proto__: null,
          hasProperty,
          arrayGetterS: isArrayProperty ? arrayGetter.save() : undefined
        }
      },
      enumerable: true
    })
    Object.defineProperty(res, 'restore', {
      value(s) {
        hasProperty = s.hasProperty
        if (s.arrayGetterS !== undefined) arrayGetter.restore(s.arrayGetterS)
      },
      enumerable: true
    })

    return res
  })()

  /**@type {ProxyHandler['set']} */
  return function set(target, key, newVal, receiver) {
    const trySuc = Reactive.trySet(target, key, newVal, receiver)
    if (trySuc !== TRY_PROXY_NO_RESULT) return trySuc
    receiverRaw = receiver[RAW]
    propertyName = key
    const { getType, isArrayProperty, s } = getTypeGetter()
    // 此方法被调用的前提是receiver是reactive或shallowReactive的返回值
    // 所以target一定是raw,非响应的
    const oldVal = target[key]
    const suc = Reflect.set(target, key, newVal, receiver)
    // #region 恢复现场
    receiverRaw = receiver[RAW]
    propertyName = key
    getTypeGetter.restore(s)
    // #endregion
    const valAfterSet = target[key]
    if (canTrigger(oldVal, valAfterSet, target, receiver)) {
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
      trigger(target, key, getType(), valAfterSet, isArrayProperty)
    }
    return suc
  }
}

/**@param {ProxyTrapOption} */
export default function ({
  isShallow,
  isReadonly,
  Reactive,
  trigger,
  version
}) {
  return withRecordTrapOption({
    factory,
    version,
    isShallow,
    isReadonly,
    factoryName: 'getSetTrap',
    option: isReadonly ? undefined : { __proto__: null, Reactive, trigger }
  })
}
