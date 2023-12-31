function isSet(o) {
  try {
    Set.prototype.has.call(o)
    Set.prototype.delete.call(o)
    return true
  } catch (_) {
    return false
  }
}

function isMap(o) {
  try {
    Map.prototype.has.call(o)
    Map.prototype.delete.call(o)
    return true
  } catch (_) {
    return false
  }
}

function isWeakSet(o) {
  try {
    WeakSet.prototype.has.call(o)
    WeakSet.prototype.delete.call(o)
    return true
  } catch (_) {
    return false
  }
}

function isWeakMap(o) {
  try {
    WeakMap.prototype.has.call(o)
    WeakMap.prototype.delete.call(o)
    return true
  } catch (_) {
    return false
  }
}

export { isMap, isSet, isWeakMap, isWeakSet }
