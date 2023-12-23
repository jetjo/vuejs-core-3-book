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

export default arrayStackMethods
// export {arrayProto as changeLensProto}
