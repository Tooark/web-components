// As tipagens JSX dos ark-* (jsx-intrinsics.d.ts) são um .d.ts de augmentação global que o tsc não copia nem
// referência: entram no dist e o index.d.ts publicado passa a apontar para elas, então quem importa @tooark/react
// ganha <ark-chart> e companhia tipados no JSX.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

copyFileSync("src/jsx-intrinsics.d.ts", "dist/jsx-intrinsics.d.ts");
const index = readFileSync("dist/index.d.ts", "utf8");
const reference = '/// <reference path="./jsx-intrinsics.d.ts" />\n';
if (!index.startsWith(reference)) writeFileSync("dist/index.d.ts", reference + index);
