import {itBench} from "@dapplion/benchmark";
import { digest64, hash4Inputs, hash8HashObjects } from "../../src/index.js";
import { byteArrayToHashObject } from "../../src/hashObject.js";

/**
 * Feb 25 it shows hash4Inputs() and hash8HashObjects are slower than digest64() (tested with less iterations)
 * digest64 vs hash4Inputs
    ✔ digest64 50023 times                                                27.48986 ops/s    36.37705 ms/op   x1.002         10 runs  0.892 s
    ✔ hash50023 times using hash4Inputs                                   19.87783 ops/s    50.30730 ms/op   x0.989          6 runs  0.810 s
 */
describe("digest64 vs hash4Inputs vs hash8HashObjects", function () {
  this.timeout(0);

  const input = Buffer.from("gajindergajindergajindergajindergajindergajindergajindergajinder", "utf8");
  // total number of time running hash for 200000 balances
  const iterations = 50023;
  itBench(`digest64 ${iterations} times`, () => {
    for (let j = 0; j < iterations; j++) digest64(input);
  });

  // hash4Inputs do 4 sha256 in parallel
  const iterations2 = Math.floor(iterations / 4);
  itBench(`hash ${iterations} times using hash4Inputs`, () => {
    for (let j = 0; j < iterations2; j++) hash4Inputs(input, input, input, input);
  });

  const hashObject = byteArrayToHashObject(Buffer.from("gajindergajindergajindergajinder", "utf8"));
  const hashInputs = Array.from({length: 8}, () => hashObject);
  // hash8HashObjects do 4 sha256 in parallel
  itBench(`hash ${iterations} times using hash8HashObjects`, () => {
    for (let j = 0; j < iterations2; j++) hash8HashObjects(hashInputs);
  });
});