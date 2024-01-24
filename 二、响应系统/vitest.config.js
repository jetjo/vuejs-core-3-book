/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineProject } from 'vitest/config'

/** @type {import('vitest').UserWorkspaceConfig} */
const vitestConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    // 会在每个测试文件前都运行
    // setupFiles: ['./vitest.setup.js'],
    // globalSetup: ['./vitest.setup.js'],
    unstubAllEnvs: true,
    // outputFile: {
    // 	html: './test/__vitest__/index.html',
    // },
    // 包括inline test code block
    // includeSource: ['src/**/*.{js,ts}'],
    // //NOTE: 无效
    // coverage: {
    //   enable: false
    // },
    exclude: [
      '_*/**',
      '**/*tmp/**',
      '**/*bak/**',
      '**/*test/**',
      '**/*.bak',
      '**/*.tmp',
      '**/*.test'
    ],
    snapshotFormat: {
      // https://vitest.dev/guide/snapshot.html#_2-printbasicprototype-is-default-to-false
      printBasicPrototype: false
    }
  }
}

const toPath = url => fileURLToPath(new URL(url, import.meta.url))

const alias = {
  // '#': toPath('../src'),
  '@jetjo/vue3/ref-utils': '../vue3/reactive/ref/helper.js',
  '@jetjo/vue3/ref/*.js': '../vue3/reactive/ref/*.js',
  '@jetjo/vue3/reactive/*.js': '../vue3/reactive/*.js',
  '@jetjo/vue3/effect/*.js': '../vue3/effect/*.js',
  '@jetjo/vue3/computed/*.js': '../vue3/computed/*.js',
  '@jetjo/vue3/watch/*.js': '../vue3/watch/*.js',
  '@jetjo/vue3/ref/*': '../vue3/reactive/ref/*.js',
  '@jetjo/vue3/reactive/*': '../vue3/reactive/*.js',
  '@jetjo/vue3/effect/*': '../vue3/effect/*.js',
  '@jetjo/vue3/computed/*': '../vue3/computed/*.js',
  '@jetjo/vue3/watch/*': '../vue3/watch/*.js',
  '@jetjo/vue3/ref': '../vue3/reactive/ref/6-1.js',
  '@jetjo/vue3/reactive': '../vue3/reactive/5-8.js',
  '@jetjo/vue3/effect': '../vue3/effect/4-11.js',
  '@jetjo/vue3/computed': '../vue3/computed/4-11.js',
  '@jetjo/vue3/watch': '../vue3/watch/4-11.js',
  vue: 'vue/dist/vue.esm-bundler.js'
}

console.warn(alias)

export default defineProject({
  resolve: {
    alias
  },
  ...vitestConfig
})
