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
      '**/node_modules/**',
      '_*/**',
      '**/*tmp/**',
      '**/*bak/**',
      '**/*test/**',
      '**/test/**',
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

// const toPath = url => fileURLToPath(new URL(url, import.meta.url))

export default defineProject({
  resolve: {
    // alias
  },
  ...vitestConfig
})
