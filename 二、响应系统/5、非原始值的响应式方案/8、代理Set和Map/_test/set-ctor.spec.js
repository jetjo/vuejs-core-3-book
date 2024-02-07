'#reactive/5-8.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
  }
  mySize() {
    console.log(this, 'this')
    return Reflect.get(super.constructor.prototype, 'size', this) // undefined
  }
  // NOTE: Symbol.toStringTag不是一个方法,而是一个返回字符串的属性
  get [Symbol.toStringTag]() {
    return 'MySet'
  }
}

const raw = new Set([1, 2, 3])
const state = reactive(raw)

console.log({ raw })

// // TypeError: number 3 is not iterable (cannot read property Symbol(Symbol.iterator))
// const myRaw = Reflect.construct(state.constructor, [3, 2, 1], MySet)
const myRaw = Reflect.construct(state.constructor, [[3, 2, 1]], MySet)

console.log({ myRaw }, myRaw.toString())

// MySet.prototype = reactive(MySet.prototype)
console.log(
  Object.getOwnPropertyDescriptor(MySet, 'prototype'),
  'MySet.prototype'
)

// const myState = Reflect.construct(
//   state.constructor,
//   [[3, 2, 1]],
//   reactive(MySet)
// )

// console.log({ myState })
