import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

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
      postcss({
        extract: "styles.css",
        config: {
          path: "../../postcss.config.mjs"
        }
      }),
      typescript({ tsconfig: "./tsconfig.json", outDir: "dist", declaration: false, declarationMap: false, declarationDir: undefined })
    ],
    external
  },
  {
    input,
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [...external, /\.css$/]
  }
];
