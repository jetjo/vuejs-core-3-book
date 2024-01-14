import { createReactive as baseCreateReactive } from '../../6、浅只读与深只读/reactive/api.js'
import { trapGetters } from './traps/index.js'
import { track, trigger } from './track-trigger.js'
import getReactive from './traps/Reactive.js'
import { withRecordTrapOption } from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

function factory({ isShallow, isReadonly, version }) {
  const api = baseCreateReactive(isShallow, isReadonly, version)
  const _trapOption = { ...api.trapOption, track, trigger, version }
  api.trapOption = {
    ..._trapOption,
    Reactive: getReactive(_trapOption)
  }
  api.trapGetters = trapGetters
  return api
}

/**@type {CreateReactive} */
function createReactive(
  isShallow = false,
  isReadonly = false,
  version = '5-7'
) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'createReactive'
  })
}

export { createReactive }
