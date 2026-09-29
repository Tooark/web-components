// Um framework (ou o app) pode gravar uma propriedade no elemento antes de registerTooark*() defini-lo: sem a classe,
// `el.option = x` vira uma propriedade própria do nó, que depois do upgrade esconde o setter da classe e o valor
// nunca chega ao componente. Ao conectar, cada propriedade própria é retirada e regravada pelo setter.

/** Reaplica pelo setter da classe as propriedades gravadas no nó antes de o elemento ser registrado. */
export function upgradeProperties(element: HTMLElement, names: readonly string[]): void {
  const target = element as unknown as Record<string, unknown>;
  for (const name of names) {
    if (!Object.getOwnPropertyDescriptor(element, name)) continue;
    const value = target[name];
    delete target[name];
    target[name] = value;
  }
}
