import {newInstance} from "./wasm.js";

const ctx = newInstance();

const wasmInputValue = ctx.input.value;
const wasmOutputValue = ctx.output.value;
const inputUint8Array = new Uint8Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);
// TODO: remove hard code
const outputUint8Array = new Uint8Array(ctx.memory.buffer, wasmOutputValue, 32 * 4);
const inputUint32Array = new Uint32Array(ctx.memory.buffer, wasmInputValue, ctx.INPUT_LENGTH);

// TODO: reuse from context?
const PARALLEL_FACTOR = 16;
// TODO: change 2 to 64
const HASH_INPUT_LENGTH = 64;
// TODO: change 1 to 32
const HASH_OUTPUT_LENGTH = 2;
// 64 bytes
type HASH_INPUT = Uint8Array;

export function xor16Inputs(hInputs: HASH_INPUT[]): Uint8Array[] {
  if (hInputs.length !== PARALLEL_FACTOR) {
    throw new Error(`Input length must be 16`);
  }

  for (const input of hInputs) {
    // 64 bytes * 8 bits/byte = 512 bits
    if (input.length !== HASH_INPUT_LENGTH) {
      throw new Error(`Input length must be 64`);
    }
  }

  // console.log("@@@ hInputs", hInputs);

  // set up input buffer for v128
  // TODO: is it more efficient to do it in webassembly
  let index = 0;
  for (let i = 0; i < HASH_INPUT_LENGTH; i++) {
    for (let j = 0; j < PARALLEL_FACTOR; j++) {
      inputUint8Array[index] = hInputs[j][i];
      index++;
    }
  }

  // console.log("@@@ xor inputs", inputUint8Array);
  ctx.xor16Inputs();
  // console.log("@@@ xor result", outputUint8Array);

  const outputs: Uint8Array[] = [];
  for (let i = 0; i < PARALLEL_FACTOR; i++) {
    const output = new Uint8Array(HASH_OUTPUT_LENGTH);
    for (let j = 0; j < HASH_OUTPUT_LENGTH; j++) {
      output[j] = outputUint8Array[j * 16 + i];
    }
    outputs.push(output);
  }

  return outputs;
}

export function rotrU32(a: number, b: number): number {
  return ctx.rotrU32(a, b);
}

export function testRotrV128(a: number, b: number): number {
  return ctx.testRotrV128(a, b);
}

export function ch(x: number, y: number, z: number): number {
  return ctx.CH(x, y, z);
}

export function testCh(x: number, y: number, z: number): number {
  return ctx.testCh(x, y, z);
}

export function maj(x: number, y: number, z: number): number {
  return ctx.MAJ(x, y, z);
}

export function testMaj(x: number, y: number, z: number): number {
  return ctx.testMaj(x, y, z);
}

export function ep0(x: number): number {
  return ctx.EP0(x);
}

export function testEp0(x: number): number {
  return ctx.testEp0(x);
}

export function ep1(x: number): number {
  return ctx.EP1(x);
}

export function testEp1(x: number): number {
  return ctx.testEp1(x);
}

export function sig0(x: number): number {
  return ctx.SIG0(x);
}

export function testSig0(x: number): number {
  return ctx.testSig0(x);
}

export function sig1(x: number): number {
  return ctx.SIG1(x);
}

export function testSig1(x: number): number {
  return ctx.testSig1(x);
}

export function testLoadbe32V128(value: number): number {
  return ctx.testLoadbe32V128(value);
}

export function digest64(data: Uint8Array): Uint8Array {
  if (data.length === 64) {
    inputUint8Array.set(data);
    ctx.digest64(wasmInputValue, wasmOutputValue);
    const output = new Uint8Array(32);
    output.set(outputUint8Array.subarray(0, 32));
    return output;
  }
  throw new Error("InvalidLengthForDigest64");
}

/**
 * Hash 4 inputs, each 64 bytes
 * @param i0
 * @param i1
 * @param i2
 * @param i3
 */
export function hash4Inputs(i0: Uint8Array, i1: Uint8Array, i2: Uint8Array, i3: Uint8Array): Uint8Array[] {
  if (i0.length !== HASH_INPUT_LENGTH || i1.length !== HASH_INPUT_LENGTH || i2.length !== HASH_INPUT_LENGTH || i3.length !== HASH_INPUT_LENGTH) {
    throw new Error(`Input length must be 64`);
  }
  // set up input buffer for v128
  inputUint8Array.set(i0, 0);
  inputUint8Array.set(i1, 64);
  inputUint8Array.set(i2, 128);
  inputUint8Array.set(i3, 192);

  ctx.digest64V128(wasmInputValue, wasmOutputValue);

  const output0 = new Uint8Array(32);
  output0.set(outputUint8Array.subarray(0, 32));
  const output1 = new Uint8Array(32);
  output1.set(outputUint8Array.subarray(32, 64));
  const output2 = new Uint8Array(32);
  output2.set(outputUint8Array.subarray(64, 96));
  const output3 = new Uint8Array(32);
  output3.set(outputUint8Array.subarray(96, 128));

  return [output0, output1, output2, output3];
}

