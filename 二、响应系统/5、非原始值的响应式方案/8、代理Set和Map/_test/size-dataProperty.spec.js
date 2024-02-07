'#reactive/5-8.js'
import { effect } from '../../../effect/index/4-11.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
  }
  size() {
    console.log(this, 'this')
    return super.size
  }
  mySize() {
    console.log(this, 'this')
    // return super.size
    // NOTE: 语法错误, "super" 的后面必须是参数列表或成员访问。
    // return Reflect.get(super, 'size', this)
    // return Reflect.get(Set.prototype, 'size', this) //ok
    // return Reflect.get(super.constructor, 'size', this) // undefined
    console.warn(super.prototype, 'super.prototype') // undefined
    // TypeError: Reflect.get called on non-object
    // return Reflect.get(super.prototype, 'size', this) //
    console.warn(super.constructor, 'super.constructor')
    // 语法错误, super必须打点儿调用其成员
    // console.warn(super.constructor.prototype===super, 'super.constructor.prototype===super')
    console.warn(
      super.constructor.prototype === Set.prototype,
      'super.constructor.prototype===Set.prototype'
    )
    return Reflect.get(super.constructor.prototype, 'size', this) // undefined
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

// effect(
//   () => {
//     console.log(myState.size(), 'myState.size()')
//     // console.log(myState.mySize(), 'myState.mySize()')
//   },
//   { queueJob: false }
// )

myState.add(4)
myState.delete(1)
myState.clear()

globalThis.TEST__ = {
  MySet,
  myRaw
}
