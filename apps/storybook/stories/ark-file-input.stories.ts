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
    helper: "PEM ou PFX de até 2 MB.",
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
  for (const name of names) transfer.items.add(new File([`conteúdo de ${name}`], name, { type: "text/plain" }));
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
        label: "Importar coleção",
        helper: "JSON exportado do Arkuest ou do Postman.",
        accept: ".json",
        lang: "pt"
      }),
      createFileInput({ label: "Certificado", errorMessage: "O arquivo precisa ser um .pem ou .pfx.", lang: "pt" }),
      createFileInput({ label: "Anexos", multiple: true, lang: "pt" }),
      createFileInput({
        label: "Pasta da coleção",
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

// Escolha pelo seletor (simulada no input oculto), soltar na zona com realce, lista, anúncio e change; sem
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

    // Erro e helper descrevem o botão, que e o controle focável.
    host.setAttribute("error-message", "Arquivo inválido");
    await expect(button).toHaveAttribute("aria-invalid", "true");
    await expect(button).toHaveAccessibleDescription("Arquivo inválido");
    await expect(host.querySelector('[data-ark="file-input-error"]')).not.toBeNull();
    host.removeAttribute("error-message");
    await expect(button).toHaveAttribute("aria-invalid", "false");

    // Desabilitado: botão e input nativos; o drop e ignorado.
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
  render: () => createFileInput({ label: "Pasta da coleção", directory: true, lang: "pt", testid: "pasta" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-file-input") as FileInputEl;
    const input = host.inputElement;
    const zone = host.querySelector('[data-ark="file-input-zone"]') as HTMLElement;
    const list = host.querySelector('[data-ark="file-input-list"]') as HTMLElement;
    const button = canvas.getByRole("button", { name: "Pasta da coleção Escolher pasta" });
    const changes: Array<{ files: File[]; paths?: string[] }> = [];
    host.addEventListener("change", (event) => changes.push((event as CustomEvent).detail));
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";
    const file = (name: string) => new File([`conteúdo de ${name}`], name, { type: "text/plain" });

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

// Num campo estreito (tela de celular) um nome longo é cortado com reticências em vez de estourar a zona, tanto o
// do arquivo quanto o da pasta no resumo.
export const LongNamesFit = {
  render: () => {
    const wrap = column(
      createFileInput({ label: "Arquivo", lang: "pt" }),
      createFileInput({ label: "Pasta", directory: true, lang: "pt" })
    );
    for (const host of Array.from(wrap.children) as HTMLElement[]) host.style.width = "14rem";
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [fileHost, folderHost] = Array.from(canvasElement.querySelectorAll("ark-file-input")) as FileInputEl[];
    const long = "um-nome-bem-comprido-para-testar-o-corte-em-tela-estreita";

    fileHost.inputElement.files = fileList(`${long}.json`);
    fileHost.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    dropEntries(folderHost.querySelector('[data-ark="file-input-zone"]') as HTMLElement, {
      folder: long,
      files: [new File(["a"], "a.bru")]
    });
    await waitFor(() => expect(folderHost.files).toHaveLength(1));

    for (const host of [fileHost, folderHost]) {
      const zone = host.querySelector('[data-ark="file-input-zone"]') as HTMLElement;
      const name = host.querySelector('[data-ark="file-input-list"] li span') as HTMLElement;
      await expect(zone.scrollWidth).toBeLessThanOrEqual(zone.clientWidth);
      await expect(name.textContent).toContain(long);
      await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
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

// Recusas opt-in: `strict-accept` aplica o `accept` também aos arquivos soltos (e ao "todos os arquivos" do seletor),
// `max-size` recusa os grandes nos dois caminhos; cada motivo sai num `ark-reject` e num aviso visível e anunciado, e
// nada aproveitável mantém a seleção sem `change`. `transient` entrega e volta vazio. Sem os atributos, tudo passa.
export const RejectsAndTransient = {
  render: () => {
    const strict = createFileInput({ label: "Imagens", accept: ".png,image/jpeg", multiple: true, lang: "en" });
    strict.dataset.case = "strict";
    strict.setAttribute("strict-accept", "");
    strict.setAttribute("max-size", "1024");
    const loose = createFileInput({ label: "Sem strict", accept: ".png", lang: "en" });
    loose.dataset.case = "loose";
    const transient = createFileInput({ label: "Anexar", multiple: true, lang: "en" });
    transient.dataset.case = "transient";
    transient.setAttribute("transient", "");
    transient.setAttribute("max-size", "1024");
    const folder = createFileInput({ label: "Pasta", directory: true, lang: "en" });
    folder.dataset.case = "folder";
    folder.setAttribute("max-size", "1024");
    return column(strict, loose, transient, folder);
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = (id: string) => canvasElement.querySelector(`ark-file-input[data-case="${id}"]`) as FileInputEl;
    const zone = (id: string) => host(id).querySelector('[data-ark="file-input-zone"]') as HTMLElement;
    const list = (id: string) => host(id).querySelector('[data-ark="file-input-list"]') as HTMLElement;
    const notices = (id: string) =>
      Array.from(list(id).querySelectorAll('[data-ark="file-input-rejected"]')).map((item) => item.textContent);
    const names = (id: string) => host(id).files.map((file) => file.name);
    const file = (name: string, size: number, type: string) => new File([new Uint8Array(size)], name, { type });
    const files = (...items: File[]) => {
      const transfer = new DataTransfer();
      for (const item of items) transfer.items.add(item);
      return transfer.files;
    };
    const pick = (id: string, ...items: File[]) => {
      host(id).inputElement.files = files(...items);
      host(id).inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const log: string[] = [];
    canvasElement.addEventListener("change", (event) => {
      const id = (event.target as HTMLElement).dataset.case;
      log.push(`${id}:change:${(event as CustomEvent<{ files: File[] }>).detail.files.map((f) => f.name).join(",")}`);
    });
    canvasElement.addEventListener("ark-reject", (event) => {
      const { files: rejected, reason } = (event as CustomEvent<{ files: File[]; reason: string }>).detail;
      log.push(`${(event.target as HTMLElement).dataset.case}:${reason}:${rejected.map((f) => f.name).join(",")}`);
    });
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";

    // Soltar: tipo fora do accept e tamanho acima do limite saem, cada motivo num evento e num aviso.
    zone("strict").dispatchEvent(
      dragEvent(
        "drop",
        files(
          file("nota.txt", 10, "text/plain"),
          file("a.png", 10, "image/png"),
          file("b.JPG", 10, "image/jpeg"),
          file("grande.png", 2048, "image/png"),
          // Sem tipo (alguns sistemas entregam vazio): passa pela regra de extensão.
          file("sem-tipo.png", 10, "")
        )
      )
    );
    await expect(names("strict")).toEqual(["a.png", "b.JPG", "sem-tipo.png"]);
    await expect(log).toEqual([
      "strict:accept:nota.txt",
      "strict:size:grande.png",
      "strict:change:a.png,b.JPG,sem-tipo.png"
    ]);
    await expect(notices("strict")).toEqual(["File type not accepted: nota.txt", "Larger than 1.0 KB: grande.png"]);
    await waitFor(() => expect(announcer()).toContain("a.png, b.JPG, sem-tipo.png. File type not accepted: nota.txt"));

    // Só recusados (soltos ou escolhidos): a seleção fica e não há change.
    log.length = 0;
    zone("strict").dispatchEvent(dragEvent("drop", files(file("x.txt", 10, "text/plain"))));
    pick("strict", file("enorme.png", 4096, "image/png"));
    await expect(names("strict")).toEqual(["a.png", "b.JPG", "sem-tipo.png"]);
    await expect(log).toEqual(["strict:accept:x.txt", "strict:size:enorme.png"]);
    await expect(notices("strict")).toEqual(["Larger than 1.0 KB: enorme.png"]);

    // Seletor misto: o grande sai e o resto entra; o tipo também vale no seletor ("todos os arquivos").
    log.length = 0;
    pick("strict", file("c.png", 10, "image/png"), file("d.gif", 10, "image/gif"), file("e.png", 2048, "image/png"));
    await expect(names("strict")).toEqual(["c.png"]);
    await expect(log).toEqual(["strict:accept:d.gif", "strict:size:e.png", "strict:change:c.png"]);

    // A próxima seleção sem recusa, e o clear(), tiram os avisos.
    pick("strict", file("f.png", 10, "image/png"));
    await expect(notices("strict")).toEqual([]);

    // Depois do clear(), um seletor só com recusados deixa a seleção vazia (e não devolve a que foi limpa).
    log.length = 0;
    host("strict").clear();
    pick("strict", file("enorme.png", 4096, "image/png"));
    await expect(names("strict")).toEqual([]);
    await expect(log).toEqual(["strict:size:enorme.png"]);
    await expect(notices("strict")).toEqual(["Larger than 1.0 KB: enorme.png"]);

    // Sem strict-accept, soltar fora do accept continua aceitando, como antes, e não há ark-reject.
    log.length = 0;
    zone("loose").dispatchEvent(dragEvent("drop", files(file("nota.txt", 10, "text/plain"))));
    await expect(names("loose")).toEqual(["nota.txt"]);
    await expect(log).toEqual(["loose:change:nota.txt"]);

    // transient: change com os arquivos, depois o campo vazio e sem lista; o aviso de uma recusa ainda aparece.
    log.length = 0;
    await expect(list("transient").hidden).toBe(true);
    pick("transient", file("r.pdf", 10, "application/pdf"), file("s.pdf", 2048, "application/pdf"));
    await expect(log).toEqual(["transient:size:s.pdf", "transient:change:r.pdf"]);
    await expect(host("transient").files).toHaveLength(0);
    await expect(list("transient").hidden).toBe(false);
    await expect(notices("transient")).toEqual(["Larger than 1.0 KB: s.pdf"]);
    await expect(list("transient").querySelector('[data-ark="file-input-item"]')).toBeNull();
    pick("transient", file("t.pdf", 10, "application/pdf"));
    await expect(host("transient").files).toHaveLength(0);
    await expect(list("transient").hidden).toBe(true);
    await expect(list("transient").textContent).toBe("");

    // Modo pasta: nada é filtrado.
    log.length = 0;
    pick("folder", file("grande.bin", 2048, ""));
    await expect(log).toEqual(["folder:change:grande.bin"]);
  }
};

// `form.reset()` (ou um botão `type="reset"`) esvazia o input oculto sem evento: a lista e a seleção guardada para as
// recusas acompanham, sem `change`, como no input nativo. Um reset cancelado não mexe em nada.
export const FormReset = {
  render: () => {
    const form = document.createElement("form");
    const field = createFileInput({ label: "Anexos", name: "anexos", multiple: true, lang: "en" });
    field.setAttribute("max-size", "1024");
    const reset = document.createElement("button");
    reset.type = "reset";
    reset.textContent = "Limpar";
    form.append(field, reset);
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    const host = canvasElement.querySelector("ark-file-input") as FileInputEl;
    const items = () =>
      Array.from(host.querySelectorAll('[data-ark="file-input-item"]')).map(
        (item) => item.querySelector("span")?.textContent
      );
    const file = (name: string, size: number) => new File([new Uint8Array(size)], name, { type: "application/pdf" });
    const pick = (...picked: File[]) => {
      const transfer = new DataTransfer();
      for (const item of picked) transfer.items.add(item);
      host.inputElement.files = transfer.files;
      host.inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const changes: string[] = [];
    host.addEventListener("change", (event) => {
      changes.push((event as CustomEvent<{ files: File[] }>).detail.files.map((f) => f.name).join(","));
    });

    pick(file("a.pdf", 10), file("b.pdf", 10));
    await expect(items()).toHaveLength(2);

    // Reset cancelado: a seleção e a lista ficam.
    const cancel = (event: Event) => event.preventDefault();
    form.addEventListener("reset", cancel);
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await expect(host.files.map((f) => f.name)).toEqual(["a.pdf", "b.pdf"]);
    await expect(items()).toHaveLength(2);
    form.removeEventListener("reset", cancel);

    // Reset pelo método: o input volta vazio e a lista acompanha, sem change.
    form.reset();
    await waitFor(() => expect(items()).toHaveLength(0));
    await expect(host.files).toHaveLength(0);
    await expect(changes).toEqual(["a.pdf,b.pdf"]);

    // Depois do reset, um seletor só com recusados deixa a seleção vazia (e não devolve a de antes do reset).
    pick(file("grande.pdf", 4096));
    await expect(host.files).toHaveLength(0);
    await expect(items()).toHaveLength(0);

    // Reset pelo botão do formulário, como a pessoa faria.
    pick(file("c.pdf", 10));
    await expect(items()).toHaveLength(1);
    await userEvent.click(within(form).getByRole("button", { name: "Limpar" }));
    await waitFor(() => expect(items()).toHaveLength(0));
    await expect(changes).toEqual(["a.pdf,b.pdf", "c.pdf"]);
  }
};
