function queueMacroTask() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

export { queueMacroTask }
