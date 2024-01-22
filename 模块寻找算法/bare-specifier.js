import { pick } from 'lodash-es'
import samePick from 'lodash-es/pick.js'
// NOTE: 只要不以 / 或者 ./ 或者 ../ 开头的模块路径，都被认为是 bare specifier
// import message from 'lodash-test/pick.js'
import message from './lodash-test/pick.js'

console.log(pick({ a: 1, b: 2 }, ['a']))
console.log(samePick({ a: 1, b: 2 }, ['b']))

console.log(message)
