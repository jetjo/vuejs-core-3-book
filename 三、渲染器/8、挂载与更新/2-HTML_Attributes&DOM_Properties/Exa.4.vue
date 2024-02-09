<template>
  <div>
    <pre>
例如: <code>{{ htmlFragment }}</code>
对应DOM节点并没有一个`ariaValueNow`属性, 而是有一个`ariaAttributes`属性与class attr关联,
<mark>值为: {{ JSON.stringify(ariaAttributes) }}</mark>.
`ariaAttributes`是一个对象,有一个`aria-valuenow`的属性.</pre>
    <div v-html="htmlFragment" style="visibility: hidden"></div>
  </div>
</template>

<script setup>
import { reactive, watchEffect, ref } from '#vue/c'
import useElement from './useElement.js'

const { getInitVal } = useElement('[exa-4-div]')

const htmlFragment = /* html */ `<div exa-4-div aria-valuenow='77' aria-valuetext='suc'></div>`

const ariaAttributes = ref()

watchEffect(
  () => {
    ariaAttributes.value = getInitVal('ariaAttributes')
    if (ariaAttributes.value === undefined) {
      alert('书上有误!')
      ariaAttributes.value = {
        'aria-valuenow': getInitVal('ariaValueNow'),
        'aria-valuetext': getInitVal('ariaValueText')
      }
    }
  },
  { flush: 'post' }
)
</script>
