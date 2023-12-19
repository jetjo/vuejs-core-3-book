let isDev

// __DEV__是被打包工具rollup.js或webpack预定义的
if (typeof __DEV__ !== 'undefined') {
  isDev = !!__DEV__
}

function warn(...messages) {
  // if(!isDev) return;
  console.warn(...messages)
}

function errorLog(isThrow = true, ...messages) {
  if (isThrow) throw new Error(messages.join())
  console.error(...messages)
}

function error(...messages) {
  errorLog(false, ...messages)
}

function throwErr(...messages) {
  errorLog(true, ...messages)
}

export { warn, throwErr, error }
