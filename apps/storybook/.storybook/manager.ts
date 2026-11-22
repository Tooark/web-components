// Marca Tooark na sidebar do manager. Sem `base`, o tema herda o esquema de cores do sistema (o manager do
// Storybook segue prefers-color-scheme) e o logo em public/tooark-logo.svg troca de cor pela mesma media query.
// O título da aba não sai daqui (`brandTitle` não vira o <title>): quem o troca é o manager-head.html.
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";
import { version } from "../../../package.json";

// Com `brandTitle` e sem `brandImage`, o manager desenha o título como HTML (é o único jeito de pôr algo ao lado do
// logo): o logo, com os limites que o manager dá ao `brandImage` (150 × 100 px), e a versão do package.json raiz, a
// que o release publica. O `alt` do logo continua nomeando o link.
const logo =
  '<img src="./tooark-logo.svg" alt="Tooark Web Components"' +
  ' style="display:block;min-width:0;max-width:150px;max-height:100px">';
const label =
  '<span style="flex:none;font-size:11px;font-weight:600;line-height:1;opacity:0.7;white-space:nowrap">' +
  `v${version}</span>`;
const brand = `<span style="display:flex;align-items:center;gap:8px;min-width:0">${logo}${label}</span>`;

addons.setConfig({
  theme: create({
    brandTitle: brand,
    brandUrl: "https://tooark.com",
    brandTarget: "_self"
  })
});
