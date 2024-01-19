/// <reference types="vitest" />
/// <reference types="vitest/config" />

import { defineProject } from 'vitest/config'
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
    // 包括inline test code block
    includeSource: ['src/**/*.{js,ts}'],
    snapshotFormat: {
      // https://vitest.dev/guide/snapshot.html#_2-printbasicprototype-is-default-to-false
      printBasicPrototype: false
    }
  }
}

export default defineProject({
  plugins: [vue()],
  resolve: {
    alias: {
      '@src': '../src',
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  ...vitestConfig
})
