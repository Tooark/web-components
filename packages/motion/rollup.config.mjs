import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";
const external = ["@tooark/tokens", "@tooark/core", "motion"];

export default [
  {
    input,
    output: [
      { file: "dist/index.js", format: "esm", sourcemap: true },
      { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "named" }
    ],
    plugins: [
      resolve({ extensions: [".js", ".ts"] }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: "dist",
        declaration: false,
        declarationMap: false,
        declarationDir: undefined
      })
    ],
    external
  },
  {
    input,
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external
  }
];
