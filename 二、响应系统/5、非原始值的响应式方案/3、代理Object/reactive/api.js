import { createReactive as createReactiveBase } from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/api.js'
import { trapGetters } from './traps/index.js'

function createReactive(isShallow = false) {
  const baseGetApi = createReactiveBase(isShallow)
  trapGetters.forEach(getter => baseGetApi.addTrapBeforeCall(getter))
  return baseGetApi
}

export { createReactive }
