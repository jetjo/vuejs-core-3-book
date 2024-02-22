interface O<T> {
    create: () => T
}

interface F<T> {
    (o: O<T>): R<T>
}

interface N<T> {
    el?: T
}

interface R<T> {
    render: (n: N<T>) => void
}

function factory<T>(o:O<T>): R<T> {
    return {
        render: (n: N<T>) => {
            n.el = o.create()
        }
    }
}

const o: O<string> = {
    create: () => 'hello'
}

const o1 : O<number> = {
    create: () => 1
}

const r = factory(o)

const r1 = factory(o1)

r1.render({el: 1})

r.render({el: '0'})

const f = factory

export {}
