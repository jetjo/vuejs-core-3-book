function isGlobalSymbol(symbol) {
  if (!isSymbol(symbol)) return false
  // return Symbol.for(Symbol.keyFor(symbol)) === symbol
  // Symble.keyFor返回string或undefined,
  // 如果是undefined,
  // 则symbol是执行`Symbol()`得到的,
  // 否则是执行`Symbol.for()`得到的.
  // return typeof Symbol.keyFor(symbol) === 'string'
  // return !!(typeof Symbol.keyFor(symbol))
  const key = Symbol.keyFor(symbol)
  return !!key || key === ''
}

function isSymbol(v) {
  return typeof v === 'symbol' || typeof Object(v).valueOf() === 'symbol'
}

/**@description 确认是非全局的Symbol */
function isNonRegSymbol(symbol) {
  if (!isSymbol(symbol)) return false
  return Symbol.keyFor(symbol) === undefined
}

export { isSymbol, isGlobalSymbol, isNonRegSymbol }
