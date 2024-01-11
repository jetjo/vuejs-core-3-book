let isDev
let _LogLevel

// __DEV__是被打包工具rollup.js或webpack预定义的
if (typeof __DEV__ !== 'undefined') {
  isDev = !!__DEV__
}

const logBrand = 'v3book'

let _logToken = '' //'getSetTrap 5-6' // 'getReactive 5-6' // 'getOwnKeysTrap 5-6' //'getHasTrap 5-6' // 'getGetTrap 5-6' // 'getDeleteTrap 5-6' // 'createReactive 5-6'

function log(...messages) {
  if (messages[0] !== _logToken) return
  if (_LogLevel === 'warn' || _LogLevel === 'error' || _LogLevel === 'none')
    return
  console.log(`[${logBrand}]`, ...messages)
}

function warn(...messages) {
  if (_LogLevel === 'error' || _LogLevel === 'none') return
  console.warn(`[${logBrand}]`, ...messages)
}

function errorLog(isThrow = true, ...messages) {
  if (isThrow) throw new Error(messages.join())
  if (_LogLevel === 'none') return
  console.error(`[${logBrand}]`, ...messages)
}

function error(...messages) {
  errorLog(false, ...messages)
}

function throwErr(...messages) {
  errorLog(true, ...messages)
}

function disableLog(logLevel) {
  _LogLevel = logLevel
}

export { warn, throwErr, error, disableLog, log }
