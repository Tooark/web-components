import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";
const external = ["@tooark/tokens", "echarts"];

export default [
  {
    input,
    output: [
      { file: "dist/index.js", format: "esm", sourcemap: true },
      { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "named" }
    ],
    plugins: [resolve({ extensions: [".js", ".ts"] }), commonjs(), typescript({ tsconfig: "./tsconfig.json", useTsconfigDeclarationDir: true })],
    external
  },
  {
    input,
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external
  }
];
