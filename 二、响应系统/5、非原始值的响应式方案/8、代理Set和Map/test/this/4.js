import { reactive } from '../../tmp/index.js'
import { effect } from '../../../7、代理数组/effect/index.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.has = super.has.bind(this)
    // 使用vue的响应式api测试,
    // 发现,vue并没有覆盖这个自定义的has
    // 但是,尽管这个自定义的has没有任何依赖
    // 但是把调用has时的参数从set中移除或加入到set中时,
    // 仍然会触发effect
    // this.has = () => false
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
