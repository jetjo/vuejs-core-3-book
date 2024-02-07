import { reactive } from '@jetjo/vue3/reactive'
import { effect } from '@jetjo/vue3/effect'

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
