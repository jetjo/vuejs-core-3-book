import { api, shallowApi } from '../../3、代理Object/reactive/api.js'

function createReactive(isShallow = false) {
  return isShallow ? shallowApi : api
}

export { createReactive }
