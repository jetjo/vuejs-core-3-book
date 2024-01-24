import { reactive } from '@jetjo/vue3/reactive'
import { effect } from '@jetjo/vue3/effect'
import { it } from 'vitest'

const raw = [{}, {}]

const includesCallThis = []

raw.includes = function () {
  //   console.log(this === raw)
  includesCallThis.push(this)
  // NOTE: 返回false,导致includes被调用了两次,
  // 但是,,,为什么两次的this都是raw,
  // 不应该有一次的this是state吗???
  return false
}
const state = reactive(raw)

effect(() => {
  console.log(state.includes(state[0]))
})

it('两次对includes的调用都是在raw上调用的', () => {
  expect(includesCallThis.length).toBe(2)
  expect(includesCallThis[0]).toBe(raw)
  expect(includesCallThis[1]).toBe(raw)
})
