/// <reference types="vitest" />
/// <reference types="vitest/config" />
// import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  parseCustomConditions,
  parsePkgResolveConditionFrom
} from '@jetjo/vue3-chapter3/module-res-utils'

const conditionsOfTsConf = await parseCustomConditions({
  url: await import.meta.resolve('./jsconfig.json')
})

// console.warn('conditionsOfTsConf:', conditionsOfTsConf)
// console.warn('NODE_OPTIONS: ', process.env.NODE_OPTIONS)

const conditionsOfNodeCLI = parsePkgResolveConditionFrom(
  process.env.NODE_OPTIONS
)
// console.warn('conditionsOfNodeCLI: ', conditionsOfNodeCLI)

/**@type {string[]} */
const conditions = []
conditionsOfNodeCLI.forEach(c => {
  if (!conditionsOfTsConf.includes(c)) {
    console.warn(`conditionsOfNodeCLI: ${c} is not in conditionsOfTsConf`)
  }
  conditions.push(c)
})

// console.warn('conditions: ', conditions);

// vite-plugin-checker不识别jsconfig.json, 其默认会寻找tsconfig.json, 需要设置其checker的tsconfig字段

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'mpa',
  optimizeDeps: {
    entries: ['index.html', 'src/index.html']
  },
  define: {
    // 生产环境下有助于打包器清除无效代码
    'import.meta.vitest': 'undefined'
  },
  esbuild: {
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
  plugins: [vue()],
  resolve: {
    // dedupe: ['#vue', 'vue'],
    // 在preserveSymlinks为默认false时,
    // dev mode下,如果浏览器访问的地址对应的物理路径是个软连接,
    // 并且在(软连接对应的)源物理路径所对应的url还没有被加载(浏览器访问)的前提下, 会报错
    // NOTE: No matching HTML proxy module found from /Users/loong/project/vuejs-core-3-book/三、渲染器/7、渲染器的设计/1-与响应式系统的结合/index.html?html-proxy&index=0.js
    // 但是如果preserveSymlinks为true, 那么下面的情形又会报找不到包的错误:
    // // 文件`src/a.js`: import { b } from './b.js'
    // // 假如文件`src/tmp/a.js`是`src/a.js`的软连接,
    // // 但是`src/tmp`目录下却没有一个`b.js`作为`src/b.js`的软连接
    // // 那么当有其他文件引用`src/tmp/a.js`时, 会报找不到`./b.js`的错误
    // preserveSymlinks: true,
    alias: {
      vue: '#vue',
      // '#': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // // The default allowed conditions are: import, module, browser, default, and production/development based on current mode.
    // 如果不指定, 当通过`--conditions=xxx`给`nodejs`指定条件时, vite会报错:
    // [plugin:vite:import-analysis] No known conditions for "#vue-fixed/reactive" specifier in "@jetjo/vue3-chapter3" package
    // 换句话说, 就是`--conditions=xxx,yyy`,
    // 如果`xxx`和`yyy`都没出现在`vite.config.js`的`resolve.conditions`中, vite会如上的错误
    // 而且, vite的`--conditions`参数还有对`nodejs`的`cli`的`--conditions`参数的依赖有过滤作用
    // 例如: 运行`vite run`前, 通过环境变量`NODE_OPTIONS`
    // 给`nodejs`指定条件(export NODE_OPTIONS=--conditions=xxx,yyy)
    // 但是`vite`的`--conditions`参数中只有`xxx`的话,那么只有`xxx`会被传递给`nodejs`
    // (并且只有在导入的包的package.json中有`exports/imports`字段中配置了`xxx`时,`xxx`条件才可能有用)
    // 上述不全对, 如果`vite`的`conditions`字段不是空数组,
    // 那么即使`--conditions`参数中指定的所有的条件都不在`vite`的`conditions`数组中,
    // vite也不会报错, 而是会把其`conditions`字段的值作为`nodejs cli`的`--conditions`参数的值传递给`nodejs`
    // 例如: `conditions`字段的值为`["xxx","yyy"]`,
    // 那么`vite run`时, `nodejs`的`--conditions`参数的值为`xxx,yyy`
    conditions: [
      // 'types', //NOTE: 在没有吧vitest与typescript匹配好的情况下, 运行vitest, node的模块系统报错: ERR_UNKNOWN_FILE_EXTENSION
      // NOTE: node和node-addons会导致开发模式下页面报错:  The requested module '/node_modules/.vite/deps/vue.js?v=65ec3c77' does not provide an export named 'createElementBlock'
      // 'node',
      // 'node-addons',
      // NOTE: 在没有配置好vitest的情况下, `import和require`会使得vitest run崩溃,报错:
      // jsdom/lib/jsdom/browser/parser/html.js:3:16
      // cjs模块`html.js`加载了模块"parse5"(require("parse5")),
      // 本来`parse5`的`package.json``exports`中有定义了`require`条件下的入口
      // 但是却错误的加载了其esm版本的入口文件,导致了报错
      // 'import',
      // 'require',
      'module',
      'browser',
      'production',
      'development',
      'default',
      // ...conditionsOfTsConf
      ...conditions
    ]
  },
  build: {
    rollupOptions: {
      // 为了在生产环境下, vite不会在打包时把vue的runtime-dom模块打包进去
      // node_modules/vue/dist/vue.runtime.esm-bundler.js文件中导入了@vue/*模块
      // 而node_modules/@vue文件夹下没有这些模块时,会导致打包失败
      // 但是如果把vue的包排除掉,生成的index.html被访问时会报找不到vue包的错误
      // external: [/^@vue/, /^vue/]
    }
  }
})
