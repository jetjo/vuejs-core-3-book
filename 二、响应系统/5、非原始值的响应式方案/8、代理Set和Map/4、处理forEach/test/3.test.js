import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

// prettier-ignore
const p = reactive(new Map([
  ['key', 1]
]))

effect(() => {
  p.forEach((value, key) => {
    // 与Set的forEach不同, Set的forEach中value和key是一个意思,都是Set中的值,可以看作是依赖于`ITERATE_KEY`
    // 而在Map的forEach中, value和key是不同的, value是Map中的值, key是Map中的键
    // 即然不仅能遍历到key,也能遍历到值
    // ,换句话说,是不仅依赖于key的增删,也依赖于value的变化
    console.log(value)
  })
})

p.set('key', 2)
