import { reactive } from '../tmp/index.js'
import { effect } from '../../7、代理数组/effect/index.js'

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

effect(
  () => {
    console.log(myState.size, 'myState.size')
  },
  { queueJob: false }
)

myState.add(4)
myState.delete(1)
myState.clear()

globalThis.TEST__ = {
  MySet,
  myRaw
}
