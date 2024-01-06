import { createReactive } from '../../6、浅只读与深只读/reactive/api.js'
import { doWithAllTrapGetter } from './traps/helper.js'
import * as trapsModule from './traps/index.js'
import { track, trigger } from './track-trigger.js'
import getReactive from './traps/Reactive.js'

const reactive = createReactive()
const shallowReactive = createReactive(true)
const readonly = createReactive(false, true)
const shallowReadonly = createReactive(true, true)

const trapOption = {
  track,
  trigger,
  getReactive
}
reactive.setTrapOption(trapOption)
shallowReactive.setTrapOption(trapOption)
readonly.setTrapOption(trapOption)
shallowReadonly.setTrapOption(trapOption)

doWithAllTrapGetter(trapsModule, getter => {
  reactive.addTrapBeforeCall(getter)
  shallowReactive.addTrapBeforeCall(getter)
  readonly.addTrapBeforeCall(getter)
  shallowReadonly.addTrapBeforeCall(getter)
})

export { reactive, shallowReactive, readonly, shallowReadonly }
