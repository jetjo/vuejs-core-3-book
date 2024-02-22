export default {
  name: 'Com3',
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
      children: `Com3的文本内容: ${this.foo}`
    }
  }
}
