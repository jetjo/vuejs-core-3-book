<template>
  <div>
  <pre>
例如: <code>{{ htmlFragment }}</code>
对应DOM节点并没有一个class属性, 而是有一个className属性与class attr对应,
值为{{ className }}.
另外DOM节点还有一个classList的类数组属性,也由class attr初始化,
值为{{ JSON.stringify(classList) }}</pre>
    <div v-html="htmlFragment" style="visibility: hidden"></div>
  </div>
</template>

<script setup>
import { reactive, watchEffect, ref } from '#vue/c'
import useElement from './useElement.js'

const { getInitVal } = useElement('[exa-3-btn]')

const htmlFragment = /* html */ `<button exa-3-btn class='button button_large'></button>`

const className = ref('')
const classList = ref()

watchEffect(
  () => {
    className.value = getInitVal('className')
    classList.value = getInitVal('classList')
  },
  { flush: 'post' }
)
</script>
