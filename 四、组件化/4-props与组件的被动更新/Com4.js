import ChildCom4 from './ChildCom4'

export default {
  name: 'Com4',
  data() {
    return {
      foo: 'bar'
    }
  },
  // @ts-ignore
  render() {
    return {
      type: 'div',
      children: [
        {
          type: ChildCom4,
          key: 1,
          props: {
            // @ts-ignore
            foo: this.foo
          }
        }
      ]
    }
  }
}
