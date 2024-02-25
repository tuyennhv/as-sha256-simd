export const PARALLEL_FACTOR = 16;
// 64 bytes = 512 bits = 1 block
export const INPUT_LENGTH = 64 * PARALLEL_FACTOR;
const DIGEST_LENGTH = 32 * PARALLEL_FACTOR;

// Import the JavaScript logging function
@external("env", "logValue")
declare function logValue(value: u32): void;

// input buffer
export const input = new ArrayBuffer(INPUT_LENGTH);
const inputPtr = changetype<usize>(input);

// output buffer
export const output = new ArrayBuffer(DIGEST_LENGTH);
const outputPtr = changetype<usize>(output);
export function add(a: i32, b: i32): i32 {
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

const K: u32[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
  0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
  0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
  0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
  0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
  0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
  0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

const KV128: v128[] = K.map((k: u32) => i32x4.splat(k));

const kPtr = K.dataStart;

//precomputed W + K for message block representing length 64 bytes for fixed input of 64 bytes for digest64
const W64: u32[] = [
  0xc28a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf374,
  0x649b69c1, 0xf0fe4786, 0x0fe1edc6, 0x240cf254,
  0x4fe9346f, 0x6cc984be, 0x61b9411e, 0x16f988fa,
  0xf2c65152, 0xa88e5a6d, 0xb019fc65, 0xb9d99ec7,
  0x9a1231c3, 0xe70eeaa0, 0xfdb1232b, 0xc7353eb0,
  0x3069bad5, 0xcb976d5f, 0x5a0f118f, 0xdc1eeefd,
  0x0a35b689, 0xde0b7a04, 0x58f4ca9d, 0xe15d5b16,
  0x007f3e86, 0x37088980, 0xa507ea32, 0x6fab9537,
  0x17406110, 0x0d8cd6f1, 0xcdaa3b6d, 0xc0bbbe37,
  0x83613bda, 0xdb48a363, 0x0b02e931, 0x6fd15ca7,
  0x521afaca, 0x31338431, 0x6ed41a95, 0x6d437890,
  0xc39c91f2, 0x9eccabbd, 0xb5c9a0e6, 0x532fb63c,
  0xd2c741c6, 0x07237ea3, 0xa4954b68, 0x4c191d76,
];
const w64Ptr = W64.dataStart;

const W64V128: v128[] = W64.map((w: u32) => i32x4.splat(w));

// intermediate hash values stored in H0-H7
var H0: u32, H1: u32, H2: u32, H3: u32, H4: u32, H5: u32, H6: u32, H7: u32;
let H0V128: v128, H1V128: v128, H2V128: v128, H3V128: v128, H4V128: v128, H5V128: v128, H6V128: v128, H7V128: v128;
// hash registers
var a: u32, b: u32, c: u32, d: u32, e: u32, f: u32, g: u32, h: u32, i: u32, t1: u32, t2: u32;
let aV128: v128, bV128: v128, cV128: v128, dV128: v128, eV128: v128, fV128: v128, gV128: v128, hV128: v128, iV128: v128, t1V128: v128, t2V128: v128;

const WV128: v128[] = [];
// TODO: reuse variables i
for (let i = 0; i < 64; i++) {
  WV128.push(i32x4.splat(0));
}

const inV128Arr: v128[] = [];
for (let i = 0; i < 16; i++) {
  inV128Arr.push(i32x4.splat(0));
}

// 16 32bit message blocks
const M = new ArrayBuffer(64);
const mPtr = changetype<usize>(M);

// 64 32bit extended message blocks
const W = new ArrayBuffer(256);
const wPtr = changetype<usize>(W);

// number of bytes in M buffer
var mLength = 0;

// number of total bytes hashed
var bytesHashed = 0;

export function init(): void {
  H0 = 0x6a09e667;
  H1 = 0xbb67ae85;
  H2 = 0x3c6ef372;
  H3 = 0xa54ff53a;
  H4 = 0x510e527f;
  H5 = 0x9b05688c;
  H6 = 0x1f83d9ab;
  H7 = 0x5be0cd19;

  mLength = 0;
  bytesHashed  = 0;
}

// TODO: is it needed to export this function
export function initV128(): void {
  H0V128 = i32x4.splat(0x6a09e667);
  H1V128 = i32x4.splat(0xbb67ae85);
  H2V128 = i32x4.splat(0x3c6ef372);
  H3V128 = i32x4.splat(0xa54ff53a);
  H4V128 = i32x4.splat(0x510e527f);
  H5V128 = i32x4.splat(0x9b05688c);
  H6V128 = i32x4.splat(0x1f83d9ab);
  H7V128 = i32x4.splat(0x5be0cd19);
}

/**
 * Expand message blocks (16 32bit blocks), into extended message blocks (64 32bit blocks),
 * Apply SHA256 compression function on extended message blocks
 * Update intermediate hash values
 * @param wPtr pointer to expanded message block memory
 * @param mPtr pointer to message block memory, pass 0 if wPtr is precomputed for e.g. in digest64
 */
function hashBlocks(wPtr: usize, mPtr: usize): void {
  a = H0;
  b = H1;
  c = H2;
  d = H3;
  e = H4;
  f = H5;
  g = H6;
  h = H7;

  // Load message blocks into first 16 expanded message blocks
  for (i = 0; i < 16; i++) {
    store32(wPtr, i,
      load32be(mPtr, i)
    );
  }
  // Expand message blocks 17-64
  for (i = 16; i < 64; i++) {
    store32(wPtr, i,
      SIG1(load32(wPtr, i - 2)) +
      load32(wPtr, i - 7) +
      SIG0(load32(wPtr, i - 15)) +
      load32(wPtr, i - 16)
    );
  }

  // Apply SHA256 compression function on expanded message blocks
  for (i = 0; i < 64; i++) {
    t1 = h + EP1(e) + CH(e, f, g) + load32(kPtr, i) + load32(wPtr, i);
    t2 = EP0(a) + MAJ(a, b, c);
    h = g;
    g = f;
    f = e;
    e = d + t1;
    d = c;
    c = b;
    b = a;
    a = t1 + t2;
  }

  H0 += a;
  H1 += b;
  H2 += c;
  H3 += d;
  H4 += e;
  H5 += f;
  H6 += g;
  H7 += h;
}

//TODO: no need to export these functions
/**
 * Expand message blocks (16 32bit blocks), into extended message blocks (64 32bit blocks),
 * Apply SHA256 compression function on extended message blocks
 * Update intermediate hash values
 * @param wV128Arr 64 v128 objects respective to 4 expanded message blocks memory
 * @param mV12Arr 16 v128 objects respective to 4 message blocks memory
 *
 *                    block 0 (4 bytes)   block 1 (4 bytes)    block 2 (4 bytes)    block 3 (4 bytes)
 *   wV128_0       |--------------------|--------------------|--------------------|--------------------|
 *   wV128_1       |--------------------|--------------------|--------------------|--------------------|
 *   ...           ...
 *   wV128_15      |--------------------|--------------------|--------------------|--------------------| ===> end of input data, below is extended area
 *   wV128_16      based on item 0 to 14
 *   wV128_17      based on item 1 to 15
 *   ...
 *   wV128_63      based on item 47 to 62
 */
export function hashBlocksV128(wV128Arr: v128[], mV128Arr: v128[]): void {
  // this is a copy of data
  aV128 = H0V128;
  bV128 = H1V128;
  cV128 = H2V128;
  dV128 = H3V128;
  eV128 = H4V128;
  fV128 = H5V128;
  gV128 = H6V128;
  hV128 = H7V128;

  for (let i = 0; i < 16; i++) {
    wV128Arr[i] = load32beV128(mV128Arr[i]);
  }

  // Expand message blocks 17-64
  for (let i = 16; i < 64; i++) {
    let tmp0 = i32x4.add(SIG1V128(wV128Arr[i - 2]), wV128Arr[i - 7]);
    let tmp1 = i32x4.add(SIG0V128(wV128Arr[i - 15]), wV128Arr[i - 16]);
    wV128Arr[i] = i32x4.add(tmp0, tmp1);
  }

  // Apply SHA256 compression function on expanded message blocks
  for (let i = 0; i < 64; i++) {
    // t1 = h + EP1(e) + CH(e, f, g) + load32(kPtr, i) + load32(wPtr, i);
    t1V128 = i32x4.add(i32x4.add(i32x4.add(i32x4.add(hV128, EP1V128(eV128)), CHV128(eV128, fV128, gV128)), KV128[i]), wV128Arr[i]);
    // t2 = EP0(a) + MAJ(a, b, c);
    t2V128 = i32x4.add(EP0V128(aV128), MAJV128(aV128, bV128, cV128));
    // h = g;
    hV128 = gV128;
    // g = f;
    gV128 = fV128;
    // f = e;
    fV128 = eV128;
    // e = d + t1;
    eV128 = i32x4.add(dV128, t1V128);
    // d = c;
    dV128 = cV128;
    // c = b;
    cV128 = bV128;
    // b = a;
    bV128 = aV128;
    // a = t1 + t2;
    aV128 = i32x4.add(t1V128, t2V128);
  }

  H0V128 = i32x4.add(H0V128, aV128);
  H1V128 = i32x4.add(H1V128, bV128);
  H2V128 = i32x4.add(H2V128, cV128);
  H3V128 = i32x4.add(H3V128, dV128);
  H4V128 = i32x4.add(H4V128, eV128);
  H5V128 = i32x4.add(H5V128, fV128);
  H6V128 = i32x4.add(H6V128, gV128);
  H7V128 = i32x4.add(H7V128, hV128);
}

function hashPreCompW(wPtr: usize): void {
  a = H0;
  b = H1;
  c = H2;
  d = H3;
  e = H4;
  f = H5;
  g = H6;
  h = H7;

  // Apply SHA256 compression function on expanded message blocks
  for (i = 0; i < 64; i++) {
    t1 = h + EP1(e) + CH(e, f, g) + load32(wPtr, i);
    t2 = EP0(a) + MAJ(a, b, c);
    h = g;
    g = f;
    f = e;
    e = d + t1;
    d = c;
    c = b;
    b = a;
    a = t1 + t2;
  }

  H0 += a;
  H1 += b;
  H2 += c;
  H3 += d;
  H4 += e;
  H5 += f;
  H6 += g;
  H7 += h;
}

function hashPreCompWV128(wV128Arr: v128[]): void {
  aV128 = H0V128;
  bV128 = H1V128;
  cV128 = H2V128;
  dV128 = H3V128;
  eV128 = H4V128;
  fV128 = H5V128;
  gV128 = H6V128;
  hV128 = H7V128;

  // Apply SHA256 compression function on expanded message blocks
  for (let i = 0; i < 64; i++) {
    t1V128 = i32x4.add(i32x4.add(i32x4.add(hV128, EP1V128(eV128)), CHV128(eV128, fV128, gV128)), wV128Arr[i]);
    t2V128 = i32x4.add(EP0V128(aV128), MAJV128(aV128, bV128, cV128));
    hV128 = gV128;
    gV128 = fV128;
    fV128 = eV128;
    eV128 = i32x4.add(dV128, t1V128);
    dV128 = cV128;
    cV128 = bV128;
    bV128 = aV128;
    aV128 = i32x4.add(t1V128, t2V128);
  }

  H0V128 = i32x4.add(H0V128, aV128);
  H1V128 = i32x4.add(H1V128, bV128);
  H2V128 = i32x4.add(H2V128, cV128);
  H3V128 = i32x4.add(H3V128, dV128);
  H4V128 = i32x4.add(H4V128, eV128);
  H5V128 = i32x4.add(H5V128, fV128);
  H6V128 = i32x4.add(H6V128, gV128);
  H7V128 = i32x4.add(H7V128, hV128);
}

export function digest64(inPtr: usize, outPtr: usize): void {
  init();
  hashBlocks(wPtr,inPtr);
  hashPreCompW(w64Ptr);

  store32(outPtr, 0, bswap(H0));
  store32(outPtr, 1, bswap(H1));
  store32(outPtr, 2, bswap(H2));
  store32(outPtr, 3, bswap(H3));
  store32(outPtr, 4, bswap(H4));
  store32(outPtr, 5, bswap(H5));
  store32(outPtr, 6, bswap(H6));
  store32(outPtr, 7, bswap(H7));
}

export function hash4Inputs(inPtr: usize, outPtr: usize): void {
  // inPtr is 64 bytes each x 4 (PARALLEL_FACTOR) = 256 bytes
  // TODO: reuse i
  for (let i = 0; i < 16; i++) {
    inV128Arr[i] = i32x4.replace_lane(inV128Arr[i], 0, load32(inPtr, 0 + i));
    inV128Arr[i] = i32x4.replace_lane(inV128Arr[i], 1, load32(inPtr, 16 + i));
    inV128Arr[i] = i32x4.replace_lane(inV128Arr[i], 2, load32(inPtr, 32 + i));
    inV128Arr[i] = i32x4.replace_lane(inV128Arr[i], 3, load32(inPtr, 48 + i));
  }

  digest64V128(inPtr, outPtr);
}

export function hash4HashObjects(inPtr: usize, outPtr: usize): void {
  // cannot do the loop here, otherwise get "Expression must be a compile-time constant."
  inV128Arr[0] = v128.load(inPtr, 0);
  inV128Arr[1] = v128.load(inPtr, 16);
  inV128Arr[2] = v128.load(inPtr, 32);
  inV128Arr[3] = v128.load(inPtr, 48);
  inV128Arr[4] = v128.load(inPtr, 64);
  inV128Arr[5] = v128.load(inPtr, 80);
  inV128Arr[6] = v128.load(inPtr, 96);
  inV128Arr[7] = v128.load(inPtr, 112);
  inV128Arr[8] = v128.load(inPtr, 128);
  inV128Arr[9] = v128.load(inPtr, 144);
  inV128Arr[10] = v128.load(inPtr, 160);
  inV128Arr[11] = v128.load(inPtr, 176);
  inV128Arr[12] = v128.load(inPtr, 192);
  inV128Arr[13] = v128.load(inPtr, 208);
  inV128Arr[14] = v128.load(inPtr, 224);
  inV128Arr[15] = v128.load(inPtr, 240);

  digest64V128(inPtr, outPtr);
}

export function digest64V128(inPtr: usize, outPtr: usize): void {
  initV128();
  hashBlocksV128(WV128, inV128Arr);
  hashPreCompWV128(W64V128);

  // outPtr is 32 bytes each x 4 (PARALLEL_FACTOR) = 128 bytes
  // extract lane manually otherwise get "Expression must be a compile-time constant.""
  store32(outPtr, 0, bswap(i32x4.extract_lane(H0V128, 0)));
  store32(outPtr, 1, bswap(i32x4.extract_lane(H1V128, 0)));
  store32(outPtr, 2, bswap(i32x4.extract_lane(H2V128, 0)));
  store32(outPtr, 3, bswap(i32x4.extract_lane(H3V128, 0)));
  // why this is not correct??
  store32(outPtr, 4, bswap(i32x4.extract_lane(H4V128, 0)));
  store32(outPtr, 5, bswap(i32x4.extract_lane(H5V128, 0)));
  store32(outPtr, 6, bswap(i32x4.extract_lane(H6V128, 0)));
  store32(outPtr, 7, bswap(i32x4.extract_lane(H7V128, 0)));

  store32(outPtr, 8, bswap(i32x4.extract_lane(H0V128, 1)));
  store32(outPtr, 9, bswap(i32x4.extract_lane(H1V128, 1)));
  store32(outPtr, 10, bswap(i32x4.extract_lane(H2V128, 1)));
  store32(outPtr, 11, bswap(i32x4.extract_lane(H3V128, 1)));
  store32(outPtr, 12, bswap(i32x4.extract_lane(H4V128, 1)));
  store32(outPtr, 13, bswap(i32x4.extract_lane(H5V128, 1)));
  store32(outPtr, 14, bswap(i32x4.extract_lane(H6V128, 1)));
  store32(outPtr, 15, bswap(i32x4.extract_lane(H7V128, 1)));

  store32(outPtr, 16, bswap(i32x4.extract_lane(H0V128, 2)));
  store32(outPtr, 17, bswap(i32x4.extract_lane(H1V128, 2)));
  store32(outPtr, 18, bswap(i32x4.extract_lane(H2V128, 2)));
  store32(outPtr, 19, bswap(i32x4.extract_lane(H3V128, 2)));
  store32(outPtr, 20, bswap(i32x4.extract_lane(H4V128, 2)));
  store32(outPtr, 21, bswap(i32x4.extract_lane(H5V128, 2)));
  store32(outPtr, 22, bswap(i32x4.extract_lane(H6V128, 2)));
  store32(outPtr, 23, bswap(i32x4.extract_lane(H7V128, 2)));

  store32(outPtr, 24, bswap(i32x4.extract_lane(H0V128, 3)));
  store32(outPtr, 25, bswap(i32x4.extract_lane(H1V128, 3)));
  store32(outPtr, 26, bswap(i32x4.extract_lane(H2V128, 3)));
  store32(outPtr, 27, bswap(i32x4.extract_lane(H3V128, 3)));
  store32(outPtr, 28, bswap(i32x4.extract_lane(H4V128, 3)));
  store32(outPtr, 29, bswap(i32x4.extract_lane(H5V128, 3)));
  store32(outPtr, 30, bswap(i32x4.extract_lane(H6V128, 3)));
  store32(outPtr, 31, bswap(i32x4.extract_lane(H7V128, 3)));
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
function load32be(ptr: usize, offset: usize): u32 {
  const firstOffset = offset << alignof<u32>();
  return (
    (<u32>load8(ptr, firstOffset + 0) << 24) |
    (<u32>load8(ptr, firstOffset + 1) << 16) |
    (<u32>load8(ptr, firstOffset + 2) <<  8) |
    (<u32>load8(ptr, firstOffset + 3) <<  0)
  );
}

@inline
function store32(ptr: usize, offset: usize, u: u32): void {
  store<u32>(ptr + (offset << alignof<u32>()), u);
}

@inline
function load32(ptr: usize, offset: usize): u32 {
  return load<u32>(ptr + (offset << alignof<u32>()));
}

@inline
function load8(ptr: usize, offset: usize): u8 {
  return load<u8>(ptr + offset);
}
