import { reactive } from '../../tmp/index.js'
import { effect } from '../../../7、代理数组/effect/index.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.has = () => false
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.has(111), 'myState.has(111)')
  },
  { queueJob: false }
)

myState.add(111)
myState.delete(111)

globalThis.TEST__ = {
  MySet,
  myRaw
}
