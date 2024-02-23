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

export function CH(x: u32, y: u32, z: u32): u32 {
  return((x & y) ^ (~x & z));
}

export function CHV128(x: v128, y: v128, z: v128): v128 {
  const a = v128.and(x, y);
  const b = v128.and(v128.not(x), z);
  return v128.xor(a, b);
}

export function MAJ(x: u32, y: u32, z:u32): u32 {
  return ((x & y) ^ (x & z) ^ (y & z));
}

export function MAJV128(x: v128, y: v128, z: v128): v128 {
  const a = v128.and(x, y);
  const b = v128.and(x, z);
  const c = v128.and(y, z);
  return v128.xor(v128.xor(a, b), c);
}

export function EP0(x: u32): u32 {
  return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}

export function EP0V128(x: v128): v128 {
  const a = rotrV128(x, 2);
  const b = rotrV128(x, 13);
  const c = rotrV128(x, 22);
  return v128.xor(v128.xor(a, b), c);
}

export function EP1(x: u32): u32 {
  return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}

export function EP1V128(x: v128): v128 {
  const a = rotrV128(x, 6);
  const b = rotrV128(x, 11);
  const c = rotrV128(x, 25);
  return v128.xor(v128.xor(a, b), c);
}

export function SIG0(x: u32): u32 {
  return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
}

export function SIG0V128(x: v128): v128 {
  const a = rotrV128(x, 7);
  const b = rotrV128(x, 18);
  const c = i32x4.shr_u(x, 3);
  return v128.xor(v128.xor(a, b), c);
}

export function SIG1(x: u32): u32 {
  return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
}

export function SIG1V128(x: v128): v128 {
  const a = rotrV128(x, 17);
  const b = rotrV128(x, 19);
  const c = i32x4.shr_u(x, 10);
  return v128.xor(v128.xor(a, b), c);
}

export function rotrU32(value: u32, bits: i32): u32 {
  return rotr(value, bits);
}

/////////////////////////////////////////////////////////
// Below is test utilities, should be removed after all
/////////////////////////////////////////////////////////
export function testCh(x: u32, y: u32, z: u32): u32 {
  const x2 = i32x4.splat(x);
  const y2 = i32x4.splat(y);
  const z2 = i32x4.splat(z);
  const resultV128 = CHV128(x2, y2, z2);
  return extractLane0(resultV128);
}

export function testMaj(x: u32, y: u32, z: u32): u32 {
  const x2 = i32x4.splat(x);
  const y2 = i32x4.splat(y);
  const z2 = i32x4.splat(z);
  const resultV128 = MAJV128(x2, y2, z2);
  return extractLane0(resultV128);
}


export function testEp0(value: u32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = EP0V128(v128);
  return extractLane0(resultV128);
}

export function testEp1(value: u32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = EP1V128(v128);
  return extractLane0(resultV128);
}

export function testSig0(value: u32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = SIG0V128(v128);
  return extractLane0(resultV128);
}

export function testSig1(value: u32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = SIG1V128(v128);
  return extractLane0(resultV128);
}

export function testRotrV128(value: u32, bits: i32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = rotrV128(v128, bits);
  return extractLane0(resultV128);
}

export function testLoadbe32V128(value: u32): u32 {
  const v128 = i32x4.splat(value);
  const resultV128 = load32beV128(v128);
  return extractLane0(resultV128);
}

function extractLane0(v128: v128): u32 {
  const lane0 = i32x4.extract_lane(v128, 0);
  const lane1 = i32x4.extract_lane(v128, 1);
  const lane2 = i32x4.extract_lane(v128, 2);
  const lane3 = i32x4.extract_lane(v128, 3);

  if (lane0 !== lane1 || lane0 !== lane2 || lane0 !== lane3) {
    throw new Error("rotrV128 failed");
  }
  return lane0;
}

/**
 * rotr is not natively supported by v128 so we have to implement it manually
 * @param value
 * @param bits
 * @returns
 */
function rotrV128(value: v128, bits: i32): v128 {
  const maskBits = 32 - bits;

  // Shift right (logical) each lane by 'bits'
  const rightShifted = i32x4.shr_u(value, bits);

  // Shift left each lane by (32 - bits) to handle the wrap-around part of rotation
  const leftShifted = i32x4.shl(value, maskBits);

  // Combine the shifted parts with bitwise OR to achieve rotation
  return v128.or(rightShifted, leftShifted);
}

function load32beV128(value: v128): v128 {
  const value0 = i32x4.shl(v128.and(value, i32x4.splat(0x000000FF)), 24);
  const value1 = i32x4.shl(v128.and(value, i32x4.splat(0x0000FF00)), 8);
  const value2 = i32x4.shr_u(v128.and(value, i32x4.splat(0x00FF0000)), 8);
  const value3 = i32x4.shr_u(v128.and(value, i32x4.splat(0xFF000000)), 24);

  return v128.or(v128.or(value0, value1), v128.or(value2, value3));
}

@inline
function load32(ptr: usize, offset: usize): u32 {
  return load<u32>(ptr + (offset << alignof<u32>()));
}

@inline
function load8(ptr: usize, offset: usize): u8 {
  return load<u8>(ptr + offset);
}
