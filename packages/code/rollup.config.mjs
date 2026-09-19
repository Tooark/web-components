import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const input = "src/index.ts";
// O CodeMirror fica de fora do bundle: peer dependency, uma única cópia de @codemirror/state por página.
const external = (id) => id === "@tooark/tokens" || id.startsWith("@codemirror/") || id.startsWith("@lezer/");

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
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external
  }
];
