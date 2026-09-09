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
 *
 * Quando o elemento principal é o PRÓPRIO host (ark-button, ark-toggle...), um
 * componente pai pode já ter marcado esse host como parte sua (ex.: o
 * ark-scheduler marca cada ark-toggle como `scheduler-view-<view>`). Nesse caso
 * o hook do pai tem precedência: o host só recebe o próprio `data-ark` se ainda
 * não tiver um, e nunca apaga um `data-testid` que não foi ele quem pôs.
 */
export function applyTestHooks (host: HTMLElement, component: string, el: Element, part?: string): void {
  const suffix = part ? `-${part}` : "";
  const isHost = el === host;

  if (!isHost || !el.hasAttribute("data-ark")) {
    el.setAttribute("data-ark", `${component}${suffix}`);
  }

  const testid = host.getAttribute("testid");
  if (testid) {
    el.setAttribute("data-testid", `${testid}${suffix}`);
  } else if (!isHost) {
    el.removeAttribute("data-testid");
  }
}
