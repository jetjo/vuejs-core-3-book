import { reactive } from '@jetjo/vue3/reactive'
import { effect } from '@jetjo/vue3/effect'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.myHas = function (...args) {
      // 'super' keyword outside a method, 如果是箭头函数则可以
      // return super.has(...args)
      // NOTE: 在代理`myState`上打点儿调用`myHas`时,`this`指向`myState`,而不是`myRaw
      // 所以对`has`属性的访问仍然能被代理到
      return this.has(...args)
    }
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.myHas(11), 'myState.has(1)')
  },
  { queueJob: false }
)

myState.add(11)
myState.delete(11)

globalThis.TEST__ = {
  MySet,
  myRaw
}
