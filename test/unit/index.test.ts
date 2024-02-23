import {expect} from "chai";
import {xor16Inputs, rotrU32, testRotrV128} from "../../src/index.js";

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

});