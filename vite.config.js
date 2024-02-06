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
  appType: 'mpa',
  define: {
    // 生产环境下有助于打包器清除无效代码
    'import.meta.vitest': 'undefined'
  },
  plugins: [vue()],
  resolve: {
    // 在preserveSymlinks为默认false时,
    // dev mode下,如果浏览器访问的地址对应的物理路径是个软连接,
    // 并且在(软连接对应的)源物理路径所对应的url还没有被加载(浏览器访问)的前提下, 会报错
    // NOTE: No matching HTML proxy module found from /Users/loong/project/vuejs-core-3-book/三、渲染器/7、渲染器的设计/1-与响应式系统的结合/index.html?html-proxy&index=0.js
    preserveSymlinks: true,
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
    },
    exclude: [
      '**/node_modules/**',
      '_*/**',
      '**/*tmp/**',
      '**/*bak/**',
      '**/*test/**',
      '**/test/**',
      '**/_test/**'
    ]
  },
  ...vitestConfig
})
