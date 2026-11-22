// Nível do título próprio dos componentes que criam um (ark-card, ark-dialog, ark-drawer, ark-empty), pelo atributo
// `heading-level`, para o título entrar na hierarquia da página.

/** Tag do título pelo atributo `heading-level` (1 a 6); fora disso, o nível padrão do componente. */
export function headingTag(host: Element, fallback: number): string {
  const level = Number(host.getAttribute("heading-level"));
  return `h${Number.isInteger(level) && level >= 1 && level <= 6 ? level : fallback}`;
}

/**
 * Devolve o título no tag pedido: o mesmo nó quando já está nele; senão um novo, no mesmo lugar, com os mesmos
 * atributos (id do aria-labelledby, classes, hooks de teste) e o mesmo conteúdo.
 */
export function retagHeading(el: HTMLHeadingElement, tag: string): HTMLHeadingElement {
  if (el.localName === tag) return el;
  const next = document.createElement(tag) as HTMLHeadingElement;
  for (const attr of Array.from(el.attributes)) next.setAttribute(attr.name, attr.value);
  next.append(...Array.from(el.childNodes));
  el.replaceWith(next);
  return next;
}
