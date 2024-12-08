import { throwErr, warn } from '#root/utils'
import { extend, hasOwn, hyphenate, isArray, isFunction, isObject, isOn } from '@vue/shared'

/**
 * @param {VComponent['component']} instance
 * @param {string} event
 * @param {...*} payload
 */
export function emit(instance, event, ...payload) { }

/**
 * @param {import('vue').ConcreteComponent} comp
 * @param {import('vue').AppContext} appContext
 * @returns {import('#shims').ObjectEmitsOptions | null}
 */
export function normalizeEmitsOptions(comp, appContext) {
  const cache = appContext.emitsCache
  const cached = cache.get(comp)
  if (cached !== undefined) {
    return cached
  }

  const raw = comp.emits
  /**@type {Record<string, any>} */
  let normalized = {}

  // apply mixin/extends props
  let hasExtends = false
  if (typeof __FEATURE_OPTIONS_API__ !== 'undefined' && !isFunction(comp)) {
    warn('不支持mixin/extends emits!')
  }

  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null)
    }
    return null
  }

  if (isArray(raw)) {
    raw.forEach(key => (normalized[key] = null))
  } else {
    extend(normalized, raw)
  }

  if (isObject(comp)) {
    cache.set(comp, normalized)
  }
  return normalized
}

// Check if an incoming prop key is a declared emit event listener.
// e.g. With `emits: { click: null }`, props named `onClick` and `onclick` are
// both considered matched listeners.
/**
 * @param {import('#shims').ObjectEmitsOptions | null} options
 * @param {string} key
 */
export function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false
  }

  if (__COMPAT__) throwErr('不支持!')

  key = key.slice(2).replace(/Once$/, '')
  return (
    hasOwn(options, key[0].toLowerCase() + key.slice(1)) ||
    hasOwn(options, hyphenate(key)) ||
    hasOwn(options, key)
  )
}
