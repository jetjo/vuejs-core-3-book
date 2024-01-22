import { withRecordTrapOption } from '@/reactive/_traps/option.js'
import { createReactive } from '@/reactive/api/5-8.js'
import { REF__VALUE_KEY, withRefFlag } from './convention.js'

function factory({ reactiveApi, isShallow, isReadonly, version }) {
  return function ref(v) {
    const wrapper = {
      // __proto__: null,
      [REF__VALUE_KEY]: v
    }
    return reactiveApi(withRefFlag(wrapper, isShallow, isReadonly, version))
  }
}

function createRef(
  reactiveApi = undefined,
  isShallow = false,
  isReadonly = false
) {
  const version = '6-1'
  reactiveApi = reactiveApi || createReactive(isShallow, isReadonly, version)()
  return withRecordTrapOption({
    factory,
    version,
    reactiveApi,
    isShallow,
    isReadonly
  })
}

export { createRef }
