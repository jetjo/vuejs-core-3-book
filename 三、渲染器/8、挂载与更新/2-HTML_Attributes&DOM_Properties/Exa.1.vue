<template>
  <div>
    <!-- <h3>有些HTML Attributes与DOM Properties是一一对应的.</h3>
    即渲染的DOM节点有一个与attr同名的属性. -->
    <pre>
例如: <code>{{ htmlFragment }}</code>
对应的DOM节点有一个id属性, 值为{{ id }}.</pre>
    <div v-html="htmlFragment"></div>
  </div>
</template>

<script setup>
import { watchEffect, ref } from '#vue/c'
import useElement from './useElement.js'

const { getInitVal } = useElement('#input-1')

const htmlFragment = /* html */ `<input hidden id='input-1'>`

const id = ref('')

watchEffect(
  () => {
    // @ts-ignore
    id.value = getInitVal('id')
  },
  { flush: 'post' }
)
</script>
