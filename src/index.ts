import { input } from "../assembly/index.js";
import { HashObject, byteArrayToHashObject } from "./hashObject.js";
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
 * @param i0 64 byte Uint8Array
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


  ctx.hash4Inputs(wasmOutputValue);

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

/**
 * Hash 8 HashObjects:
 * input${i} has h0 to h7, each 4 bytes which make it 32 bytes
 */
export function hash8HashObjects(inputs: HashObject[]): HashObject[] {
  if (inputs.length !== 8) {
    throw new Error(`Input length must be 8`);
  }

  // inputUint8Array is 256 bytes
  // inputUint32Array is 64 items
  // v128 0
  inputUint32Array[0] = inputs[0].h0;
  inputUint32Array[1] = inputs[2].h0;
  inputUint32Array[2] = inputs[4].h0;
  inputUint32Array[3] = inputs[6].h0;

  // v128 1
  inputUint32Array[4] = inputs[0].h1;
  inputUint32Array[5] = inputs[2].h1;
  inputUint32Array[6] = inputs[4].h1;
  inputUint32Array[7] = inputs[6].h1;

  // v128 2
  inputUint32Array[8] = inputs[0].h2;
  inputUint32Array[9] = inputs[2].h2;
  inputUint32Array[10] = inputs[4].h2;
  inputUint32Array[11] = inputs[6].h2;

  // v128 3
  inputUint32Array[12] = inputs[0].h3;
  inputUint32Array[13] = inputs[2].h3;
  inputUint32Array[14] = inputs[4].h3;
  inputUint32Array[15] = inputs[6].h3;

  // v128 4
  inputUint32Array[16] = inputs[0].h4;
  inputUint32Array[17] = inputs[2].h4;
  inputUint32Array[18] = inputs[4].h4;
  inputUint32Array[19] = inputs[6].h4;

  // v128 5
  inputUint32Array[20] = inputs[0].h5;
  inputUint32Array[21] = inputs[2].h5;
  inputUint32Array[22] = inputs[4].h5;
  inputUint32Array[23] = inputs[6].h5;

  // v128 6
  inputUint32Array[24] = inputs[0].h6;
  inputUint32Array[25] = inputs[2].h6;
  inputUint32Array[26] = inputs[4].h6;
  inputUint32Array[27] = inputs[6].h6;

  // v128 7
  inputUint32Array[28] = inputs[0].h7;
  inputUint32Array[29] = inputs[2].h7;
  inputUint32Array[30] = inputs[4].h7;
  inputUint32Array[31] = inputs[6].h7;

  // v128 8
  inputUint32Array[32] = inputs[1].h0;
  inputUint32Array[33] = inputs[3].h0;
  inputUint32Array[34] = inputs[5].h0;
  inputUint32Array[35] = inputs[7].h0;

  // v128 9
  inputUint32Array[36] = inputs[1].h1;
  inputUint32Array[37] = inputs[3].h1;
  inputUint32Array[38] = inputs[5].h1;
  inputUint32Array[39] = inputs[7].h1;

  // v128 10
  inputUint32Array[40] = inputs[1].h2;
  inputUint32Array[41] = inputs[3].h2;
  inputUint32Array[42] = inputs[5].h2;
  inputUint32Array[43] = inputs[7].h2;

  // v128 11
  inputUint32Array[44] = inputs[1].h3;
  inputUint32Array[45] = inputs[3].h3;
  inputUint32Array[46] = inputs[5].h3;
  inputUint32Array[47] = inputs[7].h3;

  // v128 12
  inputUint32Array[48] = inputs[1].h4;
  inputUint32Array[49] = inputs[3].h4;
  inputUint32Array[50] = inputs[5].h4;
  inputUint32Array[51] = inputs[7].h4;

  // v128 13
  inputUint32Array[52] = inputs[1].h5;
  inputUint32Array[53] = inputs[3].h5;
  inputUint32Array[54] = inputs[5].h5;
  inputUint32Array[55] = inputs[7].h5;

  // v128 14
  inputUint32Array[56] = inputs[1].h6;
  inputUint32Array[57] = inputs[3].h6;
  inputUint32Array[58] = inputs[5].h6;
  inputUint32Array[59] = inputs[7].h6;

  // v128 15
  inputUint32Array[60] = inputs[1].h7;
  inputUint32Array[61] = inputs[3].h7;
  inputUint32Array[62] = inputs[5].h7;
  inputUint32Array[63] = inputs[7].h7;

  ctx.hash8HashObjects(wasmOutputValue);

  const output0 = byteArrayToHashObject(outputUint8Array.subarray(0, 32));
  const output1 = byteArrayToHashObject(outputUint8Array.subarray(32, 64));
  const output2 = byteArrayToHashObject(outputUint8Array.subarray(64, 96));
  const output3 = byteArrayToHashObject(outputUint8Array.subarray(96, 128));

  return [output0, output1, output2, output3];
}

const rotr = (word: number, shift: number) => (word << (32 - shift)) | (word >>> shift);