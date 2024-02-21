const DIGEST_LENGTH = 32;
export const INPUT_LENGTH = 512;

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

@inline
function load32(ptr: usize, offset: usize): u32 {
  return load<u32>(ptr + (offset << alignof<u32>()));
}

@inline
function load8(ptr: usize, offset: usize): u8 {
  return load<u8>(ptr + offset);
}
