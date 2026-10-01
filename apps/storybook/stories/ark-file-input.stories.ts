import type { ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { expect, spyOn, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkFileInput",
  parameters: { layout: "padded" },
  argTypes: {
    label: { control: "text" },
    helper: { control: "text" },
    errorMessage: { control: "text" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    directory: { control: "boolean" },
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
    directory: false,
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
  directory: boolean;
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

type FileInputEl = HTMLElement & {
  files: File[];
  paths: string[];
  directory: boolean;
  inputElement: HTMLInputElement;
  clear: () => void;
};

function createFileInput(args: Partial<StoryArgs>): FileInputEl {
  const el = document.createElement("ark-file-input") as FileInputEl;
  if (args.label) el.setAttribute("label", args.label);
  if (args.helper) el.setAttribute("helper", args.helper);
  if (args.errorMessage) el.setAttribute("error-message", args.errorMessage);
  if (args.accept) el.setAttribute("accept", args.accept);
  if (args.multiple) el.setAttribute("multiple", "");
  if (args.directory) el.setAttribute("directory", "");
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

type FolderSpec = { folder: string; files?: File[]; folders?: FolderSpec[]; delay?: number };

function fileEntry(file: File): object {
  return { name: file.name, isFile: true, isDirectory: false, file: (ok: (file: File) => void) => ok(file) };
}

// Entrada de diretório como a do navegador: readEntries devolve lotes (aqui de 2) e um lote vazio no fim.
function folderEntry(spec: FolderSpec): object {
  const children = [...(spec.folders ?? []).map(folderEntry), ...(spec.files ?? []).map(fileEntry)];
  return {
    name: spec.folder,
    isFile: false,
    isDirectory: true,
    createReader: () => {
      let offset = 0;
      return {
        readEntries: (ok: (batch: object[]) => void) => {
          const batch = children.slice(offset, offset + 2);
          offset += batch.length;
          if (spec.delay) setTimeout(() => ok(batch), spec.delay);
          else ok(batch);
        }
      };
    }
  };
}

// Um drop com pasta não se monta com DataTransfer (a entrada de diretório só existe num arrasto real): o evento
// leva um dataTransfer falso com a forma que o componente lê, items com webkitGetAsEntry e getAsFile.
function dropEntries(zone: HTMLElement, ...entries: Array<File | FolderSpec>): void {
  const items = entries.map((entry) => ({
    kind: "file",
    webkitGetAsEntry: () => (entry instanceof File ? fileEntry(entry) : folderEntry(entry)),
    getAsFile: () => (entry instanceof File ? entry : new File([], entry.folder))
  }));
  const event = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: { items, files: [] } });
  zone.dispatchEvent(event);
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
      createFileInput({
        label: "Pasta da colecao",
        helper: "A pasta inteira, com as subpastas.",
        directory: true,
        lang: "pt"
      }),
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
    const details: string[][] = [];
    host.addEventListener("change", (event) => {
      changes.push((event as CustomEvent<{ files: File[] }>).detail.files);
      details.push(Object.keys((event as CustomEvent).detail));
    });
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";

    await expect(list.textContent).toBe("Nenhum arquivo selecionado");
    await expect((host.querySelector('[data-ark="file-input-label"]') as HTMLLabelElement).htmlFor).toBe(input.id);
    await expect(input.name).toBe("cert");
    await expect(input.hidden).toBe(true);
    // Sem `directory`: seletor de arquivo, um só.
    await expect(input).not.toHaveAttribute("webkitdirectory");
    await expect(input.multiple).toBe(false);

    // Seletor nativo: o input recebe os arquivos e dispara change.
    input.files = fileList("cliente.pem");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect(changes).toHaveLength(1);
    await expect(changes[0].map((file) => file.name)).toEqual(["cliente.pem"]);
    await expect(details[0]).toEqual(["files"]);
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

// Uma pasta solta não entra como arquivo: fica de fora com aviso na lista e anúncio; os arquivos soltos junto
// seguem; só pastas não mexe na seleção nem emite `change`. O aviso some na próxima seleção e no clear().
export const RejectsDroppedFolder = {
  render: () => createFileInput({ label: "Anexos", multiple: true, lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-file-input") as FileInputEl;
    const zone = host.querySelector('[data-ark="file-input-zone"]') as HTMLElement;
    const list = host.querySelector('[data-ark="file-input-list"]') as HTMLElement;
    const rejected = () => list.querySelector('[data-ark="file-input-rejected"]');
    const changes: string[][] = [];
    host.addEventListener("change", (event) =>
      changes.push((event as CustomEvent<{ files: File[] }>).detail.files.map((file) => file.name))
    );
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";
    const [a, b] = Array.from(fileList("a.txt", "b.txt"));

    dropEntries(zone, { folder: "colecao" });
    await expect(changes).toHaveLength(0);
    await expect(host.files).toHaveLength(0);
    await expect(rejected()).toHaveTextContent("Pastas não são aceitas");
    await expect(list.textContent).toContain("Nenhum arquivo selecionado");
    await waitFor(() => expect(announcer()).toContain("Pastas não são aceitas"));

    dropEntries(zone, a, { folder: "colecao" }, b);
    await expect(changes).toEqual([["a.txt", "b.txt"]]);
    await expect(list.querySelectorAll('[data-ark="file-input-item"]')).toHaveLength(2);
    await expect(rejected()).not.toBeNull();
    await waitFor(() => expect(announcer()).toContain("a.txt, b.txt. Pastas não são aceitas"));

    // Só pastas: a seleção anterior fica.
    dropEntries(zone, { folder: "outra" });
    await expect(host.files.map((file) => file.name)).toEqual(["a.txt", "b.txt"]);
    await expect(changes).toHaveLength(1);

    // O aviso some na próxima seleção (seletor ou drop só de arquivos) e no clear().
    host.inputElement.files = fileList("c.txt");
    host.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    await expect(rejected()).toBeNull();
    dropEntries(zone, { folder: "colecao" });
    await expect(rejected()).not.toBeNull();
    zone.dispatchEvent(dragEvent("drop", fileList("d.txt")));
    await expect(rejected()).toBeNull();
    await expect(host.files.map((file) => file.name)).toEqual(["d.txt"]);
    dropEntries(zone, { folder: "colecao" });
    host.clear();
    await expect(rejected()).toBeNull();
  }
};

// `directory`: o seletor abre em modo pasta (webkitdirectory, com multiple para o navegador que não tem o modo),
// uma pasta solta é lida até o fim, com as subpastas, e `change` leva files e paths; a lista é um resumo e o anúncio
// também. Arquivos soltos entram com o próprio nome. Tirar o atributo devolve o campo de arquivo.
export const DirectorySelectsAndDrops = {
  render: () => createFileInput({ label: "Pasta da colecao", directory: true, lang: "pt", testid: "pasta" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-file-input") as FileInputEl;
    const input = host.inputElement;
    const zone = host.querySelector('[data-ark="file-input-zone"]') as HTMLElement;
    const list = host.querySelector('[data-ark="file-input-list"]') as HTMLElement;
    const button = canvas.getByRole("button", { name: "Pasta da colecao Escolher pasta" });
    const changes: Array<{ files: File[]; paths?: string[] }> = [];
    host.addEventListener("change", (event) => changes.push((event as CustomEvent).detail));
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";
    const file = (name: string) => new File([`conteudo de ${name}`], name, { type: "text/plain" });

    await expect(host.directory).toBe(true);
    await expect(input).toHaveAttribute("webkitdirectory");
    await expect(input.multiple).toBe(true);
    await expect(button.textContent?.trim()).toBe("Escolher pasta");
    await expect(host.querySelector('[data-ark="file-input-hint"]')).toHaveTextContent(
      "ou arraste e solte uma pasta aqui"
    );
    await expect(list.textContent).toBe("Nenhuma pasta selecionada");

    // Pasta solta: subpasta e lotes do readEntries lidos até o fim, em ordem de caminho.
    dropEntries(zone, {
      folder: "colecao",
      files: [file("b.bru"), file("a.bru"), file("bruno.json")],
      folders: [{ folder: "auth", files: [file("login.bru")] }]
    });
    await waitFor(() => expect(changes).toHaveLength(1));
    const paths = ["colecao/a.bru", "colecao/auth/login.bru", "colecao/b.bru", "colecao/bruno.json"];
    await expect(changes[0].paths).toEqual(paths);
    await expect(changes[0].files.map((item) => item.name)).toEqual(["a.bru", "login.bru", "b.bru", "bruno.json"]);
    await expect(host.paths).toEqual(paths);
    await expect(input.files).toHaveLength(4);

    // A lista é uma linha de resumo, não um item por arquivo.
    const summary = list.querySelector('[data-ark="file-input-summary"]') as HTMLElement;
    await expect(summary).toHaveAttribute("data-testid", "pasta-summary");
    await expect(summary.textContent).toMatch(/^colecao4 arquivo\(s\) · \d+ B$/);
    await expect(list.querySelectorAll('[data-ark="file-input-item"]')).toHaveLength(0);
    await waitFor(() => expect(announcer()).toContain("colecao, 4 arquivo(s)"));

    // Duas pastas: sem nome único no resumo. Arquivo solto junto entra com o próprio nome.
    dropEntries(
      zone,
      { folder: "a", files: [file("1.txt")] },
      { folder: "b", files: [file("2.txt")] },
      file("solto.txt")
    );
    await waitFor(() => expect(changes).toHaveLength(2));
    await expect(changes[1].paths).toEqual(["a/1.txt", "b/2.txt", "solto.txt"]);
    await expect(list.textContent).toMatch(/^3 arquivo\(s\) · \d+ B$/);
    await expect(list.querySelector('[data-ark="file-input-rejected"]')).toBeNull();

    // Seletor: o caminho vem do webkitRelativePath; onde o navegador não tem modo pasta chegam arquivos soltos.
    input.files = fileList("x.bru", "y.bru");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect(changes).toHaveLength(3);
    await expect(changes[2].paths).toEqual(["x.bru", "y.bru"]);
    await expect(list.textContent).toMatch(/^2 arquivo\(s\) · \d+ B$/);

    // Uma seleção que chega enquanto a pasta ainda é lida vence: a leitura atrasada é descartada.
    dropEntries(zone, { folder: "lenta", files: [file("tarde.txt")], delay: 60 });
    input.files = fileList("agora.txt");
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 250));
    await expect(changes).toHaveLength(4);
    await expect(host.paths).toEqual(["agora.txt"]);

    // Pasta vazia: seleção vazia.
    dropEntries(zone, { folder: "vazia" });
    await waitFor(() => expect(changes).toHaveLength(5));
    await expect(changes[4]).toEqual({ files: [], paths: [] });
    await expect(list.textContent).toBe("Nenhuma pasta selecionada");
    await waitFor(() => expect(announcer()).toContain("Nenhuma pasta selecionada"));

    // Sem o atributo volta a ser o campo de arquivo: pasta recusada e detail só com files.
    host.directory = false;
    await expect(input).not.toHaveAttribute("webkitdirectory");
    await expect(input.multiple).toBe(false);
    await expect(button.textContent?.trim()).toBe("Escolher arquivo");
    await expect(list.textContent).toBe("Nenhum arquivo selecionado");
    dropEntries(zone, { folder: "colecao", files: [file("a.bru")] });
    await expect(list.querySelector('[data-ark="file-input-rejected"]')).not.toBeNull();
    await expect(changes).toHaveLength(5);
  }
};

// Teclado e toque chegam ao seletor pelo botão do componente, que é um <button> de verdade e chama o click() do
// input oculto: Enter, Espaço e o clique (o toque) abrem o seletor, de arquivo ou de pasta.
export const OpensPickerFromButton = {
  render: () =>
    column(
      createFileInput({ label: "Arquivo", lang: "pt" }),
      createFileInput({ label: "Pasta", directory: true, lang: "pt" })
    ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const hosts = Array.from(canvasElement.querySelectorAll("ark-file-input")) as FileInputEl[];
    const names = ["Arquivo Escolher arquivo", "Pasta Escolher pasta"];
    for (const [index, host] of hosts.entries()) {
      // O seletor nativo não abre num teste: o click() do input é espionado.
      const open = spyOn(host.inputElement, "click").mockImplementation(() => {});
      const button = canvas.getByRole("button", { name: names[index] });
      await expect(button.tabIndex).toBe(0);
      await expect(host.inputElement.tabIndex).toBe(-1);

      button.focus();
      await userEvent.keyboard("{Enter}");
      await expect(open).toHaveBeenCalledTimes(1);
      await userEvent.keyboard(" ");
      await expect(open).toHaveBeenCalledTimes(2);
      await userEvent.click(button);
      await expect(open).toHaveBeenCalledTimes(3);
      open.mockRestore();
    }
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
