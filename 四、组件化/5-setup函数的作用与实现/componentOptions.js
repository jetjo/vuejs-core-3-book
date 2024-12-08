/**
 * @template HN, Ele
 * @typedef {NonNullable<VComponent<HN, Ele>['component']>} VComponentInstance
 */
/**
 * @template HN, Ele
 * @typedef {VComponent<HN, Ele>['props']} VRawPropsData
 */

import { isArray } from '@vue/shared'

/** @typedef {import('#shims').Data} Data */

/**
 * @template HN, Ele
 * @param {VComponentInstance<HN, Ele>} instance
 * @param {Function[] | Function} hook
 */
export function callHook(hook, instance, type = null) {
  if (isArray(hook)) {
    hook.map(h => h.call(instance))
  } else {
    hook.call(instance)
  }
}
