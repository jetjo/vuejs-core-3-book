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
    includeSource: ['src/**/*.{js,ts}'],
    coverage: {
      enabled: true,
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

const alias = {
  '@reactive': fileURLToPath(new URL('../reactive', import.meta.url)),
  '@computed': fileURLToPath(new URL('../computed', import.meta.url)),
  '@effect': fileURLToPath(new URL('../effect', import.meta.url)),
  '@utils': fileURLToPath(new URL('../utils', import.meta.url)),
  '@watch': fileURLToPath(new URL('../watch', import.meta.url))
}

console.warn(alias)

export default defineProject({
  resolve: {
    alias
  },
  ...vitestConfig
})
