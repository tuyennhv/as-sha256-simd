import {expect} from "chai";
import {add, sum} from "../../src/index.js";

describe("Test assemblyscript", () => {
  it("add", () => {
    const result = add(1, 2);
    expect(result).equal(1 + 1 + 2 + 1);
  });

  it("sum", () => {
    const input = Array.from({length: 512}, () => 1);
    expect(sum(new Uint8Array(input))).equal(512);
  });
});