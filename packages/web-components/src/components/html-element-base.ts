// Base dos Custom Elements que também carrega fora do navegador. No SSR (Node, Angular SSR, Next, Nuxt) não existe
// HTMLElement, e um `extends HTMLElement` no topo do módulo derrubaria o import de quem só renderiza o HTML; lá a
// base é uma classe vazia, e os elementos só passam a existir no cliente, quando registerTooark*() os define.

/** `HTMLElement` no navegador; fora dele, uma classe vazia para o módulo poder ser importado no servidor. */
export const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;
