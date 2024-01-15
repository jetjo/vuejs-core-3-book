import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

const m = new Map()
const p1 = reactive(m)
const p2 = reactive(new Map())

p1.set('p2', p2)

effect(() => {
  // 通过原始数据m访问size,不应该收集依赖
  console.log(m.get('p2').size, 'effect')
})

m.get('p2').set('key', 1) // 通过原始数据m调用set不应该触发响应

console.log(p1)
