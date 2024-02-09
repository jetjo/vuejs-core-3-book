<template>
  <div>
    <pre>例如: <code>{{ htmlFragment }}</code>,
<code>{{ attrTypeValue }}</code>不是合法的type,浏览器会忽略此值,并使用type的默认值<code>{{ type }}</code></pre>
    <div v-html="htmlFragment" style="visibility: hidden"></div>
  </div>
</template>

<script setup>
import { reactive, watchEffect, ref } from '#vue/c'
import useElement from './useElement.js'

const { getInitVal, getAttrVal } = useElement('[mark-1-input]')

const htmlFragment = /* html */ `<input mark-1-input type='foo'>`

const attrTypeValue = ref('')
const type = ref('')

watchEffect(
  () => {
    attrTypeValue.value = getAttrVal('type')
    type.value = getInitVal('type')
  },
  { flush: 'post' }
)
</script>
