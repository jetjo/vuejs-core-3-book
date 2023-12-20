const arr = ["liuyifei"];
const LenMax = Math.pow(2, 32) - 1;
arr[LenMax - 1] = "";
arr[LenMax] = "";
arr[LenMax + 1] = "";
//   console.log(arr)
arr.length = 0;
console.log(arr);

console.log([].fill("刘亦菲", 0, 10));
console.log([,].fill("刘亦菲", 0, 10));
console.log([, ,].fill("刘亦菲", 0, 10));

console.log(Array(LenMax - 1));
console.log(Array(LenMax));
// console.log(Array(LenMax + 1)) // RangeError: Invalid array length
console.log(Array(LenMax + 1, ""));
