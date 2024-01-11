import { reactive } from '../../tmp/index.js'
import { effect } from '../../../7、代理数组/effect/index.js'

class MySet extends Set {
  constructor() {
    super(...arguments)
    this.clear = {
      // // NOTE: 省略了`function`关键字的函数,自身没有`prototype`,因此不能被`new`调用, 这一点与箭头函数相同;
      // // 但是,,,这种形式的函数中的this还是不定的,这一点又与普通的函数一样;
      // // 许多内建的全局函数就是这种情况,比如`parseInt`和`eval`;
      // // 对其调用`Function.prototype.toString`反编译获取其字符串形式,形如`f () {}`,虽然与
      // // 普通函数一样以`f`开头,但其`prototype`却是undefined;
      // _clear() {
      //   console.log(this, 'this')
      //   // TypeError: (intermediate value).clear is not a function
      //   return super.clear()
      //   // TypeError: Cannot read properties of undefined (reading 'call')
      //   return super.clear.call(this)
      // }
      _clear: () => {
        // 这里的this不会随调用方式改变,因为箭头函数的this是词法作用域的;
        // 在这里this是MySet的实例
        console.log(this, 'this')
        // TypeError: (intermediate value).clear is not a function
        return super.clear.call(this)
      }
    }._clear
  }
}

const myRaw = new MySet([1, 2, 3])
const myState = reactive(myRaw)

effect(
  () => {
    console.log(myState.has(1), 'myState.has(1)')
  },
  { queueJob: false }
)

myState.clear()

globalThis.TEST__ = {
  MySet,
  myRaw
}
