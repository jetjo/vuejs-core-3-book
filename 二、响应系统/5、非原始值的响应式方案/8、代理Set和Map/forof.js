import { reactive } from './reactive/index.js'
import { effect } from '../7、代理数组/effect/index.js'
import { log } from '../../4、响应系统的作用与实现'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.myHas = function (...args) {
      // 'super' keyword outside a method
      // return super.has(...args)
      // NOTE: 在代理`myState`上打点儿调用`myHas`时,`this`指向`myState`,而不是`myRaw
      // 所以对`has`属性的访问仍然能被代理到
      return this.has(...args)
      // return this.delete(...args)
    }
    this.myHasBound = function (...args) {
      return this.has(...args)
    }.bind(this)
    this.myHasArrowThis = (...args) => {
      return this.has(...args)
    }
    // this.has = super.has.bind(this)
    this.add = super.add.bind(this)
    // 正常工作,绑定了super
    this.delete = (...args) => super.delete(...args)
    this.clear = {
      // 省略了`function`关键字的函数,自身没有`prototype`,因此不能被`new`调用, 这一点与箭头函数相同;
      // 但是,,,这种形式的函数中的this还是不定的,这一点又与普通的函数一样;
      // 许多内建的全局函数就是这种情况,比如`parseInt`和`eval`;
      // 对其调用`Function.prototype.toString`反编译获取其字符串形式,形如`f () {}`,虽然与
      // 普通函数一样以`f`开头,但其`prototype`却是undefined;
      _clear() {
        log(this, 'this')
        // TypeError: (intermediate value).clear is not a function
        // return super.clear()
      }
    }._clear
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
