import { expect, waitFor } from "storybook/test";

/** Registros e colunas do data-view da cena: a coluna `name` é o cabeçalho da linha. */
export const OPT_IN_ROWS = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Bruno" }
];
export const OPT_IN_COLUMNS = [
  { key: "name", label: "Nome", rowHeader: true },
  { key: "id", label: "Código" }
];

/**
 * Confere os atributos opt-in da 1.10.0 renderizados por um wrapper (React, Vue ou Angular), na mesma cena nos três:
 * cada prop nova chega ao elemento e produz o efeito dela.
 */
export async function expectOptInAttributes(canvasElement: HTMLElement, rejects: string[]): Promise<void> {
  const textarea = canvasElement.querySelector("ark-textarea") as HTMLElement;
  await waitFor(() => expect(textarea).toHaveAttribute("max-rows", "4"));
  await expect((textarea.querySelector("textarea") as HTMLTextAreaElement).style.maxHeight).not.toBe("");

  const toggle = canvasElement.querySelector("ark-switch") as HTMLElement;
  await expect(toggle).toHaveAttribute("label-position", "start");
  const helper = toggle.querySelector('[data-ark="switch-helper"]') as HTMLElement;
  await expect(helper).toHaveTextContent("Um resumo por dia.");
  await expect(toggle.querySelector('[role="switch"]')).toHaveAttribute("aria-describedby", helper.id);

  const view = canvasElement.querySelector("ark-data-view") as HTMLElement;
  await waitFor(() => expect(view.querySelectorAll('tbody th[scope="row"]')).toHaveLength(2));
  await expect(view.querySelector('tbody th[scope="row"]')).toHaveTextContent("Ana");

  // O data-view acima tem botões próprios: o da cena é o de texto "Executar".
  const button = Array.from(canvasElement.querySelectorAll("ark-button")).find(
    (el) => el.textContent?.trim() === "Executar"
  ) as HTMLElement;
  await expect(button).toHaveAttribute("soft-disabled", "");
  await expect(button).toHaveAttribute("aria-disabled", "true");
  await expect(button).toHaveAttribute("tabindex", "0");

  const picker = canvasElement.querySelector("ark-datepicker") as HTMLElement;
  await expect(picker).toHaveAttribute("full-width", "");
  const field = picker.querySelector("ark-input") as HTMLElement;
  await waitFor(() => expect(field).toHaveAttribute("label", "Prazo"));
  await expect(field).toHaveAttribute("required", "");
  await expect(field).toHaveAttribute("error-message", "Obrigatório");
  await expect(field).toHaveAttribute("size", "sm");

  // O ark-reject chega ao handler do wrapper (onReject, @ark-reject, (arkReject)), com o motivo.
  const upload = canvasElement.querySelector("ark-file-input") as HTMLElement;
  await expect(upload).toHaveAttribute("strict-accept", "");
  await expect(upload).toHaveAttribute("max-size", "1024");
  await expect(upload).toHaveAttribute("transient", "");
  const transfer = new DataTransfer();
  transfer.items.add(new File(["x"], "nota.txt", { type: "text/plain" }));
  transfer.items.add(new File([new Uint8Array(2048)], "grande.png", { type: "image/png" }));
  upload
    .querySelector('[data-ark="file-input-zone"]')!
    .dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  await waitFor(() => expect(rejects).toEqual(["accept:nota.txt", "size:grande.png"]));
}

/** Registra um ark-reject no formato que a cena confere. */
export function rejectEntry(event: Event): string {
  const { files, reason } = (event as CustomEvent<{ files: File[]; reason: string }>).detail;
  return `${reason}:${files.map((file) => file.name).join(",")}`;
}
