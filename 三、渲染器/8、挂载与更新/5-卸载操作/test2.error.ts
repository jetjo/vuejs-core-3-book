interface O<E> {
  create: () => E
}

// interface F<E, T = { [key: string]: any }> {
//   (o: O<E>): R<E, T>
// }

interface N<E, T = { [key: string]: any }> {
  el?: E
  props?: T
}

// NOTE: 使用下面的工厂函数`f`获取接口`R`的实现时, 
// 其中泛型参数`E`可以根据传入`f`的`o`的类型推断出来,
// 但是泛型参数`T`却无法根据传入`f`的`o`的类型推断出来,
// 就是说, `f`的返回的`R`的实现中的`T`还是无法确定的;
// 假如有另一个工厂函数`f2`也能返回`R`的实现,
// 那么这两个工厂函数返回的`R`的实现是不能互相赋值的,类型是不兼容的;
// 因为两个实现中的方法`render`需要的泛型参数`T`,
// 只有在`renderer`方法被调用时才能根据`n`确定,
// 所以将`T`作为`R`的泛型参数是不对的;
// 可以将`T`作为`render`方法的泛型参数: `render: <T>(n: N<E, T>) => void`
interface R<E, T = { [key: string]: any }> {
  render: (n: N<E, T>) => void
  hydrate?: (n: N<E, T>) => void
}

const f = function <E, T = { [key: string]: any }>(o: O<E>): R<E, T> {
  return {
    render: (n: N<E, T>) => {
      o.create()
    }
  }
}
// @ts-ignore
const _ = f

type FT = typeof f

const f2: FT = function (o) {
  const r = f(o)
  return r
  return {
    ...r,
    render: n => {
      o.create()
    }
  }
}

export {}
