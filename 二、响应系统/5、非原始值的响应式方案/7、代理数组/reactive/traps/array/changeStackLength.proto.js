import arrayStackMethods from './changeStackLength.js'

console.log(arrayStackMethods)

const pushProxy = new Proxy(Function.prototype.call, {
  // const pushProxy = new Proxy(Array.prototype.push, {
  apply(target, thisArg, args) {
    console.log('pushProxy', thisArg, args)
    // return Reflect.apply(target, thisArg, args)
    return Reflect.apply(thisArg, args[0], args.slice(1))
  }
})

const arrayLike = {
  length: 3,
  unrelated: 'foo',
  2: 4
}
debugger
// Array.prototype.push.call(arrayLike, 1, 2)
// pushProxy.call(Array.prototype.push, arrayLike, 1, 2)
const proxyBoundToPush = pushProxy.bind(Array.prototype.push)
// proxyBoundToPush(arrayLike, 1, 2)
// arrayLike.push = proxyBoundToPush.bind(null, arrayLike)
// Object.prototype.push = function (...args) {
//   // proxyBoundToPush.apply(null, [this, ...args])
//   Array.prototype.push.apply(this, args)
// }
arrayLike.push(1, 2)
console.log(arrayLike)
// { '2': 4, '3': 1, '4': 2, length: 5, unrelated: 'foo' }

const plainObj = {}
// There's no length property, so the length is 0
Array.prototype.push.call(plainObj, 1, 2)
console.log(plainObj)
// { '0': 1, '1': 2, length: 2 }

export {}
