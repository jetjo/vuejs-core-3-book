import { configDefaults, defineConfig } from 'vitest/config'

/** @type {import('vitest').UserWorkspaceConfig} */
const vitestConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    fileParallelism: false,
    // 会在每个测试文件前都运行
    // setupFiles: ['./vitest.setup.js'],
    // globalSetup: ['./vitest.setup.js'],
    unstubAllEnvs: true,
    // outputFile: {
    // 	html: './test/__vitest__/index.html',
    // },
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      '**/node_modules/**',
      '_*/**',
      '**/*tmp/**',
      '**/*bak/**',
      '**/*test/**',
      '**/test/**',
      ...configDefaults.exclude
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

export default vitestConfig

/** @type {import('vitest').UserWorkspaceConfig} */
const vitestConfig3 = {
  test: {
    globals: true,
    environment: 'jsdom',
    // 会在每个测试文件前都运行
    // setupFiles: ['./vitest.setup.js'],
    // globalSetup: ['./vitest.setup.js'],
    // @ts-ignore
    unstubAllEnvs: true,
    // outputFile: {
    // 	html: './test/__vitest__/index.html',
    // },
    // 包括inline test code block
    // includeSource: ['src/**/*.{js,ts}'],
    // //NOTE: 无效
    coverage: {
      enable: false
    },
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
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

/** @type {import('vitest').UserWorkspaceConfig} */
const vitestConfig2 = {
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
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
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
