<template>
  <nav>
    <ul>
      <li><a href="#/concept">HTML Attributes与DOM Properties的概念</a></li>
      <li>
        <h3>HTML Attributes与DOM Properties之间的关系:</h3>
        <ul style="list-style: 1">
          <li>
            <a href="#/exa1"> 有的Attr有唯一与之对应的同名的Prop </a>
          </li>
          <li>
            <a href="#/exa2">有的Attr有多个与之对应的Prop</a>
          </li>
          <li>
            <a href="#/exa3">
              有的Attr有一个与之对应的Prop,
              但名称不同,也可能存在其他与之关联的Prop
            </a>
          </li>
          <li>
            <a href="#/exa4"
              >有的Attr没有与之对应的Prop, 可能存在与之关联的Prop,
              在有标签支持此Attr的情况下.</a
            >
          </li>
          <li>
            并且也不是所有DOM Property都与HTML Attribute有关联, 例如:
            <a
              href="//developer.mozilla.org/en-US/docs/Web/API/Node/textContent"
              >Node的textContent属性</a
            >,其值取决于标签的子节点.
          </li>
        </ul>
        <p><a href='#/summarize'>综述...</a></p>
      </li>
    </ul>
  </nav>
  <KeepAlive>
    <component :is="curCom" />
  </KeepAlive>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from '#vue/c'
import Concept from './Concept.vue'

const routes = {
  '/': Concept,
  '/concept': Concept,
  '/exa1': defineAsyncComponent(() => import('./Exa.1.vue')),
  '/exa2': defineAsyncComponent(() => import('./Exa.2.vue')),
  '/exa3': defineAsyncComponent(() => import('./Exa.3.vue')),
  '/exa4': defineAsyncComponent(() => import('./Exa.4.vue')),
  '/mark1': defineAsyncComponent(() => import('./Mark.1.vue')),
  '/summarize': defineAsyncComponent(() => import('./Summarize.vue'))
}

const hash = ref(window.location.hash)
const curCom = computed(() => {
  return routes[`${hash.value.slice(1) || '/'}`] || Concept
})

window.addEventListener('hashchange', () => {
  hash.value = window.location.hash
})
</script>
