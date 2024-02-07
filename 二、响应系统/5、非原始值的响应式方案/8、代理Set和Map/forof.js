import { createReactive } from './reactive/api.js'
// import { reactive } from '@jetjo/vue3/reactive'
import { effect } from '@jetjo/vue3/effect'
import { log } from '#utils'

const reactive = createReactive()()

class MySet extends Set {
  constructor() {
    super(...arguments)

    this.clearP = {
      _clear: function () {
        // Error: 'super' keyword outside a method
        // return super.clear()
      }
    }._clear
    this.a1 = () => {
      log('a1方法, 这个函数没有prototype', this)
    }
    this.b = 'b'
  }
  // 定义在MySet.prototype上
  m() {
    log('m方法, 这个函数没有prototype', this)
  }
  // function pM(params) {

  // }
  aO = {}
  a = () => {
    log('a方法, 这个函数没有prototype', this)
  }
  // NOTE: 定义在MySet.prototype上,特殊的函数,名称以`get `开头,且没有`prototype`属性
  get size() {
    this.a()
    this.m()
    this.a1()
    return this.b
    // return super.size
  }
  // [Symbol.iterator]() {
  //   return super[Symbol.iterator](...arguments)
  // }
  // add() {
  //   return super.add(...arguments)
  // }
  // delete() {
  //   return super.delete(...arguments)
  // }
  // clear() {
  //   return super.clear(...arguments)
  // }
  // has() {
  //   return super.has(...arguments)
  // }
  // difference() {
  //   return super.difference && super.difference(...arguments)
  // }
  // entries() {
  //   return super.entries(...arguments)
  // }
  // forEach() {
  //   return super.forEach(...arguments)
  // }
  // intersection() {
  //   return super.intersection && super.intersection(...arguments)
  // }
  // isDisjointFrom() {
  //   return super.isDisjointFrom && super.isDisjointFrom(...arguments)
  // }
  // isSubsetOf() {
  //   return super.isSubsetOf && super.isSubsetOf(...arguments)
  // }
  // isSupersetOf() {
  //   return super.isSupersetOf && super.isSupersetOf(...arguments)
  // }
  // keys() {
  //   return super.keys(...arguments)
  // }
  // symmetricDifference() {
  //   return super.symmetricDifference && super.symmetricDifference(...arguments)
  // }
  // union() {
  //   return super.union && super.union(...arguments)
  // }
  // values() {
  //   return super.values(...arguments)
  // }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(() => {
  log(myState.size, 'myState.size')
  // myState.has(1)
  log(myState.myHas(1), 'myState.has(1)')
  // log(myState.myHasBound(1), 'myState.myHasBound(1)')
  // log(myState.myHasArrowThis(1), 'myState.myHasArrowThis(1)')
  // for (const item of myState) {
  //   console.log(item)
  // }
})

setTimeout(() => {
  myState.b = '11111' // Set类上的自定义属性,无法触发追踪, vue3如何处理?
  log(myRaw, 'settimeout myRaw')
}, 0)

log('m方法定义在了MySet.prototype上了?', Object.hasOwn(MySet.prototype, 'm'))
log('a属性定义在了MySet.prototype上了?', Object.hasOwn(MySet.prototype, 'a'))

log('a属性定义在了myRaw上了?', Object.hasOwn(myRaw, 'a'))

log(
  'm方法自身是否拥有prototype属性?',
  Object.hasOwn(MySet.prototype.m, 'prototype'),
  MySet.prototype.m.prototype
)

log(
  'MySet.prototype自身的size属性',
  Object.getOwnPropertyDescriptor(MySet.prototype, 'size')
)

window.TEST__ = {
  MySet,
  myRaw
}
