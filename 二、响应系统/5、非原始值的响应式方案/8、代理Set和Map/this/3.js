import { reactive } from '@jetjo/vue3/reactive'
import { effect } from '@jetjo/vue3/effect'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.myHasArrowThis = (...args) => {
      return this.has(...args)
    }
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.myHasArrowThis(11), 'myState.has(1)')
  },
  { queueJob: false }
)

myState.add(11)
myState.delete(11)

globalThis.TEST__ = {
  MySet,
  myRaw
}
