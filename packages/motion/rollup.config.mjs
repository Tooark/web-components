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
        declarationDir: undefined,
        // Erro de tipo derruba o build: por padrao o plugin so avisa e o rollup segue.
        noEmitOnError: true
      })
    ],
    external
  },
  {
    input,
    // O mesmo bundle de tipos em .d.ts (import) e .d.cts (require): o TypeScript escolhe pela extensao, e sem o
    // .d.cts um consumidor CommonJS com moduleResolution node16 leria os tipos como ESM.
    output: [
      { file: "dist/index.d.ts", format: "esm" },
      { file: "dist/index.d.cts", format: "esm" }
    ],
    plugins: [dts()],
    external
  }
];
