import { reactive } from '../../tmp/index.js'
import { effect } from '../../../7、代理数组/effect/index.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.myHasBound = function (...args) {
      return this.has(...args)
    }.bind(this)
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.myHasBound(11), 'myState.has(1)')
  },
  { queueJob: false }
)

myState.add(11)
myState.delete(11)

globalThis.TEST__ = {
  MySet,
  myRaw
}
