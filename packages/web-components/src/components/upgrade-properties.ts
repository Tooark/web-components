// Um framework (ou o app) pode gravar uma propriedade no elemento antes de registerTooark*() defini-lo: sem a classe,
// `el.rows = x` vira uma propriedade própria do nó, que depois do upgrade esconde o setter da classe e o valor nunca
// chega ao componente. Ao conectar, toda propriedade própria que tem setter na classe é retirada e regravada por ele,
// na ordem em que foi gravada. Os campos da própria classe e o que os frameworks penduram no nó (chaves internas do
// React e do Vue) não têm setter e ficam como estão.

/** Reaplica pelo setter da classe as propriedades gravadas no nó antes de o elemento ser registrado. */
export function upgradeProperties(element: HTMLElement): void {
  const target = element as unknown as Record<string, unknown>;
  for (const name of Object.keys(element)) {
    if (!hasSetter(Object.getPrototypeOf(element), name)) continue;
    const value = target[name];
    delete target[name];
    target[name] = value;
  }
}

// Procura o acessor na cadeia de protótipos até o HTMLElement: as propriedades nativas nunca viram propriedade própria,
// porque o nó já é um HTMLElement antes do registro.
function hasSetter(prototype: object | null, name: string): boolean {
  for (let proto = prototype; proto && proto !== HTMLElement.prototype; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (descriptor) return typeof descriptor.set === "function";
  }
  return false;
}
