class MyClass {
  instancePropertyOwn = 'instancePropertyOwn'

  get instanceGetterOnProto() {
    return this.name || 'instanceGetterOnProto'
  }
}

const myClass = new MyClass()
console.log(myClass)
console.log(Object.hasOwn(myClass, 'instancePropertyOwn'))
console.log(Object.hasOwn(myClass, 'instanceGetterOnProto'))

console.log(Object.hasOwn(MyClass.prototype, 'instancePropertyOwn'))
console.log(Object.hasOwn(MyClass.prototype, 'instanceGetterOnProto'))
console.log(Object.hasOwn(MyClass.prototype, 'constructor'))

console.log(MyClass.prototype.constructor === MyClass)

console.log(Reflect.get(myClass, 'instanceGetterOnProto', { name: '刘亦菲' }))
console.log(
  Reflect.get(MyClass.prototype, 'instanceGetterOnProto', { name: '刘亦菲' })
)

export {}
