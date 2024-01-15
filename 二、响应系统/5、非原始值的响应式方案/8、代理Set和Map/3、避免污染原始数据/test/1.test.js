import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

const p = reactive(new Map([['key', 1]]))

effect(() => {
  console.log(p.get('key'))
})

p.set('key', 2) // 触发响应
