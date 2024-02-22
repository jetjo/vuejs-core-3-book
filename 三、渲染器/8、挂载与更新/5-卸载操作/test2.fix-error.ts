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

interface R<E> {
  render<T>(n: N<E, T>): void
}

const f = function <E>(o: O<E>): R<E> {
  return {
    render: <T>(n: N<E, T>) => {
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
