<template>
  <div></div>
</template>

<script setup>
import { proxyRefs, ref, reactive } from '#vue'
import { warn } from '#utils'

function useJustReturnSomething() {
  const counter = ref(0)
  const state = reactive({})
  const rawVal = 0

  return { counter, state, rawVal }
}

const someStates = useJustReturnSomething()

const rawVal = 0

warn(someStates, 'someStates')

// NOTE: 测试知,setup语法糖中声明和导入的一切对象都会被放入一个对象中, 然后调用proxyRefs函数
</script>

<style lang="scss" scoped></style>
