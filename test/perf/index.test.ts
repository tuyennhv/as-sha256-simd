import {itBench} from "@dapplion/benchmark";
import { digest64, hash4Inputs } from "../../src/index.js";

/**
 * Feb 24 it shows hash4Inputs() is 2.89x faster than digest64() since it can hash 4 inputs at the same time (x4 for ops/s below)
 * digest64 vs hash4Inputs
    ✔ digest64 50023 times                                                27.48986 ops/s    36.37705 ms/op   x1.002         10 runs  0.892 s
    ✔ hash50023 times using hash4Inputs                                   19.87783 ops/s    50.30730 ms/op   x0.989          6 runs  0.810 s
 */
describe("digest64 vs hash4Inputs", function () {
  this.timeout(0);

  const input = Buffer.from("gajindergajindergajindergajindergajindergajindergajindergajinder", "utf8");
  // total number of time running hash for 200000 balances
  const iterations = 50023;
  itBench(`digest64 ${iterations} times`, () => {
    for (let j = 0; j < iterations; j++) digest64(input);
  });

  // hash4Inputs do 4 sha256 in parallel
  const iterations2 = Math.floor(iterations / 4);
  itBench(`hash${iterations} times using hash4Inputs`, () => {
    for (let j = 0; j < iterations2; j++) hash4Inputs(input, input, input, input);
  });
});