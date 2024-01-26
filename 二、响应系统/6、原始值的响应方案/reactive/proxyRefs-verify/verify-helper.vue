<template>
  <div></div>
</template>

<script setup>
import { useJustReturnSomething } from './useJustReturnSomething.js'
import { proxyRefs } from 'vue'
import { warn } from '#utils'

const someStates = useJustReturnSomething()

const rawVal = 0

warn(someStates, 'someStates')

// NOTE: 测试知,setup语法糖中声明和导入的一切对象都会被放入一个对象中, 然后调用proxyRefs函数
</script>

<style lang="scss" scoped></style>
