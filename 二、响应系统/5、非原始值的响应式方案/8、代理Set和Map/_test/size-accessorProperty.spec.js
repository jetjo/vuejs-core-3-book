'#reactive/5-8.js'
import { effect } from '../../../effect/index/4-11.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
  }
  get size() {
    console.log(this, 'this')
    return super.size
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

// effect(
//   () => {
//     console.log(myState.size, 'myState.size')
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
