function queueMacroTask() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

function queueMicroTask() {
  return Promise.resolve()
}

export { queueMacroTask, queueMicroTask }
