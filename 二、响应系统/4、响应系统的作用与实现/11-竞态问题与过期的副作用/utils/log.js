let isDev
let _LogLevel

// __DEV__是被打包工具rollup.js或webpack预定义的
if (typeof __DEV__ !== 'undefined') {
  isDev = !!__DEV__
}

const logBrand = 'v3book'

function log(...messages) {
  if (_LogLevel === 'warn' || _LogLevel === 'error' || _LogLevel === 'none')
    return
  console.log(`[${logBrand}]`, ...messages)
}

function warn(...messages) {
  if (_LogLevel === 'error' || _LogLevel === 'none') return
  console.warn(`[${logBrand} warn]`, ...messages)
}

function errorLog(isThrow = true, ...messages) {
  if (isThrow) throw new Error(messages.join())
  if (_LogLevel === 'none') return
  console.error(`[${logBrand} error]`, ...messages)
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
