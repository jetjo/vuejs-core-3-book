// NOTE: 在`@jetjo/vue3-chapter3`项目的`vite.config.js`中间接导入了此
// 文件, 如果此模块导入`log`模块时省略了扩展名(即`import { warn } from './log'`),
// 那么启动`vite`时会报错, 但是`vite`运行后, 其他文件中这样导入
// // Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/loong/project/vuejs-core-3-book/二、响应系统/4、响应系统的作用与实现/11-竞态问题与过期的副作用/utils/log' imported from /Users/loong/project/vuejs-core-3-book/二、响应系统/4、响应系统的作用与实现/11-竞态问题与过期的副作用/utils/default.js
// // at new NodeError (node:internal/errors:371:5)
// // at finalizeResolution (node:internal/modules/esm/resolve:418:11)
import { warn } from './log.js'

export function voidFunc(params) {
  // warn('voidFunc: ', { params })
}
