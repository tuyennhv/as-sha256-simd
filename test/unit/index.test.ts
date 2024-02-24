import {expect} from "chai";
import crypto from "crypto";
import {rotrU32, testRotrV128, ch, testCh, maj, testMaj, ep0, testEp0, ep1, testEp1, sig0, testSig0, sig1, testSig1, testLoadbe32V128, hash4Inputs, digest64} from "../../src/index.js";

describe("Test assemblyscript", () => {
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

  it("test digest64", () => {
    const input1 = "gajindergajindergajindergajinder";
    const input2 = "gajindergajindergajindergajinder";
    const input = Buffer.from(input1 + input2, "utf8");
    const output = digest64(input);
    const expectedOutput = new Uint8Array([
      190, 57, 56, 15, 241, 208, 38, 30, 111, 55, 218, 254, 66, 120, 182, 98, 239, 97, 31, 28, 178, 247, 192, 161,
      131, 72, 178, 215, 235, 20, 207, 110,
    ]);
    expect(output).to.be.deep.equal(expectedOutput, "incorrect digest64 result");
  })

  it("testHash4Inputs", () => {
    const input1 = "gajindergajindergajindergajinder";
    const input2 = "gajindergajindergajindergajinder";
    const input = Buffer.from(input1 + input2, "utf8");
    const outputs = hash4Inputs(input, input, input, input);
    const expectedOutput = new Uint8Array([
      190, 57, 56, 15, 241, 208, 38, 30, 111, 55, 218, 254, 66, 120, 182, 98, 239, 97, 31, 28, 178, 247, 192, 161,
      131, 72, 178, 215, 235, 20, 207, 110,
    ]);
    for (let i = 0; i < 4; i++) {
      expect(outputs[i]).to.be.deep.equal(expectedOutput, "incorrect hash4Inputs result " + i);
    }
  });

  it("testHash4Inputs 1000 times", () => {
    for (let i = 0; i < 1000; i++) {
      const input = crypto.randomBytes(64);
      const outputs = hash4Inputs(input, input, input, input);
      expect(outputs[0]).to.be.deep.equal(digest64(input));
    }
  });

});

function toBigEndian(value: number): number {
  return ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value & 0xFF0000) >>> 8) | ((value & 0xFF000000) >>> 24);
}