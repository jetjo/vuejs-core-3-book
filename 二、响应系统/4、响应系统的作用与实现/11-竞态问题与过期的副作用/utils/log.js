let isDev, isTest
let _LogLevel

// __DEV__是被打包工具rollup.js或webpack预定义的
if (typeof __DEV__ !== 'undefined') {
  isDev = __DEV__ === 'development' || __DEV__ == 'true'
  // isTest = __DEV__ === 'test'
}

// TypeError: Cannot read properties of undefined (reading 'NODE_ENV')
// 如果在vite启动前读取vite.config.js时,导入此模块,则import.meta.env.NODE_ENV为undefined
if (typeof import.meta.env === 'object') {
  isDev = import.meta.env.DEV // === 'development'
  // isTest = import.meta.env.MODE === 'test'
  // isDev && console.log({ importEnv: import.meta.env })
  isTest =
    import.meta.env.TEST === 'true' ||
    import.meta.env.MODE === 'test' ||
    import.meta.env.VITEST === 'true' ||
    import.meta.env.NODE_ENV === 'test'
}

{
  importEnv: {
    BASE_URL: '/'
    DEV: '1'
    PROD: ''
    npm_node_execpath: '/app/node/21.6.1/bin/node'
    npm_config_user_agent: 'pnpm/8.15.1 npm/? node/v21.6.1 darwin arm64'
    HOME: '~'
    NODENV_VERSION: 'system'
    TMPDIR: '/var/folders/gf/rz8587250k57tykr6twsp6dh0000gn/T/'
    npm_package_name: '@jetjo/vue3-chapter3'
    npm_execpath: '/app/pnpm/8.15.1/libexec/bin/pnpm.cjs'
    VITEST: 'true'
    USER: 'xxx'
    PNPM_SCRIPT_SRC_DIR: '/xxx/project/vuejs-core-3-book/三、渲染器'
    NODE_PATH: '/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vitest@1.2.2_@vitest+ui@1.2.2_jsdom@24.0.0_sass@1.69.7/node_modules/vitest/node_modules:/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vitest@1.2.2_@vitest+ui@1.2.2_jsdom@24.0.0_sass@1.69.7/node_modules:/xxx/project/vuejs-core-3-book/node_modules/.pnpm/node_modules'
    SSR: ''
    NODE: '/app/node/21.6.1/bin/node'
    NODE_ENV: 'test'
    NODENV_SHELL: 'zsh'
    PNPM_HOME: '/xxx/Library/pnpm'
    NODENV_ROOT: '/xxx/.nodenv'
    MODE: 'test'
    NODE_OPTIONS: '--experimental-import-meta-resolve --experimental-json-modules --conditions=verify'
    VITEST_MODE: 'RUN'
    PWD: '/xxx/project/vuejs-core-3-book/三、渲染器'
    TEST: 'true'
  }
}

{
  processEnv: {
    NODE: '/app/node/21.6.1/bin/node'
    NODENV_DIR: '/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vite@5.1.1_sass@1.69.7/node_modules/vite/bin'
    TMPDIR: '/var/folders/gf/rz8587250k57tykr6twsp6dh0000gn/T/'
    NODE_OPTIONS: '--experimental-import-meta-resolve --experimental-json-modules --conditions=verify'
    USER: 'xxx'
    PNPM_SCRIPT_SRC_DIR: '/xxx/project/vuejs-core-3-book/三、渲染器'
    npm_execpath: '/app/pnpm/8.15.1/libexec/bin/pnpm.cjs'
    npm_command: 'run-script'
    PWD: '/xxx/project/vuejs-core-3-book/三、渲染器'
    npm_package_name: '@jetjo/vue3-chapter3'
    LANG: 'zh_CN.UTF-8'
    NODE_PATH: '/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vite@5.1.1_sass@1.69.7/node_modules/vite/bin/node_modules:/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vite@5.1.1_sass@1.69.7/node_modules/vite/node_modules:/xxx/project/vuejs-core-3-book/node_modules/.pnpm/vite@5.1.1_sass@1.69.7/node_modules:/xxx/project/vuejs-core-3-book/node_modules/.pnpm/node_modules'
    HOME: '~'
    LOGNAME: 'xxx'
    LC_CTYPE: 'UTF-8'
    NODENV_VERSION: 'system'
    npm_config_user_agent: 'pnpm/8.15.1 npm/? node/v21.6.1 darwin arm64'
    npm_node_execpath: '/app/node/21.6.1/bin/node'
    NODE_ENV: 'development'
  }
}

isTest ||= !!import.meta.vitest

if (typeof process === 'object' && typeof process.env == 'object') {
  isDev = process.env.NODE_ENV === 'development'
  // isTest = process.env.NODE_ENV === 'test'
  // isDev && console.log({ processEnv: process.env })
}

// console.warn({ isDev, isTest })

const logBrand = 'v3book'

let _logToken = '' //'getSetTrap 5-6' // 'getReactive 5-6' // 'getOwnKeysTrap 5-6' //'getHasTrap 5-6' // 'getGetTrap 5-6' // 'getDeleteTrap 5-6' // 'createReactive 5-6'

function log(...messages) {
  if (isTest || messages[0] !== _logToken) return
  if (_LogLevel === 'warn' || _LogLevel === 'error' || _LogLevel === 'none')
    return
  console.log(`[${logBrand}]`, ...messages)
}

function warn(...messages) {
  if (_LogLevel === 'error' || _LogLevel === 'none') return
  console.warn(`[${logBrand}]`, ...messages)
}

function errorLog(isThrow = true, ...messages) {
  if (isThrow) throw new Error(messages.join())
  if (_LogLevel === 'none') return
  console.error(`[${logBrand}]`, ...messages)
}

function error(...messages) {
  errorLog(false, ...messages)
}

function throwErr(...messages) {
  errorLog(true, ...messages)
}

function disableLog(logLevel) {
  _LogLevel = logLevel
}

export { warn, throwErr, error, disableLog, log }
