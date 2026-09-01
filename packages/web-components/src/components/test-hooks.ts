/**
 * Hooks de teste e2e dos componentes Ark, em duas camadas:
 *
 * 1. `data-ark` (estático, sem configuração): todo elemento interno criado por um
 *    componente recebe `data-ark="<componente>"` (elemento principal) ou
 *    `data-ark="<componente>-<parte>"`, dando seletores estáveis que não quebram
 *    com mudanças de classes utilitárias. Ex.: `[data-ark="switch-thumb"]`.
 *
 * 2. `data-testid` (por instância): quando o host declara o atributo `testid`,
 *    o valor é propagado para o elemento principal e sufixado nas partes
 *    (`<testid>-<parte>`), no formato que `getByTestId` do Playwright/Cypress/
 *    Testing Library procura por padrão.
 */
export function applyTestHooks (host: HTMLElement, component: string, el: Element, part?: string): void {
  const suffix = part ? `-${part}` : "";
  el.setAttribute("data-ark", `${component}${suffix}`);

  const testid = host.getAttribute("testid");
  if (testid) {
    el.setAttribute("data-testid", `${testid}${suffix}`);
  } else {
    el.removeAttribute("data-testid");
  }
}
