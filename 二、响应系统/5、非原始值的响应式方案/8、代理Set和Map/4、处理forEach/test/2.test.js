import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

const key = { key: 1 }
const value = new Set([1, 2, 3])

// prettier-ignore
const p = reactive(new Map([
  [key, value]
]))

effect(() => {
  p.forEach((value, key) => {
    console.log(value.size)
  })
})

p.get(key).delete(1)
