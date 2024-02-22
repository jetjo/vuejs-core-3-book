export default {
  name: 'Com2',
  data() {
    return {
      foo: 'bar'
    }
  },
  // @ts-ignore
  render() {
    return {
      type: 'div',
      // @ts-ignore
      children: `Com2的文本内容: ${this.foo}`
    }
  }
}
