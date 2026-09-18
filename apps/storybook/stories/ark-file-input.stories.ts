import type { ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { expect, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkFileInput",
  parameters: { layout: "padded" },
  argTypes: {
    label: { control: "text" },
    helper: { control: "text" },
    errorMessage: { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    rounded: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    label: "Certificado",
    helper: "PEM ou PFX de ate 2 MB.",
    errorMessage: "",
    accept: ".pem,.pfx",
    multiple: false,
    disabled: false,
    required: false,
    intent: "primary",
    size: "md",
    rounded: "lg",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  label: string;
  helper: string;
  errorMessage: string;
  accept: string;
  multiple: boolean;
  disabled: boolean;
  required: boolean;
  name?: string;
  intent: ArkIntent;
  size: ArkSize;
  rounded: ArkRounded;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type FileInputEl = HTMLElement & { files: File[]; inputElement: HTMLInputElement; clear: () => void };

function createFileInput(args: Partial<StoryArgs>): FileInputEl {
  const el = document.createElement("ark-file-input") as FileInputEl;
  if (args.label) el.setAttribute("label", args.label);
  if (args.helper) el.setAttribute("helper", args.helper);
  if (args.errorMessage) el.setAttribute("error-message", args.errorMessage);
  if (args.accept) el.setAttribute("accept", args.accept);
  if (args.multiple) el.setAttribute("multiple", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.required) el.setAttribute("required", "");
  if (args.name) el.setAttribute("name", args.name);
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.size) el.setAttribute("size", args.size);
  if (args.rounded) el.setAttribute("rounded", args.rounded);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.style.width = "24rem";
  return el;
}

function fileList(...names: string[]): FileList {
  const transfer = new DataTransfer();
  for (const name of names) transfer.items.add(new File([`conteudo de ${name}`], name, { type: "text/plain" }));
  return transfer.files;
}

function dragEvent(type: string, files?: FileList): DragEvent {
  const transfer = new DataTransfer();
  if (files) for (const file of Array.from(files)) transfer.items.add(file);
  return new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer });
}

function column(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col gap-6";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createFileInput(args)
};

export const States = {
  render: () =>
    column(
      createFileInput({
        label: "Importar colecao",
        helper: "JSON exportado do Arkuest ou do Postman.",
        accept: ".json",
        lang: "pt"
      }),
      createFileInput({ label: "Certificado", errorMessage: "O arquivo precisa ser um .pem ou .pfx.", lang: "pt" }),
      createFileInput({ label: "Anexos", multiple: true, lang: "pt" }),
      createFileInput({ label: "Desabilitado", disabled: true, lang: "pt" })
    )
};

export const Sizes = {
  render: () =>
    column(
      ...(["xs", "sm", "md", "lg", "xl"] as ArkSize[]).map((size) =>
        createFileInput({ label: `Tamanho ${size}`, size, lang: "pt" })
      )
    )
};

// Escolha pelo seletor (simulada no input oculto), soltar na zona com realce, lista, anuncio e change; sem
// multiple o drop fica com o primeiro; FormData leva o arquivo; disabled ignora o drop; erro no aria.
export const SelectsAndDrops = {
  render: () => {
    const form = document.createElement("form");
    form.appendChild(createFileInput({ label: "Certificado", name: "cert", lang: "pt" }));
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-file-input") as FileInputEl;
    const input = host.inputElement;
    const zone = host.querySelector('[data-ark="file-input-zone"]') as HTMLElement;
    const list = host.querySelector('[data-ark="file-input-list"]') as HTMLElement;
    const button = canvas.getByRole("button", { name: "Certificado Escolher arquivo" });
    const changes: File[][] = [];
    host.addEventListener("change", (event) => changes.push((event as CustomEvent<{ files: File[] }>).detail.files));
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";

    await expect(list.textContent).toBe("Nenhum arquivo selecionado");
    await expect((host.querySelector('[data-ark="file-input-label"]') as HTMLLabelElement).htmlFor).toBe(input.id);
    await expect(input.name).toBe("cert");
    await expect(input.hidden).toBe(true);

    // Seletor nativo: o input recebe os arquivos e dispara change.
    input.files = fileList("cliente.pem");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect(changes).toHaveLength(1);
    await expect(changes[0].map((file) => file.name)).toEqual(["cliente.pem"]);
    await expect(list.querySelectorAll('[data-ark="file-input-item"]')).toHaveLength(1);
    await expect(list.textContent).toContain("cliente.pem");
    await waitFor(() => expect(announcer()).toContain("cliente.pem"));
    await expect((new FormData(canvasElement.querySelector("form") as HTMLFormElement).get("cert") as File).name).toBe(
      "cliente.pem"
    );

    // Arrastar: realce enquanto por cima; soltar sem multiple fica com o primeiro.
    const border = getComputedStyle(zone).borderColor;
    zone.dispatchEvent(dragEvent("dragenter"));
    await expect(host).toHaveAttribute("data-ark-dragover");
    await expect(getComputedStyle(zone).borderColor).not.toBe(border);
    zone.dispatchEvent(dragEvent("dragleave"));
    await expect(host).not.toHaveAttribute("data-ark-dragover");
    zone.dispatchEvent(dragEvent("dragenter"));
    zone.dispatchEvent(dragEvent("drop", fileList("a.pfx", "b.pfx")));
    await expect(host).not.toHaveAttribute("data-ark-dragover");
    await expect(host.files.map((file) => file.name)).toEqual(["a.pfx"]);
    await expect(changes).toHaveLength(2);

    host.setAttribute("multiple", "");
    zone.dispatchEvent(dragEvent("drop", fileList("a.pfx", "b.pfx")));
    await expect(host.files.map((file) => file.name)).toEqual(["a.pfx", "b.pfx"]);
    await expect(list.querySelectorAll('[data-ark="file-input-item"]')).toHaveLength(2);
    await waitFor(() => expect(announcer()).toContain("a.pfx, b.pfx"));

    // clear() limpa sem emitir.
    host.clear();
    await expect(host.files).toHaveLength(0);
    await expect(list.textContent).toBe("Nenhum arquivo selecionado");
    await expect(changes).toHaveLength(3);

    // Erro e helper descrevem o botao, que e o controle focavel.
    host.setAttribute("error-message", "Arquivo invalido");
    await expect(button).toHaveAttribute("aria-invalid", "true");
    await expect(button).toHaveAccessibleDescription("Arquivo invalido");
    await expect(host.querySelector('[data-ark="file-input-error"]')).not.toBeNull();
    host.removeAttribute("error-message");
    await expect(button).toHaveAttribute("aria-invalid", "false");

    // Desabilitado: botao e input nativos; o drop e ignorado.
    host.setAttribute("disabled", "");
    await expect(button).toBeDisabled();
    await expect(input.disabled).toBe(true);
    zone.dispatchEvent(dragEvent("dragenter"));
    await expect(host).not.toHaveAttribute("data-ark-dragover");
    zone.dispatchEvent(dragEvent("drop", fileList("x.pem")));
    await expect(host.files).toHaveLength(0);

    // Idioma.
    host.removeAttribute("disabled");
    host.setAttribute("lang", "en");
    await expect(button.textContent?.trim()).toBe("Choose file");
    await expect(list.textContent).toBe("No file selected");
  }
};

export const TestHooks = {
  render: () => createFileInput({ label: "Hooks", helper: "Ajuda", lang: "pt", testid: "meu-arquivo" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const parts = ["", "-label", "-zone", "-button", "-hint", "-list", "-helper"];
    for (const part of parts) {
      await expect(canvasElement.querySelector(`[data-ark="file-input${part}"]`)).toHaveAttribute(
        "data-testid",
        `meu-arquivo${part}`
      );
    }
    await expect(canvasElement.querySelector('[data-ark="file-input"]')?.tagName).toBe("INPUT");
  }
};
