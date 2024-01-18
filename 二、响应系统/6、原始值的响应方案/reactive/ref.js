import { withRecordTrapOption } from '@reactive/_traps/option.js'
import { createReactive } from '@reactive/api/5-8.js'
import { withRefFlag } from './convention.js'

function factory({ isShallow, isReadonly, version }) {
  const reactive = createReactive(isShallow, isReadonly, version)()
  return function ref(v) {
    const wrapper = {
      // __proto__: null,
      value: v
    }
    return reactive(withRefFlag(wrapper))
  }
}

export default function (isShallow = false, isReadonly = false) {
  return withRecordTrapOption({
    factory,
    version: '6-1',
    isShallow,
    isReadonly
  })
}
