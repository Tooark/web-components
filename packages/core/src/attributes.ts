// Coerção de valores que chegam a setters booleanos dos componentes: os
// frameworks passam o valor do atributo como propriedade quando o accessor
// existe (React 19), então "" é presente e "false" é ausente.

/**
 * Converte o que um framework entrega a um setter booleano no valor do atributo: `true` e `""` (atributo presente)
 * ligam; `false`, `"false"`, `null` e `undefined` desligam; qualquer outra string liga, como no DOM.
 */
export function coerceBooleanAttr(value: unknown): boolean {
  if (value === "" || value === true) return true;
  if (value === false || value === null || value === undefined || value === "false") return false;
  return Boolean(value);
}
