/**@type {{
 * name: FindsName;
 * }[]} */
const arrayFindMethods = [
  {
    name: 'indexOf',
    isInvalidRes: res => res === -1,
    protoImpl: Array.prototype.indexOf
  },
  {
    name: 'lastIndexOf',
    isInvalidRes: res => res === -1,
    protoImpl: Array.prototype.lastIndexOf
  },
  {
    name: 'includes',
    isInvalidRes: res => res !== true,
    protoImpl: Array.prototype.includes
  }
]

// const arrayProto = {
//   indexOf: Array.prototype.indexOf,
//   lastIndexOf: Array.prototype.lastIndexOf,
//   includes: Array.prototype.includes
// }

/**@typedef {{
 * indexOf: (...args: any[]) => any;
 * lastIndexOf: (...args: any[]) => any;
 * includes: (...args: any[]) => any;
 * }} FindsType */
/**@typedef {keyof FindsType} FindsName */

export default arrayFindMethods

// export { arrayProto as findsProto }
