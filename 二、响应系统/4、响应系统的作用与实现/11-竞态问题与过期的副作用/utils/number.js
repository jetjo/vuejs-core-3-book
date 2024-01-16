function notNaN(v) {
  // NOTE: NaN不是保留符号,可能是一个内置的全局变量,赋值没有效果,不会改变其值
  // NaN = ''
  return v === v
}

export { notNaN }
