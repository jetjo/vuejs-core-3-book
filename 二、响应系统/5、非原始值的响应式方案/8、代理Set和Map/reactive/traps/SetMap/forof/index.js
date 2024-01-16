import { withRecordTrapOption } from '../../../../../../reactive/_traps/option'

function factory({ isShallow, isReadonly }) {
  const res = Object.create(null)
  if (!isReadonly && !isShallow) {
    Object.defineProperty(res, Symbol.iterator, {
      value() {
        const entries = []
        this.forEach((value, key) => {
          entries.push([key, value])
        })
        let index = 0
        return {
          __proto__: null,
          // 可迭代协议
          [Symbol.iterator]() {
            // NOTE: 解决(for e of state.entries)抛出的如下错误:
            // TypeError: p.entries is not a function or its return value is not iterable
            return this
          },
          // 迭代器协议
          next() {
            if (index === entries.length) {
              return { done: true }
            }
            const value = entries[index++]
            return { value, done: false }
          }
        }
      },
      enumerable: true
    })
    res.entries = res[Symbol.iterator]
    return res
  }
}

export default function ({ isShallow, isReadonly, version }) {
  return withRecordTrapOption({
    factory,
    version,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    factoryName: 'getSetMapPrototypeIterator'
  })
}
