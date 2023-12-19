export * from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/convention.js'
import {
  isReactive,
  isShallowReactive
} from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用//reactive/traps/convention.js'

const READONLY_REACTIVE_FLAG = Symbol('readonly_flag')

function isReadonlyReactive(target, internalCall = false) {
  return (
    (internalCall || isReactive(target)) &&
    target[READONLY_REACTIVE_FLAG] === true
  )
}

function isReactiveDeep(target, internalCall = false) {
  return (
    isReactive(target) &&
    !isShallowReactive(target, internalCall) &&
    !isReadonlyReactive(target, internalCall)
  )
}

function isReactiveShallow(target, internalCall = false) {
  return (
    isShallowReactive(target, internalCall) &&
    !isReadonlyReactive(target, internalCall)
  )
}

function isReadonlyDeep(target, internalCall = false) {
  return (
    isReadonlyReactive(target, internalCall) &&
    !isShallowReactive(target, internalCall)
  )
}

function isReadonlyShallow(target, internalCall = false) {
  return (
    isReadonlyReactive(target, internalCall) &&
    isShallowReactive(target, internalCall)
  )
}

function isExpectedReactiveFlag(
  // function isExpectedReactive(
  reactive,
  isShallow,
  isReadonly,
  internalCall = false
) {
  const isExpectedFlag = isShallow
    ? isReadonly
      ? isReadonlyShallow
      : isReactiveShallow
    : isReadonly
      ? isReadonlyDeep
      : isReactiveDeep

  return isExpectedFlag(reactive, internalCall)
}

/**
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2.vue|GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-2.vue|GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-3.vue|GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-4.vue|GitHub-learn-vue项目 }
 * @see {@link file:///Users/loong/project/vue-project/src/响应式数据/index2.vue } 本地仓库vue-project项目
 * @see {@link file:///Users/loong/project/vue-project/src/响应式数据/index2-2.vue } 本地仓库vue-project项目
 * @see {@link file:///Users/loong/project/vue-project/src/响应式数据/index2-3.vue } 本地仓库vue-project项目
 * @see {@link file:///Users/loong/project/vue-project/src/响应式数据/index2-4.vue } 本地仓库vue-project项目
 */
function isExpectedReactive(
  reactive,
  isShallow,
  isReadonly,
  internalCall = false
) {
  if (!internalCall && !isReactive(reactive)) return false
  if (!isReadonly) return true
  const isExpectedFlag = isReadonlyReactive
  return isExpectedFlag(reactive, true)
}

const reactiveFlagChecker = Object.create(null)

Object.assign(reactiveFlagChecker, {
  // isReactiveDeep,
  // isReactiveShallow,
  // isReadonlyDeep,
  // isReadonlyShallow
  isExpected: isExpectedReactive
})

Object.freeze(reactiveFlagChecker)

export { READONLY_REACTIVE_FLAG, reactiveFlagChecker }
