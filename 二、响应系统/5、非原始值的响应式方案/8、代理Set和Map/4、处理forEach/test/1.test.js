import { createReactive } from '../../../../reactive/api/5-8.js'
import { effect } from '../../../../effect/index/4-11.js'

const reactive = createReactive()()

// prettier-ignore
const p = reactive(new Map([
  [{ key: 1 }, { value: 1 }]
]))

effect(() => {
  p.forEach((key, value) => {
    console.log(key)
    console.log(value)
  })
})

p.set({ key: 2 }, { value: 2 })
