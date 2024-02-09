<template>
  <!-- <p>HTML Attributes 与 DOM Properties是两码事, 是两个有一定关联的概念</p> -->
  <div>
    <h3>
      HTML Attributes, 一个目的是用作某(几)个DOM Property的初始值,
      即用来初始化对应DOM节点的状态;
    </h3>
    <pre>例如: <code>{{ htmlFragment }}</code>,
    <code>{{ attrValue }}</code>就作为对应DOM节点的属性<code>value,defaultValue</code>的初始值;</pre>
    其在页面渲染为如下的输入框:
    <p v-html="htmlFragment"></p>
    其对应的DOM节点对象有如下两个属性:
    <ul>
      <li>value, 初始值是{{ valueInitial }}; 当前值为{{ value }}.</li>
      <li>defaultValue, 值为{{ defaultValue }}, 此属性应该是只读的.</li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, watchEffect, ref } from '#vue/c'
import useElement from './useElement.js'

const { getInitVal, getVal, getAttrVal } = useElement('[input-1]')

const htmlFragment = /* html */ `<input input-1 value='hello'>`

const attrValue = ref('')
const valueInitial = ref('')
const value = ref('')
const defaultValue = ref('')

watchEffect(
  () => {
    attrValue.value = getAttrVal('value')
    valueInitial.value = getInitVal('value')
    value.value = getVal('value', 'input')
    defaultValue.value = getInitVal('defaultValue')
  },
  { flush: 'post' }
)
</script>
