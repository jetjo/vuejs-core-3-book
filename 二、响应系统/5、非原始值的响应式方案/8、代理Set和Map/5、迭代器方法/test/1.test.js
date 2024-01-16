import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

// prettier-ignore
const p = reactive(new Map([
  ['key1', 1],
  ['key2', 2],
]))

effect(() => {
  for (const [key, value] of p) {
    console.log(key, value)
  }
})

p.set('key3', 3)
