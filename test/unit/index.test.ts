import {expect} from "chai";
import crypto from "crypto";
import {hash4Inputs, digest64, hash8HashObjects, digest64HashObjects} from "../../src/index.js";
import { byteArrayToHashObject, hashObjectToByteArray } from "../../src/hashObject.js";

describe("Test assemblyscript", () => {

  it("test digest64HashObjects", () => {
    const input1 = "gajindergajindergajindergajinder";
    const input2 = "gajindergajindergajindergajinder";
    const buffer1 = Buffer.from(input1, "utf-8");
    const buffer2 = Buffer.from(input2, "utf-8");
    const obj1 = byteArrayToHashObject(buffer1);
    const obj2 = byteArrayToHashObject(buffer2);

    const hashObjectOutput = digest64HashObjects(obj1, obj2);
    const output = new Uint8Array(32);
    hashObjectToByteArray(hashObjectOutput, output, 0);
    const expectedOutput = new Uint8Array([
      190, 57, 56, 15, 241, 208, 38, 30, 111, 55, 218, 254, 66, 120, 182, 98, 239, 97, 31, 28, 178, 247, 192, 161,
      131, 72, 178, 215, 235, 20, 207, 110,
    ]);

    expect(output).to.be.deep.equal(expectedOutput, "incorrect digest64 result");
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
  });

  it("test digest64 compare to crypto", () => {
    for (let i = 0; i < 1000; i++) {
      const input = crypto.randomBytes(64);
      const output = digest64(input);
      const expectedOutput = crypto.createHash("sha256").update(input).digest();
      expect(output).to.be.deep.equal(expectedOutput, "incorrect digest64 result " + i);
    }
  });

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
      const expectedOutput = digest64(input);
      expect(outputs[0]).to.be.deep.equal(expectedOutput);
      expect(outputs[1]).to.be.deep.equal(expectedOutput);
      expect(outputs[2]).to.be.deep.equal(expectedOutput);
      expect(outputs[3]).to.be.deep.equal(expectedOutput);
    }
  });

  it("testHash4HashObjects", () => {
    const input1 = "gajindergajindergajindergajinder";
    const inputHashObject = byteArrayToHashObject(Buffer.from(input1, "utf8"));
    const outputs = hash8HashObjects(Array.from({length: 8}, () => inputHashObject));
    const expectedOutput = new Uint8Array([
      190, 57, 56, 15, 241, 208, 38, 30, 111, 55, 218, 254, 66, 120, 182, 98, 239, 97, 31, 28, 178, 247, 192, 161,
      131, 72, 178, 215, 235, 20, 207, 110,
    ]);
    for (let i = 0; i < 4; i++) {
      const output = new Uint8Array(32);
      hashObjectToByteArray(outputs[i], output, 0);
      expect(output).to.be.deep.equal(expectedOutput, "incorrect hash4Inputs result " + i);
    }
  });
});
