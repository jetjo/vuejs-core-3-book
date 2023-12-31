import { log } from '../../4、响应系统的作用与实现'
import { reactive } from './reactive'
import { effect } from '../7、代理数组/effect/index.js'

class Base {
  doSome() {
    log('doSome', this.type)
  }
}

class A extends Base {
  constructor() {
    super()
    this.type = 'A'
    // this.doSome = () => super.doSome()
    this.doSome = function () {
      log('doSome', this.type)
    }
  }
}

const a = new A()

const aState = reactive(a)

effect(() => {
  // 因为`doSome`是箭头函数,绑定了被代理的`a`自身作为`this`
  // 所以即使`doSome`读取了`type`属性,
  // 但是去没有被收集为依赖
  log('effect')
  aState.doSome()
  log('effect end')
})

setTimeout(() => {
  aState.type = 'B'
}, 0)

// setTimeout(() => {
//   log(a)
// }, 0)
