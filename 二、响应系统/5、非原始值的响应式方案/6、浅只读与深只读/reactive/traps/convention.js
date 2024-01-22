export * from '@/reactive/_traps/convention/4-11.js'
import {
  isReactive,
  isShallowReactive,
  isReadonlyReactive,
  READONLY_REACTIVE_FLAG
} from '@/reactive/_traps/convention/4-11.js'

// const READONLY_REACTIVE_FLAG = Symbol('readonly_flag')

// function isReadonlyReactive(target, hasReactiveFlag = false) {
//   return (
//     (hasReactiveFlag || isReactive(target)) &&
//     target[READONLY_REACTIVE_FLAG] === true
//   )
// }

function isReactiveDeep(target, hasReactiveFlag = false) {
  return (
    (hasReactiveFlag || isReactive(target)) &&
    !isShallowReactive(target, true) &&
    !isReadonlyReactive(target, true)
  )
}

function isReactiveShallow(target, hasReactiveFlag = false) {
  return (
    isShallowReactive(target, hasReactiveFlag) &&
    !isReadonlyReactive(target, true)
  )
}

function isReadonlyDeep(target, hasReactiveFlag = false) {
  return (
    isReadonlyReactive(target, hasReactiveFlag) &&
    !isShallowReactive(target, true)
  )
}

function isReadonlyShallow(target, hasReactiveFlag = false) {
  return (
    isReadonlyReactive(target, hasReactiveFlag) &&
    isShallowReactive(target, true)
  )
}

function isExpectedReactiveFlag(
  // function isExpectedReactive(
  reactive,
  isShallow,
  isReadonly,
  hasReactiveFlag = false
) {
  const isExpectedFlag = isShallow
    ? isReadonly
      ? isReadonlyShallow
      : isReactiveShallow
    : isReadonly
      ? isReadonlyDeep
      : isReactiveDeep

  return isExpectedFlag(reactive, hasReactiveFlag)
}

/**
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2.vue |GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-2.vue |GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-3.vue |GitHub-learn-vue项目 }
 * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-4.vue |GitHub-learn-vue项目 }
 */
function isExpectedReactive(
  reactive,
  isShallow,
  isReadonly,
  hasReactiveFlag = false
) {
  if (!hasReactiveFlag && !isReactive(reactive)) return false
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

export {
  READONLY_REACTIVE_FLAG,
  reactiveFlagChecker,
  isReadonlyDeep,
  isReadonlyReactive
}
