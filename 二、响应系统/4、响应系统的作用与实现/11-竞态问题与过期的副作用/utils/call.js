import { error } from './log.js'

function tryCall(fn, finalCb) {
  try {
    return fn()
  } catch (err) {
    error(err?.message)
  } finally {
    if (finalCb) finalCb()
  }
}

export { tryCall }
