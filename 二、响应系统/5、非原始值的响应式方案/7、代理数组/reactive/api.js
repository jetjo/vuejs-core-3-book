import { createReactive as baseCreateReactive } from '#reactive/5-6.js'
import { trapGetters } from './traps/index.js'
import { track, trigger } from './track-trigger.js'
import getReactive from './traps/Reactive.js'
import { withRecordTrapOption } from '#reactive/traps/option.js'

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
