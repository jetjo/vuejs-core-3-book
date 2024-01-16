import { createReactive as createReactiveBase } from '../../../reactive/api/4-11.js'
import { trapGetters } from './traps/index.js'

function createReactive(isShallow = false) {
  const baseGetApi = createReactiveBase(isShallow)
  trapGetters.forEach(getter => baseGetApi.addTrapBeforeCall(getter))
  return baseGetApi
}

export { createReactive }
