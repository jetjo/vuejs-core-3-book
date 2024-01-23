import { withRecordTrapOption } from '#reactive/traps/option.js'
import { createReactive } from '#reactive/5-8.js'
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
  // TODO: 确保reactiveApi有isShallow和isReadonly属性
  if (reactiveApi != undefined) {
    isShallow = reactiveApi.isShallow
    isReadonly = reactiveApi.isReadonly
  }
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
