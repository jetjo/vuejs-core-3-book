import { warn } from './log.js'

const INTERNAL_IMPL_KEY = Symbol()

Function.prototype[INTERNAL_IMPL_KEY] = () => warn('方法没有内部实现!')

function provideMethodToModule(method, moduleReceiver) {
  const impl = method
  const abs = moduleReceiver
  abs[INTERNAL_IMPL_KEY] = impl
}

export { provideMethodToModule, INTERNAL_IMPL_KEY }
