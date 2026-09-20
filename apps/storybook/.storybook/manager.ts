// Marca Tooark na sidebar do manager. Sem `base`, o tema herda o esquema de cores do sistema (o manager do
// Storybook segue prefers-color-scheme) e o logo em public/tooark-logo.svg troca de cor pela mesma media query.
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    brandTitle: "Tooark Web Components",
    brandUrl: "https://tooark.com",
    brandImage: "./tooark-logo.svg",
    brandTarget: "_self"
  })
});
