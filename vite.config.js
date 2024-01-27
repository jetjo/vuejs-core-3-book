/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
    exclude: [
      '**/node_modules/**',
      '_*/**',
      '**/*tmp/**',
      '**/*bak/**',
      '**/*test/**',
      '**/test/**'
    ],
    // 包括inline test code block
    includeSource: ['src/**/*.{js,ts}'],
    coverage: {
      enabled: false,
      // provider: "istanbul",
      provider: 'v8',
      // default报告器用于在终端中实时查看测试结果
      reporter: ['text', 'json', 'html', 'clover'],
      reportsDirectory: './tests/unit/coverage'
    },
    snapshotFormat: {
      // https://vitest.dev/guide/snapshot.html#_2-printbasicprototype-is-default-to-false
      printBasicPrototype: false
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // 生产环境下有助于打包器清除无效代码
    'import.meta.vitest': 'undefined'
  },
  plugins: [vue()],
  resolve: {
    alias: {
      // '#': fileURLToPath(new URL('./src', import.meta.url)),
      '@jetjo/vue3/ref/*.js': './vue3/reactive/ref/*.js',
      '@jetjo/vue3/reactive/*.js': './vue3/reactive/*.js',
      '@jetjo/vue3/effect/*.js': './vue3/effect/*.js',
      '@jetjo/vue3/computed/*.js': './vue3/computed/*.js',
      '@jetjo/vue3/watch/*.js': './vue3/watch/*.js',
      '@jetjo/vue3/ref/*': './vue3/reactive/ref/*.js',
      '@jetjo/vue3/reactive/*': './vue3/reactive/*.js',
      '@jetjo/vue3/effect/*': './vue3/effect/*.js',
      '@jetjo/vue3/computed/*': './vue3/computed/*.js',
      '@jetjo/vue3/watch/*': './vue3/watch/*.js',
      '@jetjo/vue3/ref': './vue3/reactive/ref/6-1.js',
      '@jetjo/vue3/reactive': './vue3/reactive/5-8.js',
      '@jetjo/vue3/effect': './vue3/effect/4-11.js',
      '@jetjo/vue3/computed': './vue3/computed/4-11.js',
      '@jetjo/vue3/watch': './vue3/watch/4-11.js'
    }
  },
  ...vitestConfig
})
