import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

// prettier-ignore
const p = reactive(new Set([
  ['key1', 1],
  ['key2', 2],
]))

effect(() => {
  for (const [key, value] of p) {
    console.log(key, value.length)
  }
})

const item3 = reactive(['key3', 3])
setTimeout(() => {
  p.add(item3)
}, 0)

setTimeout(() => {
  item3.push(2)
}, 0)
