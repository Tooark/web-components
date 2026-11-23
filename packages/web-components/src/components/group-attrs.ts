// Propagação dos atributos de um grupo aos filhos (ark-button-group, ark-radio-group). O atributo do grupo, quando
// existe, vale sobre o do filho: os wrappers Vue e Angular sempre gravam o padrão no filho (`size="md"`), então "o do
// filho vence" nunca propagaria por eles. O que o filho tinha fica guardado e volta quando o grupo perde o atributo
// ou o filho sai do grupo.

type Stamp = { written: string; previous: string | null };

const stamps = new WeakMap<Element, Map<string, Stamp>>();

/**
 * Grava em `child` o valor do grupo para `name` (só quando muda) e guarda o que o filho tinha. Com `value` null
 * devolve ao filho o valor guardado, a menos que o app tenha regravado o atributo depois do grupo.
 */
export function stampGroupAttr(child: Element, name: string, value: string | null): void {
  let own = stamps.get(child);
  const stamp = own?.get(name);
  const current = child.getAttribute(name);

  if (value === null) {
    if (!own || !stamp) return;
    own.delete(name);
    if (current !== stamp.written) return;
    if (stamp.previous === null) {
      child.removeAttribute(name);
    } else {
      child.setAttribute(name, stamp.previous);
    }
    return;
  }

  if (!stamp) {
    // O filho já tem o valor do grupo por conta própria: nada a escrever nem a devolver depois.
    if (current === value) return;
    if (!own) {
      own = new Map();
      stamps.set(child, own);
    }
    own.set(name, { written: value, previous: current });
  } else {
    // Regravado pelo app depois do grupo: esse passa a ser o valor do filho.
    if (current !== stamp.written) stamp.previous = current;
    stamp.written = value;
  }
  if (current !== value) child.setAttribute(name, value);
}

/** Devolve a `child` tudo o que o grupo gravou nele (o filho saiu do grupo). */
export function releaseGroupAttrs(child: Element): void {
  const own = stamps.get(child);
  if (!own) return;
  for (const name of Array.from(own.keys())) stampGroupAttr(child, name, null);
  stamps.delete(child);
}
