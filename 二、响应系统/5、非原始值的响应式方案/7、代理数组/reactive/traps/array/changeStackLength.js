import {
  log,
  warn
} from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/utils/log.js'
import { ACT_AS_ARRAY_FLAG } from './convention.js'

/**@type {{
 * name: ChangeLensName;
 * }[]} */
const arrayStackMethods = [
  {
    name: 'push',
    protoImpl: Array.prototype.push
  },
  {
    name: 'pop',
    protoImpl: Array.prototype.pop
  },
  {
    name: 'shift',
    protoImpl: Array.prototype.shift
  },
  {
    name: 'unshift',
    protoImpl: Array.prototype.unshift
  },
  {
    name: 'splice',
    protoImpl: Array.prototype.splice
  }
]

// const arrayProto = {
//   push: Array.prototype.push,
//   pop: Array.prototype.pop,
//   shift: Array.prototype.shift,
//   unshift: Array.prototype.unshift,
//   splice: Array.prototype.splice
// }

/**@typedef {{
 * push: (...args: any[]) => any;
 * pop: (...args: any[]) => any;
 * shift: (...args: any[]) => any;
 * unshift: (...args: any[]) => any;
 * splice: (...args: any[]) => any;
 * }} ChangeLensType */
/**@typedef {keyof ChangeLensType} ChangeLensName */

// setTimeout(() => {
//   arrayStackMethods.forEach(({ name, protoImpl }) => {
//     // return
//     // 下面的做法与`vuetify`库冲突
//     if (Object.prototype[name] !== undefined) {
//       warn(
//         `Object.prototype.${name} is already defined.`,
//         Object.prototype[name]
//       )
//       return
//     }
//     Object.prototype[name] = function (...args) {
//       this[ACT_AS_ARRAY_FLAG] = true
//       const res = protoImpl.apply(this, args)
//       // delete this[ACT_AS_ARRAY_FLAG]
//       return res
//     }
//   })
// }, 0)

export default arrayStackMethods
// export {arrayProto as changeLensProto}
