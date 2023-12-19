import { doWithAllTrapGetter, getApi } from '../../index.js'
import * as ProxyHandlerHelper from './traps/index.js'
export { track, trigger } from '../../index.js'

const api = getApi()
const shallowApi = getApi(true)

doWithAllTrapGetter(ProxyHandlerHelper, getter => {
  api.addTrapBeforeCall(getter)
  shallowApi.addTrapBeforeCall(getter)
})

export { api, shallowApi }
