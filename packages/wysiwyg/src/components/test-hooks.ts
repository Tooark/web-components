// Mesmos hooks de E2E de @tooark/web-components (este pacote não depende dele): `data-ark` estático em cada parte e,
// com `testid` no host, `data-testid` na parte principal e sufixado nas demais.

/** Marca `el` com `data-ark="<componente>[-parte]"` e, com `testid` no host, `data-testid="<testid>[-parte]"`. */
export function applyTestHooks(host: HTMLElement, component: string, el: Element, part?: string): void {
  const suffix = part ? `-${part}` : "";
  el.setAttribute("data-ark", `${component}${suffix}`);
  const testid = host.getAttribute("testid");
  if (testid) {
    el.setAttribute("data-testid", `${testid}${suffix}`);
  } else {
    el.removeAttribute("data-testid");
  }
}
