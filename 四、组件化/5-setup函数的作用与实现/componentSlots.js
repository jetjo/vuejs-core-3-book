/**
 * @template HN, Ele
 * @typedef {NonNullable<VComponent<HN, Ele>['component']>} VComponentInstance
 */
/**
 * @template HN, Ele
 * @typedef {VComponent<HN, Ele>['children']} VVCom_Children
 */

/**
 * @template HN, Ele
 * @param {VComponentInstance<HN, Ele>} instance
 * @param {VVCom_Children<HN, Ele>} children
 */
export const initSlots = (instance, children) => {
  throw new Error('未实现!')
}
