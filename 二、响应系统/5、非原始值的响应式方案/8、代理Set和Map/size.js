// import { reactive } from '../7、代理数组/reactive/index.js'
import { reactive } from './reactive/index.js'
import { effect } from '../7、代理数组/effect/index.js'

const rawSet = new Set([1, 2, 3])
const rawMap = new Map([
  [1, 2],
  [1, 2]
])

const set = reactive(rawSet)
const map = reactive(rawMap)

effect(() => {
  console.log(set.size, 'effect1, set') // TypeError: Method get Set.prototype.size called on incompatible receiver
  console.log(map.size, 'effect1, map') // TypeError: Method get Map.prototype.size called on incompatible receiver
})
