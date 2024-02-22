import {expect} from "chai";
import {add, xor16Inputs, sum} from "../../src/index.js";

describe("Test assemblyscript", () => {
  it("add", () => {
    const result = add(1, 2);
    expect(result).equal(1 + 1 + 2 + 1);
  });

  it("sum", () => {
    const input = Array.from({length: 512}, () => 1);
    expect(sum(new Uint8Array(input))).equal(512);
  });

  it.only("xor16Inputs", () => {
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

});