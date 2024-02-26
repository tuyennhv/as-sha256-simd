import {itBench} from "@dapplion/benchmark";
import { digest64, hash4Inputs, hash8HashObjects } from "../../src/index.js";
import { byteArrayToHashObject } from "../../src/hashObject.js";

/**
 * Default
  digest64 vs hash4Inputs vs hash8HashObjects
    ✔ digest64 50023 times                                                27.63268 ops/s    36.18903 ms/op   x0.957          7 runs  0.778 s
    ✔ hash 200092 times using hash4Inputs                                 4.879145 ops/s    204.9539 ms/op   x0.962          3 runs   1.24 s
    ✔ hash 200092 times using hash8HashObjects                            5.783024 ops/s    172.9199 ms/op   x0.995          3 runs   1.04 s

  set wInput in javascript, avoid v128 array
  digest64 vs hash4Inputs vs hash8HashObjects
    ✔ digest64 50023 times                                                27.72241 ops/s    36.07190 ms/op   x0.947          7 runs  0.778 s
    ✔ hash 200092 times using hash4Inputs                                 6.371765 ops/s    156.9424 ms/op   x1.556          5 runs   1.44 s

  // set wInput in assemblyscript, avoid v128 array
   digest64 vs hash4Inputs vs hash8HashObjects
    ✔ digest64 50023 times                                                27.62139 ops/s    36.20383 ms/op   x0.951          7 runs  0.780 s
    ✔ hash 200092 times using hash4Inputs                                 7.823883 ops/s    127.8138 ms/op   x1.267          3 runs  0.902 s
    ✔ hash 200092 times using hash8HashObjects                            8.219220 ops/s    121.6660 ms/op   x1.363          3 runs  0.986 s

  // above + switch case getV128()
  digest64 vs hash4Inputs vs hash8HashObjects
    ✔ digest64 50023 times                                                27.29671 ops/s    36.63445 ms/op   x0.962         10 runs  0.868 s
    ✔ hash 200092 times using hash4Inputs                                 8.757761 ops/s    114.1844 ms/op   x1.132          4 runs   1.04 s
    ✔ hash 200092 times using hash8HashObjects                            9.278248 ops/s    107.7790 ms/op   x1.207          3 runs  0.870 s
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