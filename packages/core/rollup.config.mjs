import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

// Só JavaScript/tipos passam por aqui. O CSS (dist/styles.css) é gerado pelo
// Tailwind CLI a partir de src/styles/index.css — ver o script "build".
const input = "src/index.ts";
const external = ["@tooark/tokens"];

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
