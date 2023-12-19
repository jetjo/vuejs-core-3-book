function isPrototypeOfRuntime(o, inTrap = false) {
  const getProto = inTrap ? Reflect.getPrototypeOf : Object.getPrototypeOf
  const proto = getProto(o)
  return protoInRuntime.indexOf(proto) !== -1
}

const iterator = [][Symbol.iterator]()
const iteratorProto = Object.getPrototypeOf(iterator)

let asyncIterator = {
  [Symbol.asyncIterator]() {
    return {
      async next() {
        await Promise.resolve()
        return { done: true }
      }
    }
  }
}[Symbol.asyncIterator]()
const asyncIteratorProto = Object.getPrototypeOf(asyncIterator)

const AsyncFuncProto = Object.getPrototypeOf(async function () {})

const GeneratorProto = Object.getPrototypeOf(function* () {})
const AsyncGeneratorProto = Object.getPrototypeOf(async function* () {})

// 运行时中内建的对象太多了,这不是办法...
// 不同的JS引擎也有自身特有的对象
// 况且还有DOM、BOM和第三方库等
const protoInRuntime = [
  Object.prototype,
  Function.prototype,
  AsyncFuncProto,
  Object.getPrototypeOf(AsyncFuncProto),
  GeneratorProto,
  Object.getPrototypeOf(GeneratorProto),
  AsyncGeneratorProto,
  Object.getPrototypeOf(AsyncGeneratorProto),
  Number.prototype,
  BigInt.prototype,
  String.prototype,
  Boolean.prototype,
  Symbol.prototype,
  Array.prototype,
  ArrayBuffer.prototype,
  Map.prototype,
  WeakMap.prototype,
  Set.prototype,
  WeakSet.prototype,
  iteratorProto,
  Object.getPrototypeOf(iteratorProto),
  BigInt64Array.prototype,
  BigUint64Array.prototype,
  Date.prototype,
  DataView.prototype,
  Error.prototype,
  EvalError.prototype,
  Float32Array.prototype,
  Float64Array.prototype,
  Int8Array.prototype,
  Int16Array.prototype,
  Int32Array.prototype,
  Promise.prototype,
  RangeError.prototype,
  ReferenceError.prototype,
  RegExp.prototype,
  SyntaxError.prototype,
  TypeError.prototype,
  URIError.prototype,
  Uint8Array.prototype,
  Uint16Array.prototype,
  Uint32Array.prototype,
  Uint8ClampedArray.prototype
  // AggregateError.prototype,
  // FinalizationRegistry.prototype,
  // SharedArrayBuffer.prototype,
  // WeakRef.prototype,
  // Atomics
  // Math
  // JSON
  // Proxy
  // Reflect
]

const runWithoutProto = (target, cb) => {
  const protoBak = Object.getPrototypeOf(target)
  Object.setPrototypeOf(target, null)
  try {
    return cb()
  } finally {
    Object.setPrototypeOf(target, protoBak)
  }
}

export { runWithoutProto }
