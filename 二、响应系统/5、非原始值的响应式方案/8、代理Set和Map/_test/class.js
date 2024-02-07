import { log } from '../../../utils/index.js'
'#reactive/5-8.js'
import { effect } from '../../../effect/index/4-11.js'

class Base {
  doSome() {
    console.log('doSome', this.type)
  }
}

class A extends Base {
  constructor() {
    super()
    this.type = 'A'
    this.doSome = () => super.doSome()
  }
}

const a = new A()

const aState = reactive(a)

effect(() => {
  // NOTE: 因为`doSome`是箭头函数,绑定了被代理的`a`自身作为`this`
  // 所以即使`doSome`读取了`type`属性,
  // 但是去没有被收集为依赖
  console.log('effect')
  aState.doSome()
  console.log('effect end')
})

setTimeout(() => {
  aState.type = 'B'
}, 0)
