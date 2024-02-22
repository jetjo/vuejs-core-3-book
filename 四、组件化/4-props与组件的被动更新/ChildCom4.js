export default {
  name: 'ChildCom4',
  data() {
    return {}
  },
  props: {
    foo: {
      type: String
      // default: 'bar'
    }
  },
  // @ts-ignore
  render() {
    return {
      type: 'div',
      // @ts-ignore
      children: `ChildCom4的文本内容: ${this.foo}`
    }
  }
}
