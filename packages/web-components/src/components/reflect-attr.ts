// Setters de propriedades que espelham um atributo de texto. React 19 e Vue gravam a prop como propriedade quando o
// elemento já registrado a expõe, então todo getter de atributo observado precisa de um setter que reflita o valor.

/** Grava `value` no atributo `name`; null/undefined removem o atributo. */
export function reflectAttr(el: Element, name: string, value: unknown): void {
  if (value === null || value === undefined) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, String(value));
  }
}
