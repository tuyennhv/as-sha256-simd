import {wasmCode} from "./wasmCode.js";

const _module = new WebAssembly.Module(wasmCode);

export interface WasmContext {
  readonly INPUT_LENGTH: number;
  memory: {
    buffer: ArrayBuffer;
  };
  input: {
    value: number;
  };
  output: {
    value: number;
  };

  // init(): void;
  // update(dataPtr: number, dataLength: number): void;
  // final(outPtr: number): void;

  // digest(length: number): void;
  // digest64(inPtr: number, outPtr: number): void;

  sum(): number;
  add(a: number, b: number): number;
}

const importObj = {
  env: {
    // modified from https://github.com/AssemblyScript/assemblyscript/blob/v0.9.2/lib/loader/index.js#L70
    abort: function (msg: number, file: number, line: number, col: number) {
      throw Error(`abort: ${msg}:${file}:${line}:${col}`);
    },
    logValue,
  },
};

export function newInstance(): WasmContext {
  return new WebAssembly.Instance(_module, importObj).exports as unknown as WasmContext;
}

function logValue(value: number): void {
  console.log(value);
}