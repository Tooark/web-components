import { expect, userEvent, waitFor, within } from "storybook/test";

// Conferências comuns às stories dos wrappers React, Vue e Angular (não é uma story: o nome do arquivo fica fora do
// glob). Os eventos `ark-*` borbulham, e um wrapper que os repassa sem olhar o alvo entrega ao app o evento de
// qualquer elemento de dentro: o Esc num ark-menu dentro de um diálogo chamava o onClose do diálogo, que o fechava.
//
// A cena, igual nos três frameworks: um diálogo com um [data-child], um <button> "Opções" com o menu dele (um item com
// um [data-child]) e abas `editor` com uma aba fechável "t1" (com um [data-child]); ao lado, uma gaveta e uma paleta,
// cada uma com um [data-child]. Os handlers escrevem `<tag>:open` e `<tag>:close` no log; o das abas,
// `ark-tabs:close:<value>`.

type Overlay = HTMLElement & { show(): void; close(): void };

const OWN_EVENT_TAGS = ["ark-dialog", "ark-drawer", "ark-command-palette", "ark-menu", "ark-tabs"];

function fire(el: Element, type: string): void {
  el.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { value: "t1" } }));
}

export async function expectOwnOverlayEvents(scope: HTMLElement, log: string[]): Promise<void> {
  // Eventos feitos à mão: de um descendente não chegam ao app, do próprio elemento chegam. Nas abas o evento é o da
  // ark-tab filha, que é quem o emite.
  for (const tag of OWN_EVENT_TAGS) {
    const el = scope.querySelector(tag) as HTMLElement;
    const child = el.querySelector("[data-child]") as HTMLElement;
    log.length = 0;
    fire(child, "ark-open");
    fire(child, "ark-close");
    await expect(log, `${tag}: evento de um descendente`).toEqual([]);

    const emitter = tag === "ark-tabs" ? (el.querySelector("ark-tab") as HTMLElement) : el;
    fire(emitter, "ark-open");
    fire(emitter, "ark-close");
    await expect(log, `${tag}: evento próprio`).toEqual(
      tag === "ark-tabs" ? ["ark-tabs:close:t1"] : [`${tag}:open`, `${tag}:close`]
    );
  }

  // Os eventos de verdade: o menu abre e fecha e a aba pede para fechar dentro do diálogo, sem que ele ouça.
  const dialog = scope.querySelector("ark-dialog") as Overlay;
  const menu = dialog.querySelector("ark-menu") as HTMLElement;
  log.length = 0;
  dialog.show();
  await waitFor(() => expect(log).toEqual(["ark-dialog:open"]));

  await userEvent.click(within(dialog).getByText("Opções"));
  await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
  await userEvent.click(dialog.querySelector('[data-ark="tab-close"]') as HTMLElement);
  await expect(log).toEqual(["ark-dialog:open", "ark-menu:open", "ark-menu:close", "ark-tabs:close:t1"]);
  await expect(dialog).toHaveAttribute("open");

  dialog.close();
  await waitFor(() => expect(dialog).not.toHaveAttribute("data-ark-state"));
  await expect(log.at(-1)).toBe("ark-dialog:close");
}

// O mesmo defeito nos outros wrappers cujo elemento recebe conteúdo do app: o componente cabe dentro de si mesmo (um
// ark-split-pane num painel de outro) ou de outro que emite um evento de mesmo nome (o `ark-toggle` de um ark-tree
// dentro de um ark-nav-group).
//
// A cena: um split-pane com um [data-child] num painel e outro split-pane vertical no outro (o handler dele escreve
// `inner:ark-resize`); um carrossel com um [data-child] num slide; um nav com um grupo expansível aberto e, dentro
// dele, uma árvore com um ramo `src` e um [data-child]; um data-view com um [data-child] em `slot="toolbar"`. Os
// handlers escrevem `<tag>:<evento>`.
const CONTAINER_EVENTS: Array<[string, string[]]> = [
  ["ark-split-pane", ["ark-resize"]],
  ["ark-carousel", ["ark-slide-change"]],
  ["ark-nav", ["ark-collapse"]],
  ["ark-nav-group", ["ark-toggle"]],
  ["ark-tree", ["ark-toggle", "ark-selection-change", "ark-activate"]],
  ["ark-data-view", ["ark-query-change", "ark-view-change", "ark-row-click", "ark-selection-change", "ark-reorder"]]
];

export async function expectOwnContainerEvents(scope: HTMLElement, log: string[]): Promise<void> {
  for (const [tag, events] of CONTAINER_EVENTS) {
    const el = scope.querySelector(tag) as HTMLElement;
    const child = el.querySelector("[data-child]") as HTMLElement;
    log.length = 0;
    for (const type of events) fire(child, type);
    await expect(log, `${tag}: evento de um descendente`).toEqual([]);

    for (const type of events) fire(el, type);
    await expect(log, `${tag}: evento próprio`).toEqual(events.map((type) => `${tag}:${type}`));
  }

  // Os eventos de verdade: redimensionar o painel de dentro não chama o onResize do de fora (que gravaria os tamanhos
  // do outro), e abrir um ramo da árvore não chama o onToggle do grupo do nav.
  log.length = 0;
  const handle = scope.querySelector('ark-split-pane ark-split-pane > [data-ark-chrome="handle"]') as HTMLElement;
  handle.focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect(log).toEqual(["inner:ark-resize"]);

  log.length = 0;
  await userEvent.click(scope.querySelector('ark-nav-group [data-ark="tree-item-toggle"]') as HTMLElement);
  await waitFor(() => expect(log).toEqual(["ark-tree:ark-toggle"]));
}
