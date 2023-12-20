import { effect } from "./effect/index.js";
// import { reactive } from "./reactive/index.js";

const { reactive } = await import("./reactive/index.js");

const arr = Array(100).fill("刘亦菲");
//   console.log(arr)
const MaxLen = Math.pow(2, 32) - 1;
arr[MaxLen - 1] = "";
arr[MaxLen] = "";
arr[MaxLen + 1] = "";
//   console.log(arr);
const sk = Symbol("老婆");
arr[sk] = "";
arr["老婆"] = "";

const state = reactive(arr);

effect(() => {
  console.log(state.length);
  console.log(state[0]);
  console.log(state[90]);
  console.log(state[MaxLen - 1]);
  console.log(state[MaxLen]);
  console.log(state[MaxLen + 1]);
  console.log(state[sk]);
  console.log(state["老婆"]);
  for (const key in state) {
    if (Object.hasOwnProperty.call(state, key)) {
      const element = state[key];
    }
  }
  console.log(arr);
});

state.length = 50;

state[50] = "刘亦菲";
