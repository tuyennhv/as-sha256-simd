export const PARALLEL_FACTOR = 16;
// 64 bytes = 512 bits = 1 block
// TODO: change 2 to 64
export const INPUT_LENGTH = 4 * PARALLEL_FACTOR;
// TODO: change 1 to 32
const DIGEST_LENGTH = 2 * PARALLEL_FACTOR;

// Import the JavaScript logging function
@external("env", "logValue")
declare function logValue(value: f32): void;

// input buffer
export const input = new ArrayBuffer(INPUT_LENGTH);
const inputPtr = changetype<usize>(input);

// output buffer
export const output = new ArrayBuffer(DIGEST_LENGTH);
const outputPtr = changetype<usize>(output);

export function sum(): i32 {
  let sum: i32 = 0;
  for (let i = 0; i < INPUT_LENGTH; i++) {
    sum += load8(inputPtr, i);
  }
  return sum;

}
export function add(a: i32, b: i32): i32 {
  logValue(32);
  return a + b;
}


export function addFloatVectors(a: v128, b: v128): v128 {
  return f32x4.add(a, b);
}

// Example usage with constants for demonstration
export function addSampleVectors(): v128 {
  // Create a vector with all elements set to 1.0
  const vec1: v128 = f32x4.splat(1.0);
  // Create a vector with all elements set to 2.0
  const vec2: v128 = f32x4.splat(2.0);
  return addFloatVectors(vec1, vec2);
}

/**
 * h${i} is a 512-bit input = 64 bytes
 *
 *         h0 h1 h2 h3 h4 h5 h6 h7 h8 h9 h10 h11 h12 h13 h14 h15
 * v128_0  |  |  |  |  |  |  |  |  |  |  |   |   |   |   |   |
 * v128_1  |  |  |  |  |  |  |  |  |  |  |   |   |   |   |   |
 * ...
 * v128_62 |  |  |  |  |  |  |  |  |  |  |   |   |   |   |   |
 * v128_63 |  |  |  |  |  |  |  |  |  |  |   |   |   |   |   |
 */
export function xor16Inputs(): void {
  // data should be ready in input buffer
  // each hash input has exactly 64 bytes => we have 64 vInput
  const vInputs: v128[] = [];
  // cannot do the loop here, otherwise get "AS220: Expression must be a compile-time constant."
  vInputs.push(v128.load(inputPtr, 16 * 0));
  vInputs.push(v128.load(inputPtr, 16 * 1));
  vInputs.push(v128.load(inputPtr, 16 * 2));
  vInputs.push(v128.load(inputPtr, 16 * 3));

  // xor v0 to v33, v1 to v34 etc to get result
  // for (let i = 0; i < 32; i++) {
  //   // vOutputs.push(v128.xor(vInputs[i], vInputs[i + 32]));
  //   const vOutput = v128.xor(vInputs[i], vInputs[i + 32]);
  //   v128.store(outputPtr, vOutput, i * 16);
  // }

  v128.store(outputPtr, v128.xor(vInputs[0], vInputs[1]), 0 * 16);
  v128.store(outputPtr, v128.xor(vInputs[2], vInputs[3]), 1 * 16);
}

@inline
function load32(ptr: usize, offset: usize): u32 {
  return load<u32>(ptr + (offset << alignof<u32>()));
}

@inline
function load8(ptr: usize, offset: usize): u8 {
  return load<u8>(ptr + offset);
}
