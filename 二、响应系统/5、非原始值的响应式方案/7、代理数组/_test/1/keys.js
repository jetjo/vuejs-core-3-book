const arr = [, , 2, , 4, , 6, , 8, , 10]
const arrInstanceKeys = arr.keys()
const objectStaticKeys = Object.keys(arr)

console.log(arrInstanceKeys, objectStaticKeys)

for (const index of arrInstanceKeys) {
  console.log(index)
}

export {}
