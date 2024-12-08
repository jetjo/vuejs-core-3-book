import { warn } from '#root/utils'
import { shallowReactive } from '#vue-fixed/reactive'
import {
  EMPTY_ARR,
  EMPTY_OBJ,
  camelize,
  extend,
  hasOwn,
  isArray,
  isFunction,
  isObject,
  isReservedProp,
  isString
} from '@vue/shared'
import { isEmitListener } from './componentEmits'

const BooleanFlags = {
  shouldCast: 0,
  0: 'shouldCast',
  shouldCastTrue: 1,
  1: 'shouldCastTrue'
}

// @ts-ignore
function validatePropName(key) {
  if (key[0] !== '$' && !isReservedProp(key)) {
    return true
  } else if (__DEV__) {
    warn(`Invalid prop name: "${key}" is a reserved property.`)
  }
  return false
}

// use function string name to check type constructors
// so that it works across vms / iframes.
/**@returns {string} */
// @ts-ignore
function getType(ctor) {
  // Early return for null to avoid unnecessary computations
  if (ctor === null) {
    return 'null'
  }

  // Avoid using regex for common cases by checking the type directly
  if (typeof ctor === 'function') {
    // Using name property to avoid converting function to string
    return ctor.name || ''
  } else if (typeof ctor === 'object') {
    // Attempting to directly access constructor name if possible
    const name = ctor.constructor && ctor.constructor.name
    return name || ''
  }

  // Fallback for other types (though they're less likely to have meaningful names here)
  return ''
}

// @ts-ignore
function isSameType(a, b) {
  return getType(a) === getType(b)
}

// @ts-ignore
function getTypeIndex(type, expectedTypes) {
  if (isArray(expectedTypes)) {
    return expectedTypes.findIndex(t => isSameType(t, type))
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  return -1
}

/**
 * @param {import('vue').ConcreteComponent} comp
 * @param {import('vue').AppContext} appContext
 * @returns {import('#shims').NormalizedPropsOptions}
 */
export function normalizePropsOptions(comp, appContext) {
  const cache = appContext.propsCache
  const cached = cache.get(comp)
  if (cached) {
    return cached
  }

  const raw = comp.props
  /**@type {Record<string, any>} */
  const normalized = {}
  const needCastKeys = []

  // apply mixin/extends props
  let hasExtends = false
  if (typeof __FEATURE_OPTIONS_API__ !== 'undefined' && !isFunction(comp)) {
    warn('不支持mixin/extends props!')
  }

  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR)
    }
    // @ts-ignore
    return EMPTY_ARR
  }

  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      if (__DEV__ && !isString(raw[i])) {
        warn(`props must be strings when using array syntax.`, raw[i])
      }
      const normalizedKey = camelize(raw[i])
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ
      }
    }
  } else if (raw) {
    if (__DEV__ && !isObject(raw)) {
      warn(`invalid props options`, raw)
    }
    for (const key in raw) {
      const normalizedKey = camelize(key)
      if (validatePropName(normalizedKey)) {
        const opt = raw[key]
        const prop = (normalized[normalizedKey] =
          isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt))
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type)
          const stringIndex = getTypeIndex(String, prop.type)
          prop[BooleanFlags.shouldCast] = booleanIndex > -1
          prop[BooleanFlags.shouldCastTrue] = stringIndex < 0 || booleanIndex < stringIndex
          // if the prop needs boolean casting or default value
          if (booleanIndex > -1 || hasOwn(prop, 'default')) {
            needCastKeys.push(normalizedKey)
          }
        }
      }
    }
  }

  const res = [normalized, needCastKeys]
  if (isObject(comp)) {
    cache.set(comp, res)
  }
  // @ts-ignore
  return res
}

/**
 */

/**
 * @template HN, Ele
 * @typedef {NonNullable<VComponent<HN, Ele>['component']>} VComponentInstance
 */
/**
 * @template HN, Ele
 * @typedef {VComponent<HN, Ele>['props']} VRawPropsData
 */

/** @typedef {import('#shims').Data} Data */

/**
 * @template HN, Ele
 * @param {VComponentInstance<HN, Ele>} instance
 * @param {Data | null} rawPropsData
 */
export function initProps(instance, rawPropsData, isStateful = true, isSSR = false) {
  /**@type {Data} */
  const props = {}
  /**@type {Data} */
  const attrs = {}

  // TODO: 作用未知
  // def(attrs, InternalObjectKey, 1)

  instance.propsDefaults = Object.create(null)

  setFullProps(instance, rawPropsData, props, attrs)

  // 确保定义的属性都存在
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) props[key] = undefined
  }

  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props)
  } else warn('暂未支持函数式组件的props!')

  instance.attrs = attrs
}

/**
 * @template HN, Ele
 * @param {VComponentInstance<HN, Ele>} instance
 * @param {Data | null} rawPropsData
 * @param {Data} props
 * @param {Data} attrs
 */
function setFullProps(instance, rawPropsData, props, attrs) {
  const [propOptions, needCastKeys] = instance.propsOptions
  let attrHasChanged = false
  /**@type {Data} */
  const rawCastValues = {}
  if (rawPropsData) {
    for (const key in rawPropsData) {
      // if (Object.hasOwnProperty.call(raw, key))
      const value = rawPropsData[key]
      let camelKey
      if (propOptions && hasOwn(propOptions, (camelKey = camelize(key)))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value
        } else {
          rawCastValues[key] = value
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value
          attrHasChanged = true
        }
      }
    }
  }
  if (needCastKeys) {
    warn('暂未支持needCastKeys!')
  }
  return attrHasChanged
}
