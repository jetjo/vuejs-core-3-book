import { createReactive as createReactiveBase } from '../../../reactive/api/4-11.js'
import { trapGetters } from './traps/index.js'

function createReactive(
  isShallow = false,
  isReadonly = false,
  version = '5-3'
) {
  const baseGetApi = createReactiveBase(isShallow, isReadonly, version)
  trapGetters.forEach(getter => baseGetApi.addTrapBeforeCall(getter))
  return baseGetApi
}

export { createReactive }
