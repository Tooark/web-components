import { expect, userEvent, waitFor, within } from "storybook/test";

// Conferência comum às stories dos wrappers React, Vue e Angular (não é uma story: o nome do arquivo fica fora do
// glob). `ark-open` e `ark-close` borbulham, e um wrapper que os repassa sem olhar o alvo entrega ao app o evento de
// qualquer overlay de dentro: o Esc num ark-menu dentro de um diálogo chamava o onClose do diálogo, que o fechava.
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
