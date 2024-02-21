import {newInstance} from "./wasm.js";

const ctx = newInstance();

const wasmInputValue = ctx.input.value;
const wasmOutputValue = ctx.output.value;
const inputUint8Array = new Uint8Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);
const outputUint8Array = new Uint8Array(ctx.memory.buffer, wasmOutputValue, 32);
const inputUint32Array = new Uint32Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);

export function add(a: number, b: number): number {
  return ctx.add(a + 1, b + 1);
}

export function sum(input: Uint8Array): number {
  if (input.length !== 512) {
    throw new Error(`Input length must be ${ctx.INPUT_LENGTH}`);
  }
  inputUint8Array.set(input);
  return ctx.sum();
}

