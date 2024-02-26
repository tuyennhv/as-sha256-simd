import {itBench} from "@dapplion/benchmark";
import { digest64, hash4Inputs, hash8HashObjects } from "../../src/index.js";
import { byteArrayToHashObject } from "../../src/hashObject.js";

/**
  digest64 vs hash4Inputs vs hash8HashObjects
    ✔ digest64 50023 times                                                27.63268 ops/s    36.18903 ms/op   x0.957          7 runs  0.778 s
    ✔ hash 200092 times using hash4Inputs                                 4.879145 ops/s    204.9539 ms/op   x0.962          3 runs   1.24 s
    ✔ hash 200092 times using hash8HashObjects                            5.783024 ops/s    172.9199 ms/op   x0.995          3 runs   1.04 s
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
  itBench(`hash ${iterations * 4} times using hash4Inputs`, () => {
    for (let j = 0; j < iterations; j++) hash4Inputs(input, input, input, input);
  });

  const hashObject = byteArrayToHashObject(Buffer.from("gajindergajindergajindergajinder", "utf8"));
  const hashInputs = Array.from({length: 8}, () => hashObject);
  // hash8HashObjects do 4 sha256 in parallel
  itBench(`hash ${iterations * 4} times using hash8HashObjects`, () => {
    for (let j = 0; j < iterations; j++) hash8HashObjects(hashInputs);
  });
});