<template>
  <p>HTML Attributes 与 DOM Properties是两码事, 是两个有一定关联的概念</p>
  <div>
    HTML Attributes, 一个目的是用作某(几)个DOM Property的初始值; <br />
    <p>
      例如: <code>{{ inputHTML1 }}</code> , 其中, <code>value='hello'</code>的
      <code>hello</code> 就作为渲染的节点的value和defaultValue属性的初始值;
    </p>
    其在页面渲染为如下的输入框:
    <p v-html="inputHTML1"></p>
    其对应的DOM节点有如下两个属性:
    <ul>
      <li>
        value, 初始值是 {{ getInitVal('[input-1]', 'value') }};
        <div>值为{{ getVal('[input-1]', 'value', 'input') }}</div>
      </li>
      <li>
        defaultValue, 固定值为{{ getInitVal('[input-1]', 'defaultValue') }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { reactive } from '#vue'

const inputHTML1 = /* html */ `<input input-1 value='hello'>`

function getEle(css, doWithEle) {
  const eleLen = document.querySelectorAll(css).length
  if (eleLen !== 1) {
    console.error(`There are ${eleLen} elements with css ${css}`)
    return
  }
  const ele = document.querySelector(css)
  if (doWithEle) doWithEle(ele)
  return ele
}

const map = reactive(new Map())

function getInitVal(css, prop, key) {
  key = key || `${css}\`s initial ${prop}`
  const initVal = map.get(key)
  if (initVal !== undefined) return initVal
  window.requestAnimationFrame(() => {
    getEle(css, ele => {
      map.set(key, ele[prop])
    })
  })
}

const eventMap = new WeakSet()
// const eventMap = new WeakMap()
function getVal(css, prop, event) {
  const key = `${css}\`s ${prop} on ${event}`
  window.requestAnimationFrame(() => {
    getEle(css, ele => {
      if (eventMap.has(ele)) {
        return
        if (eventMap.get(ele) === event) return
        ele.removeEventListener(event, eventMap.get(ele))
      }
      if (map.has(key)) {
        console.warn(`The css ${css} has a new instance node!`)
      }
      const handler = () => {
        map.set(key, ele[prop])
      }
      ele.addEventListener(event, handler)
      // eventMap.set(ele, event)
      eventMap.add(ele)
    })
  })
  return getInitVal(css, prop, key)
}
</script>


<style>
code {
  background-color: #f0f0f0;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 1.2em;
  /* color: #f00; */
  font-weight: bold;
  font-family: monospace;
}
</style>

