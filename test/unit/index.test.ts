import {expect} from "chai";
import {xor16Inputs, rotrU32, testRotrV128, ch, testCh, maj, testMaj, ep0, testEp0, ep1, testEp1, sig0, testSig0, sig1, testSig1, testLoadbe32V128} from "../../src/index.js";

describe("Test assemblyscript", () => {
  it("xor16Inputs", () => {
    const hashInputs: Uint8Array[] = [];
    for (let i = 0; i < 16; i++) {
      const hashInput = new Uint8Array(4)
      hashInput[0] = i;
      hashInput[1] = i + 1;
      hashInput[2] = i + 2;
      hashInput[3] = i + 3;
      hashInputs.push(hashInput);
    }
    const hashOutputs = xor16Inputs(hashInputs);
    for (let i = 0; i < 16; i++) {
      expect(hashOutputs[i][0]).equal(i ^ (i + 1), "failed at index " + i);
      expect(hashOutputs[i][1]).equal((i + 2) ^ (i + 3), "failed at index " + i);
    }
  });

  it("rotr", () => {
    for (let i = 0; i < 10_000; i++) {
      const value = Math.floor(Math.random() * 0xFFFFFFFF);
      for (let bits = 0; bits < 31; bits++) {
        expect(rotrU32(value, bits)).equal(testRotrV128(value, bits));
      }
    }
  });

  it("ch", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      const y = Math.floor(Math.random() * 0xFFFFFFFF);
      const z = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(ch(x, y, z)).equal(testCh(x, y, z));
    }
  });

  it("maj", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      const y = Math.floor(Math.random() * 0xFFFFFFFF);
      const z = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(maj(x, y, z)).equal(testMaj(x, y, z));
    }
  });

  it("ep0", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(ep0(x)).equal(testEp0(x));
    }
  });

  it("ep1", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(ep1(x)).equal(testEp1(x));
    }
  });

  it("sig0", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(sig0(x)).equal(testSig0(x));
    }
  });

  it("sig1", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(sig1(x)).equal(testSig1(x));
    }
  });

  it("testLoadbe32V128", () => {
    for (let i = 0; i < 10_000; i++) {
      const x = Math.floor(Math.random() * 0xFFFFFFFF);
      expect(testLoadbe32V128(x)).equal(toBigEndian(x));
    }
  });

});

function toBigEndian(value: number): number {
  return ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value & 0xFF0000) >>> 8) | ((value & 0xFF000000) >>> 24);
}