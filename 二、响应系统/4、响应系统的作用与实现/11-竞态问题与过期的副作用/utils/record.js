import { log, warn } from './log.js'

const lastCallRecordInit = () => ({
  __proto__: null,
  option: Object.create(null)
  // result: undefined
  // emptyOption: false
  // diff: undefined
})

const lastCallRecord = new WeakMap()

const versions = new Map()

/**@type {GetDiff} */
const _getDiff = (OldOptions, option) => {
  // if (OldOptions === undefined) return { isSame: false, diff: { __proto__: null, ...option } }
  const diff = { __proto__: null }
  let isSame = true
  for (const [key, value] of Object.entries(OldOptions)) {
    const newVal = option[key]
    if (newVal !== value && (value === value || newVal === newVal)) {
      diff[key] = newVal
      isSame = false
    }
  }
  return isSame ? undefined : { ...diff }
}

/**@type {RunWithRecord} */
function runWithRecord({ factory, factoryName, version, getDiff, ...option }) {
  let versionRecord
  if (typeof version === 'string' && version !== '') {
    versionRecord = versions.get(version)
    if (versionRecord === undefined) {
      versions.set(version, (versionRecord = new WeakMap()))
    }
  }
  const _lastCallRecord = versionRecord || lastCallRecord
  let record = _lastCallRecord.get(factory)
  if (record === undefined) {
    _lastCallRecord.set(factory, (record = lastCallRecordInit()))
    Object.assign(record.option, option)
    const isEmpty = Object.keys(record.option).length === 0
    Object.defineProperty(record, 'emptyOption', {
      get() {
        return isEmpty
      },
      enumerable: true
    })
    return (record.result = factory({ ...option, version }))
  }
  if (record.emptyOption) return record.result
  // prettier-ignore
  const diff = getDiff === undefined ? _getDiff(record.option, option) : getDiff({ ...record.option }, option)
  if (diff === undefined) return record.result
  Object.assign(record.option, diff)
  record.diff = { __proto__: null, ...diff }
  warn(`[${factoryName}-${version}]`, 'option changed', diff)
  return (record.result = factory({ ...option, version }))
}

export { runWithRecord }
