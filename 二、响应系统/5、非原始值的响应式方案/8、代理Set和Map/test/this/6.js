import { reactive } from '../../tmp/index.js'
import { effect } from '../../../7、代理数组/effect/index.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.delete = (...args) => {
      // 'super' keyword outside a method, 如果是箭头函数则可以
      // 普通函数内可以访问不确定的this,但是不能访问不确定的super
      // this.delete = function (...args) {
      super.delete(...args)
      console.log('自定义delete', this)
    }
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.has(1), 'myState.has(1)')
  },
  { queueJob: false }
)

myState.delete(1)

globalThis.TEST__ = {
  MySet,
  myRaw
}
