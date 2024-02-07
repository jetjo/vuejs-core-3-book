const proxy = new Proxy([], {
  get(target, key, receiver) {
    console.log('get key: ', key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log('set key: ', key)
    // return (target[key] = value)
    return Reflect.set(target, key, value, receiver)
  },
  defineProperty(target, key, descriptor) {
    console.log('defineProperty key: ', key)
    return Reflect.defineProperty(target, key, descriptor)
  },
  getOwnPropertyDescriptor(target, key) {
    console.log('getOwnPropertyDescriptor key: ', key)
    return Reflect.getOwnPropertyDescriptor(target, key)
  },
  getPrototypeOf(target) {
    console.log('getPrototypeOf')
    return Reflect.getPrototypeOf(target)
  },
  setPrototypeOf(target, prototype) {
    console.log('setPrototypeOf')
    return Reflect.setPrototypeOf(target, prototype)
  }
})

// // 调用[[GetPrototypeOf]]
// Object.getPrototypeOf(proxy)
// // 调用[[SetPrototypeOf]]
// Object.setPrototypeOf(proxy, null)
// // 依次调用[[Set]]、[[GetOwnProperty]]、[[DefineOwnProperty]]
proxy.name = 'liuyifei'
// // 调用[[DefineOwnProperty]]
// Object.defineProperty(proxy, 'name', { value: 'liuyifei' })
// // 调用[[Get]]
// proxy.name
// // 调用[[GetOwnProperty]]
// Object.getOwnPropertyDescriptor(proxy, 'name')

// // 控制台输出: file://./localhost-1704965032719.log
// proxy.splice(0, 0, '老婆', '刘亦菲')

export {}
