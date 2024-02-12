// @ts-ignore
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readFile } from 'node:fs/promises'
import { parse } from 'jsonc-parser'
// import { warn } from '../chapter-2/internal-barrel/utils'
import { warn } from '@jetjo/vue3/utils'
// NOTE: Error [ERR_INVALID_PACKAGE_TARGET]: Invalid "imports"
// target "../internal-barrel/utils/index.js" defined for '#root/utils'
// 但是vite运行后, 其他文件中这样导入,却不报错, holly shit
// import { warn } from '#root/utils'

// conditions: ['import', 'module', 'require', 'node', 'browser', 'default', 'import.meta', 'module-res-utils']
// 从`tsconfig.json`或`jsconfig.json`中读取`compilerOptions.customConditions`字段
/**
 * @type {import('./module-res-utils-c').getConfFromJson<string[]>}
 * @description 从`tsconfig.json`中读取`compilerOptions.customConditions`字段
 * @description 可以使用返回值配置`vite`的`resolve.conditions`字段
 * @description 以保持不同基础设施配置的一致性
 */
async function parseCustomConditions({ url }) {
  const conf = await readJson({ url })
  // console.warn('tsconfig.json: ', conf)
  const conditions = conf?.compilerOptions?.customConditions || []
  const extends_ = conf.extends || ''
  // const path = fileURLToPath(url)
  // const url2 = pathToFileURL(path).href
  // console.warn({ path, url, url2, extends_ })
  // NOTE: 如果`extends_`为空的话, 报错如下:
  // Error: Cannot find package '${workspaceRoot}/node_modules//package.json'
  // imported from ${workspaceRoot}/node_modules/@vue/tsconfig/tsconfig.json
  // import.meta.resolve(extends_, path) // TypeError: Invalid URL
  const ext_url = extends_ ? await import.meta.resolve(extends_, url) : ''
  // console.warn({ ext_url })
  if (ext_url) {
    const baseConditions = await parseCustomConditions({
      url: ext_url
    })
    conditions.push(...baseConditions)
  }
  // console.warn('compilerOptions.customConditions: ', conditions)
  return conditions
}

/**@type {import('./module-res-utils-c').getConfFromJson<import('./jsconfig.json')>} */
async function readJson({ url }) {
  // // fucking import()!!!, 对json支持巨差, 也不支持jsonc
  // // This "import()" was not recognized because this property was not called "assert" [unsupported-dynamic-import]
  // // const conf = await import(url, {
  // //   assert: { type: 'json' },
  // //   with: { type: 'json' }
  // // })
  // // TypeError [ERR_IMPORT_ATTRIBUTE_UNSUPPORTED]: Import attribute "type" with value "jsonc" is not supported
  // // const conf = await import(url, {
  // //   assert: { type: 'jsonc' },
  // //   with: { type: 'jsonc' }
  // // })
  // const conf = await import(url, { with: { type: 'json' } })
  // // const conf = await import(url, { assert: { type: 'json' } })

  if (url.startsWith('file:')) {
    url = fileURLToPath(url)
  }
  warn('read config: ', url)
  // console.warn('json file path: ', url)
  const text = await readFile(url, { encoding: 'utf-8' })

  return parse(text)
  /* 
  // make edits and apply them
  const edits = modify(text, [...keys], value, {})
  const updated = applyEdits(text, edits)

  // format the updated text
  const formatted = format(updated, undefined, {})
  const res = applyEdits(updated, formatted)

  // write changes to file
  await Deno.writeTextFile(file, res) */
}

function parsePkgResolveConditionFrom(NODE_OPTIONS = '') {
  // console.warn('NODE_OPTIONS: ', NODE_OPTIONS);
  // @ts-ignore
  const parseMatchArray = arr => {
    if (!Array.isArray(arr)) return []
    if (typeof arr[1] !== 'string') return []
    return arr[1].split(',')
  }
  // "NODE_OPTIONS='--experimental-json-modules --conditions=test,verify'
  // '--experimental-json-modules --conditions=test,verify',
  // '--experimental-json-modules --conditions=test,verify --xxx',
  // '--conditions=test,verify --xxx'
  // 以上三行的输入测试通过
  // 从`NODE_OPTIONS`中读取`--conditions`字段,并解析为数组
  const conditions = NODE_OPTIONS.match(/--conditions=([^ ]+)/)

  // "NODE_OPTIONS_STYLE='--experimental-json-modules -C test,verify'
  // '--experimental-json-modules -C test,verify'
  // '--experimental-json-modules -C test,verify -X xxx,yyy'
  // '-C test,verify -X xxx,yyy'
  // 以上三行的输入测试通过
  // 从`NODE_OPTIONS_STYLE`中解析出`-C`的参数,并解析为数组
  const conditions_style = NODE_OPTIONS.match(/-C ([^ ]+)/)

  return [...parseMatchArray(conditions), ...parseMatchArray(conditions_style)]
}

export { parseCustomConditions, parsePkgResolveConditionFrom }
