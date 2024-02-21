// Since wasm binary data cannot be statically imported into javascript,
// we preprocess the binary data into valid javascript code, a single exportable object.
// which can be statically imported.

import fs from "fs";

const INPUT = "build/release.wasm";
const OUTPUT = "src/wasmCode.ts";

const wasmBinary = Uint8Array.from(fs.readFileSync(INPUT));

const outputString = `// This file was autogenerated by scripts/codegen.ts
// DO NOT modify this file by hand!

// eslint-disable-next-line prettier/prettier
export const wasmCode = Uint8Array.from([${wasmBinary.toString()}]);
`;

fs.writeFileSync(OUTPUT, outputString);
