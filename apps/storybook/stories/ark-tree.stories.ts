import type { ArkSize, ArkTreeIcons, ArkTreeSelection } from "@tooark/core";
import type { ArkTree, ArkTreeItem } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkTree",
  parameters: {
    layout: "padded",
    // A estrutura ARIA (group por aria-owns, sem mover os filhos) é o ponto frágil: aqui uma violação do axe reprova.
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          'Árvore declarativa: o host `ark-tree` é o `role="tree"` e cada `ark-tree-item` é o próprio `treeitem`, com os subitens aninhados onde o app os declarou (um `role="group"` próprio os reúne por `aria-owns`). `label` dá o texto do nó, `slot="icon"` o ícone e `slot="trailing"` badges e ações. `icons="files"` desenha o ícone próprio de pasta ou arquivo nos nós sem `slot="icon"`, `icons="none"` esconde todos, e `icon-color` (um intent, `current` ou uma cor CSS) os pinta; o lado do ícone acompanha o `size`. Sem `selection` a árvore só navega e expande; `selection="single"` seleciona e ativa no clique, `multiple` seleciona vários e `checkboxes` (com `multiple`) marca por caixas, com `propagate` para os descendentes. Teclado do padrão WAI-ARIA (setas, Home, End, `*`, busca por digitação, Enter e Espaço). Eventos `ark-toggle`, `ark-selection-change` e `ark-activate`.'
      }
    }
  },
  argTypes: {
    selection: { control: "inline-radio", options: ["none", "single", "multiple"] },
    checkboxes: { control: "boolean" },
    propagate: { control: "boolean" },
    icons: { control: "inline-radio", options: ["slot", "files", "none"] },
    iconColor: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] }
  },
  args: { selection: "none", checkboxes: false, propagate: false, icons: "files", iconColor: "", size: "md" }
};

export default meta;

type StoryArgs = {
  selection: ArkTreeSelection;
  checkboxes: boolean;
  propagate: boolean;
  /** `slot` é o padrão do componente (sem o atributo): cada nó mostra o `slot="icon"` que a story põe. */
  icons: ArkTreeIcons | "slot";
  iconColor: string;
  size: ArkSize;
  testid?: string;
  /** Sem o `slot="icon"` do app nos nós (para os ícones próprios aparecerem). */
  bare?: boolean;
};

type Node = {
  value: string;
  label: string;
  expanded?: boolean;
  lazy?: boolean;
  disabled?: boolean;
  badge?: string;
  children?: Node[];
};

const FILES: Node[] = [
  {
    value: "src",
    label: "src",
    expanded: true,
    children: [
      { value: "src/index.ts", label: "index.ts" },
      {
        value: "src/components",
        label: "components",
        children: [
          { value: "src/components/button.ts", label: "button.ts" },
          { value: "src/components/tree.ts", label: "tree.ts" }
        ]
      },
      { value: "src/app", label: "app", lazy: true }
    ]
  },
  { value: "docs", label: "docs", children: [{ value: "docs/guide.md", label: "guide.md" }] },
  { value: "README.md", label: "README.md", badge: "M" },
  { value: "LICENSE", label: "LICENSE", disabled: true }
];

// Ícones do app no `slot="icon"`: o lado vem de --ark-tree-icon-size, que o item define por size.
const APP_ICON_STYLE = "width: var(--ark-tree-icon-size); height: var(--ark-tree-icon-size)";
const FOLDER_SVG = `<svg viewBox="0 0 16 16" style="${APP_ICON_STYLE}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.75 4.5c0-.69.56-1.25 1.25-1.25h3l1.5 1.5H13c.69 0 1.25.56 1.25 1.25v6c0 .69-.56 1.25-1.25 1.25H3c-.69 0-1.25-.56-1.25-1.25z"/></svg>`;
const FILE_SVG = `<svg viewBox="0 0 16 16" style="${APP_ICON_STYLE}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 1.75h5L12.25 5v8c0 .69-.56 1.25-1.25 1.25H4c-.69 0-1.25-.56-1.25-1.25V3c0-.69.56-1.25 1.25-1.25z"/><path d="M5.5 8h5M5.5 10.5h5"/></svg>`;

function createNode(node: Node, bare = false): ArkTreeItem {
  const item = document.createElement("ark-tree-item") as ArkTreeItem;
  item.setAttribute("value", node.value);
  item.setAttribute("label", node.label);
  if (node.expanded) item.setAttribute("expanded", "");
  if (node.lazy) item.setAttribute("lazy", "");
  if (node.disabled) item.setAttribute("disabled", "");
  if (!bare) {
    const icon = document.createElement("span");
    icon.setAttribute("slot", "icon");
    icon.style.color = "var(--ark-color-fg-muted)";
    icon.innerHTML = node.children || node.lazy ? FOLDER_SVG : FILE_SVG;
    item.appendChild(icon);
  }
  if (node.badge) {
    // Trailing não interativo (badge): fica na linha e não entra na árvore de acessibilidade como controle.
    const badge = document.createElement("ark-badge");
    badge.setAttribute("slot", "trailing");
    badge.setAttribute("size", "xs");
    badge.setAttribute("intent", "warning");
    badge.textContent = node.badge;
    item.appendChild(badge);
  }
  for (const child of node.children ?? []) item.appendChild(createNode(child, bare));
  return item;
}

function createTree(args: Partial<StoryArgs>, nodes: Node[] = FILES): ArkTree {
  const tree = document.createElement("ark-tree") as ArkTree;
  tree.setAttribute("aria-label", "Arquivos");
  if (args.selection && args.selection !== "none") tree.setAttribute("selection", args.selection);
  if (args.checkboxes) tree.setAttribute("checkboxes", "");
  if (args.propagate) tree.setAttribute("propagate", "");
  if (args.icons && args.icons !== "slot") tree.setAttribute("icons", args.icons);
  if (args.iconColor) tree.setAttribute("icon-color", args.iconColor);
  if (args.size && args.size !== "md") tree.setAttribute("size", args.size);
  if (args.testid) tree.setAttribute("testid", args.testid);
  tree.style.maxWidth = "320px";
  // Com os ícones próprios a story deixa os nós sem `slot="icon"`, que teria precedência.
  const bare = args.bare ?? args.icons === "files";
  for (const node of nodes) tree.appendChild(createNode(node, bare));
  return tree;
}

const byValue = (root: Element, value: string): ArkTreeItem =>
  root.querySelector(`ark-tree-item[value="${value}"]`) as ArkTreeItem;

export const Playground = {
  render: (args: StoryArgs) => createTree(args)
};

export const Structure = {
  render: () => createTree({}),
  // Estrutura ARIA plana: a linha de cada item é o treeitem, com nível, posição e tamanho do conjunto explícitos, e o
  // host fica role="none"; os subitens continuam onde o app os declarou. O nome vem do rótulo próprio, não do texto
  // dos descendentes.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const row = (value: string): HTMLElement => byValue(tree, value).rowElement as HTMLElement;
    const src = byValue(tree, "src");
    await expect(tree).toHaveAttribute("role", "tree");
    await expect(src).toHaveAttribute("role", "none");
    await expect(row("src")).toHaveAttribute("role", "treeitem");
    await expect(row("src")).toHaveAttribute("aria-level", "1");
    await expect(row("src")).toHaveAttribute("aria-posinset", "1");
    await expect(row("src")).toHaveAttribute("aria-setsize", "4");
    await expect(row("src")).toHaveAttribute("aria-expanded", "true");
    await expect(row("src/components")).toHaveAttribute("aria-level", "2");
    await expect(row("src/components")).toHaveAttribute("aria-posinset", "2");
    await expect(row("src/components")).toHaveAttribute("aria-setsize", "3");
    await expect(row("src/components")).toHaveAttribute("aria-expanded", "false");
    await expect(row("src/components/tree.ts")).toHaveAttribute("aria-level", "3");
    await expect(row("src/app")).toHaveAttribute("aria-expanded", "false");
    await expect(row("README.md").hasAttribute("aria-expanded")).toBe(false);
    await expect(row("LICENSE")).toHaveAttribute("aria-disabled", "true");
    // O rótulo nomeia a linha e fica fora da leitura solta; o badge do trailing entra como descrição.
    await expect(src.querySelector(':scope > [data-ark-chrome="label"]')).toHaveAttribute("aria-hidden", "true");
    const badge = byValue(tree, "README.md").querySelector('[slot="trailing"]') as HTMLElement;
    await expect(row("README.md")).toHaveAttribute("aria-describedby", badge.id);
    await expect(row("README.md")).toHaveAccessibleDescription("M");
    await expect(row("src").hasAttribute("aria-describedby")).toBe(false);
    // O filho continua filho do pai no DOM: nada foi movido.
    await expect(byValue(tree, "src/index.ts").parentElement).toBe(src);
    await expect(within(tree).getByRole("treeitem", { name: "components" })).toBe(row("src/components"));
    // Um tab stop só, no primeiro item.
    await expect(row("src")).toHaveAttribute("tabindex", "0");
    await expect(row("src/index.ts")).toHaveAttribute("tabindex", "-1");
    // Recolhido, o ramo some; o chevron expande.
    await expect(byValue(tree, "src/components/tree.ts")).not.toBeVisible();
    await userEvent.click(byValue(tree, "src/components").toggleElement!);
    await waitFor(() => expect(byValue(tree, "src/components/tree.ts")).toBeVisible());
    await expect(row("src/components")).toHaveAttribute("aria-expanded", "true");
  }
};

type Detail = { value: string; values?: string[]; expanded?: boolean };

/** Registra os eventos da árvore numa lista legível. */
function record(tree: ArkTree): string[] {
  const log: string[] = [];
  for (const name of ["ark-toggle", "ark-selection-change", "ark-activate"]) {
    tree.addEventListener(name, (event) => {
      const detail = (event as CustomEvent<Detail>).detail;
      if (name === "ark-toggle") log.push(`toggle ${detail.value} ${detail.expanded}`);
      if (name === "ark-activate") log.push(`activate ${detail.value}`);
      if (name === "ark-selection-change") log.push(`selection ${JSON.stringify(detail.values)}`);
    });
  }
  return log;
}

const rowOf = (tree: Element, value: string): HTMLElement => byValue(tree, value).rowElement as HTMLElement;
const focused = (): string | null =>
  (document.activeElement as Element | null)?.closest("ark-tree-item")?.getAttribute("value") ?? null;

export const KeyboardNavigation = {
  render: () => createTree({}),
  // Padrão WAI-ARIA: setas pelos itens visíveis, → expande ou entra no primeiro filho, ← recolhe ou volta ao pai,
  // Home/End, busca por digitação, * expande os irmãos, Enter ativa (um desabilitado não).
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    rowOf(tree, "src").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("src/index.ts");
    // Com Alt (Alt+← volta a página), Ctrl ou Meta a seta fica com o navegador.
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect(focused()).toBe("src/index.ts");
    await expect(
      rowOf(tree, "src/index.ts").dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true, cancelable: true })
      )
    ).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowRight}");
    await expect(byValue(tree, "src/components")).toHaveAttribute("expanded");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowRight}");
    await expect(focused()).toBe("src/components/button.ts");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(byValue(tree, "src/components")).not.toHaveAttribute("expanded");
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("LICENSE");
    await userEvent.keyboard("{Home}");
    await expect(focused()).toBe("src");
    // O tab stop acompanha o foco: um item só com tabindex 0.
    await expect(tree.items.filter((item) => item.rowElement?.getAttribute("tabindex") === "0").length).toBe(1);

    // Busca por digitação: "r" vai ao README.md; "d" ao docs.
    await userEvent.keyboard("r");
    await expect(focused()).toBe("README.md");
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("d");
    await expect(focused()).toBe("docs");

    // * expande os irmãos do item focado.
    await userEvent.keyboard("*");
    await expect(byValue(tree, "docs")).toHaveAttribute("expanded");
    await expect(byValue(tree, "docs/guide.md")).toBeVisible();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("LICENSE");
    await userEvent.keyboard("{Enter}");
    await expect(log).toEqual([
      "toggle src/components true",
      "toggle src/components false",
      "toggle docs true",
      "activate docs"
    ]);
  }
};

export const TabStopFollowsCollapse = {
  render: () => createTree({}),
  // Recolher o ramo com o foco num descendente leva foco e tab stop ao item recolhido; senão o Tab não acharia mais
  // a árvore.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    rowOf(tree, "src/index.ts").focus();
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("tabindex", "0");
    await userEvent.click(byValue(tree, "src").toggleElement!);
    await expect(byValue(tree, "src")).not.toHaveAttribute("expanded");
    await expect(focused()).toBe("src");
    await expect(rowOf(tree, "src")).toHaveAttribute("tabindex", "0");
    // O tab stop num item removido volta ao primeiro visível.
    byValue(tree, "src").expanded = true;
    rowOf(tree, "README.md").focus();
    byValue(tree, "README.md").remove();
    await waitFor(() => expect(rowOf(tree, "src")).toHaveAttribute("tabindex", "0"));
  }
};

export const SingleSelection = {
  render: () => createTree({ selection: "single" }),
  // Em single o clique na linha seleciona e ativa (abrir o arquivo); Espaço seleciona; um desabilitado não; o value
  // segue a seleção e, atribuído, seleciona sem evento.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await expect(byValue(tree, "src/index.ts")).toHaveAttribute("selected");
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-selected", "true");
    await expect(rowOf(tree, "README.md")).toHaveAttribute("aria-selected", "false");
    await expect(tree).toHaveAttribute("value", "src/index.ts");
    await userEvent.click(within(byValue(tree, "README.md")).getByText("README.md"));
    await expect(byValue(tree, "src/index.ts")).not.toHaveAttribute("selected");
    await expect(tree.value).toBe("README.md");
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard(" ");
    await expect(tree.value).toBe("docs");
    await userEvent.click(within(byValue(tree, "LICENSE")).getByText("LICENSE"));
    await expect(tree.value).toBe("docs");
    await expect(log).toEqual([
      'selection ["src/index.ts"]',
      "activate src/index.ts",
      'selection ["README.md"]',
      "activate README.md",
      'selection ["docs"]'
    ]);
    tree.value = "docs/guide.md";
    await expect(byValue(tree, "docs/guide.md")).toHaveAttribute("selected");
    await expect(byValue(tree, "docs")).not.toHaveAttribute("selected");
    await expect(tree.values).toEqual(["docs/guide.md"]);
    await expect(log.length).toBe(5);
  }
};

export const MultipleSelection = {
  render: () => createTree({ selection: "multiple" }),
  // Em multiple o clique e o Espaço alternam a seleção do item; o value é a lista JSON; Enter ativa.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    await expect(tree).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await userEvent.click(within(byValue(tree, "README.md")).getByText("README.md"));
    await expect(JSON.parse(tree.value)).toEqual(["src/index.ts", "README.md"]);
    await userEvent.keyboard(" ");
    await expect(tree.values).toEqual(["src/index.ts"]);
    await userEvent.keyboard("{Enter}");
    await expect(log).toEqual([
      'selection ["src/index.ts"]',
      'selection ["src/index.ts","README.md"]',
      'selection ["src/index.ts"]',
      "activate README.md"
    ]);
    tree.values = ["docs", "README.md"];
    await expect(byValue(tree, "src/index.ts")).not.toHaveAttribute("selected");
    await expect(tree.values).toEqual(["docs", "README.md"]);
  }
};

export const CheckboxesAndLazy = {
  render: () => {
    const tree = createTree({ selection: "multiple", checkboxes: true, propagate: true }, [
      {
        value: "src",
        label: "src",
        expanded: true,
        children: [
          { value: "src/index.ts", label: "index.ts" },
          { value: "src/legacy.ts", label: "legacy.ts", disabled: true },
          { value: "src/app", label: "app", lazy: true }
        ]
      },
      { value: "README.md", label: "README.md" }
    ]);
    // Carga sob demanda: ao expandir o `lazy`, loading, os filhos e o fim do loading.
    tree.addEventListener("ark-toggle", (event) => {
      const { item, expanded } = (event as CustomEvent<{ item: ArkTreeItem; expanded: boolean }>).detail;
      if (!expanded || !item.lazy || item.childItems.length) return;
      item.loading = true;
      window.setTimeout(() => {
        for (const name of ["main.ts", "routes.ts"]) {
          const child = document.createElement("ark-tree-item");
          child.setAttribute("value", `src/app/${name}`);
          child.setAttribute("label", name);
          item.appendChild(child);
        }
        item.loading = false;
      }, 150);
    });
    return tree;
  },
  // Caixas com propagate: marcar o pai marca os descendentes habilitados (o desabilitado fica como está e deixa o pai
  // mixed); o value lista os marcados por inteiro; filhos que chegam depois sob um pai marcado chegam marcados.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    const check = (value: string): HTMLElement => byValue(tree, value).checkElement as HTMLElement;
    await expect(check("src")).toBeVisible();
    await expect(rowOf(tree, "src")).toHaveAttribute("aria-checked", "false");
    await expect(rowOf(tree, "src").hasAttribute("aria-selected")).toBe(false);

    await userEvent.click(check("src"));
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-checked", "true");
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "true");
    await expect(rowOf(tree, "src/legacy.ts")).toHaveAttribute("aria-checked", "false");
    await expect(rowOf(tree, "src")).toHaveAttribute("aria-checked", "mixed");
    await expect(tree.values).toEqual(["src/index.ts", "src/app"]);

    // O lazy carrega com loading e os filhos chegam marcados, porque o pai está marcado.
    await userEvent.click(byValue(tree, "src/app").toggleElement!);
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-busy", "true");
    await waitFor(() => expect(byValue(tree, "src/app/main.ts")).toBeVisible());
    await expect(rowOf(tree, "src/app")).not.toHaveAttribute("aria-busy");
    await waitFor(() => expect(rowOf(tree, "src/app/main.ts")).toHaveAttribute("aria-checked", "true"));
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "true");

    // Desmarcar um filho deixa o pai mixed; Espaço na linha marca; o clique no rótulo ativa sem marcar.
    await userEvent.click(check("src/app/routes.ts"));
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "mixed");
    rowOf(tree, "README.md").focus();
    await userEvent.keyboard(" ");
    await expect(rowOf(tree, "README.md")).toHaveAttribute("aria-checked", "true");
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-checked", "true");
    await expect(tree.values).toEqual(["src/index.ts", "src/app/main.ts", "README.md"]);
    await expect(log.filter((line) => line.startsWith("activate"))).toEqual(["activate src/index.ts"]);
    // Um desabilitado não marca.
    await userEvent.click(check("src/legacy.ts"));
    await expect(rowOf(tree, "src/legacy.ts")).toHaveAttribute("aria-checked", "false");
  }
};

export const TrailingControls = {
  // Limite conhecido da árvore plana: o botão do trailing fica ao lado do treeitem, como filho do tree, e o axe acusa
  // aria-required-children. Aqui o a11y volta a só avisar; um trailing não interativo (badge) passa limpo.
  parameters: { a11y: { test: "todo" } },
  render: () => {
    const tree = createTree({ selection: "single" }, [
      { value: "a", label: "relatorio.pdf" },
      { value: "b", label: "notas.txt" }
    ]);
    for (const item of Array.from(tree.querySelectorAll("ark-tree-item"))) {
      const button = document.createElement("button");
      button.type = "button";
      button.slot = "trailing";
      button.textContent = "Excluir";
      button.setAttribute("aria-label", `Excluir ${item.getAttribute("label")}`);
      item.appendChild(button);
    }
    return tree;
  },
  // Um botão no slot trailing fica com o próprio clique e teclado: não seleciona, não ativa, não busca.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    const button = within(tree).getByRole("button", { name: "Excluir relatorio.pdf" });
    await userEvent.click(button);
    await expect(log).toEqual([]);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("n");
    await expect(log).toEqual([]);
    await expect(document.activeElement).toBe(button);
    await expect(tree.value).toBe("");
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createTree({ size, selection: "single", icons: "files" }));
    return wrap;
  }
};

const ownIcon = (tree: Element, value: string): HTMLElement | null =>
  byValue(tree, value).querySelector<HTMLElement>(':scope > [data-ark-chrome="icon"]');
const iconKind = (tree: Element, value: string): string | null =>
  ownIcon(tree, value)?.getAttribute("data-ark-icon") ?? null;

export const Icons = {
  render: () => createTree({ icons: "files" }),
  // icons="files": pasta nos ramos (aberta quando expandido), arquivo nas folhas, só nos nós sem slot="icon". O `icon`
  // do item vence a escolha automática, o slot="icon" do app vence os dois, e sem o atributo a árvore volta ao que
  // era: nenhum ícone próprio.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    await expect(tree.icons).toBe("files");
    await expect(iconKind(tree, "src")).toBe("folder-open");
    await expect(iconKind(tree, "src/components")).toBe("folder");
    await expect(iconKind(tree, "src/app")).toBe("folder");
    await expect(iconKind(tree, "src/index.ts")).toBe("file");
    await expect(iconKind(tree, "README.md")).toBe("file");

    // Decorativo e fora do nome: fica antes do rótulo, aria-hidden, e a linha continua nomeada pelo rótulo.
    const icon = ownIcon(tree, "src") as HTMLElement;
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(icon.nextElementSibling).toHaveAttribute("data-ark-chrome", "label");
    await expect(rowOf(tree, "src")).toHaveAccessibleName("src");
    await expect(byValue(tree, "src").iconElement === icon).toBe(true);

    // A pasta acompanha o expandir e o recolher.
    tree.toggleItem(byValue(tree, "src"), false);
    await expect(iconKind(tree, "src")).toBe("folder");
    tree.toggleItem(byValue(tree, "src"), true);
    await expect(iconKind(tree, "src")).toBe("folder-open");

    // `icon` no item: uma pasta vazia é uma folha com ícone de pasta (fechada), e `none` tira o ícone só dele.
    const license = byValue(tree, "LICENSE");
    license.icon = "folder";
    await expect(iconKind(tree, "LICENSE")).toBe("folder");
    license.setAttribute("icon", "none");
    await expect(ownIcon(tree, "LICENSE")).toBeNull();
    license.removeAttribute("icon");
    await expect(iconKind(tree, "LICENSE")).toBe("file");

    // O slot="icon" do app tem precedência: o ícone próprio sai, e volta quando o do app sai.
    const readme = byValue(tree, "README.md");
    const mine = document.createElement("span");
    mine.slot = "icon";
    mine.textContent = "★";
    readme.appendChild(mine);
    await waitFor(() => expect(ownIcon(tree, "README.md")).toBeNull());
    mine.remove();
    await waitFor(() => expect(iconKind(tree, "README.md")).toBe("file"));

    // Nada fica reescrevendo o DOM depois de assentar (o observer da árvore entraria em laço).
    let mutations = 0;
    const observer = new MutationObserver((records) => {
      mutations += records.length;
    });
    observer.observe(tree, { childList: true, subtree: true, attributes: true });
    await new Promise((resolve) => setTimeout(resolve, 150));
    observer.disconnect();
    await expect(mutations).toBe(0);

    // Sem `icons` nenhum nó tem ícone próprio, a não ser o que o nomeia.
    license.icon = "file";
    tree.removeAttribute("icons");
    await expect(tree.querySelectorAll('[data-ark-chrome="icon"]').length).toBe(1);
    await expect(iconKind(tree, "LICENSE")).toBe("file");
    license.removeAttribute("icon");
    await expect(tree.querySelectorAll('[data-ark-chrome="icon"]').length).toBe(0);
    tree.icons = "files";
    await expect(iconKind(tree, "src")).toBe("folder-open");
  }
};

export const IconsHidden = {
  render: () => createTree({ icons: "none" }),
  // icons="none": só os nomes. Some o ícone do app também, mesmo que ele traga um display próprio; o chevron fica,
  // porque é ele que expande.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const mine = byValue(tree, "src").querySelector(':scope > [slot="icon"]') as HTMLElement;
    mine.style.display = "inline-flex";
    await expect(getComputedStyle(mine).display).toBe("none");
    await expect(tree.querySelectorAll('[data-ark-chrome="icon"]').length).toBe(0);
    await expect(byValue(tree, "src").toggleElement?.querySelector("svg")).not.toBeNull();
    const label = byValue(tree, "src/index.ts").querySelector(':scope > [data-ark-chrome="label"]') as HTMLElement;
    const hidden = label.getBoundingClientRect().left;

    // Sem o atributo o ícone do app volta, e o rótulo abre espaço para ele.
    tree.removeAttribute("icons");
    await expect(getComputedStyle(mine).display).not.toBe("none");
    await expect(label.getBoundingClientRect().left).toBeGreaterThan(hidden);
    // `icon` no item não fura o `none` da árvore.
    tree.setAttribute("icons", "none");
    byValue(tree, "LICENSE").setAttribute("icon", "file");
    await expect(ownIcon(tree, "LICENSE")).toBeNull();
  }
};

export const IconColor = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-6";
    for (const iconColor of ["", "primary", "info", "current", "#7c3aed"]) {
      wrap.appendChild(createTree({ icons: "files", iconColor }));
    }
    // Ícones do app em currentColor, sem cor própria: seguem `icon-color`. Um que o app pinta fica com a cor dele.
    const app = createTree({ iconColor: "success" });
    for (const icon of Array.from(app.querySelectorAll<HTMLElement>('[slot="icon"]')))
      icon.style.removeProperty("color");
    (byValue(app, "docs").querySelector(':scope > [slot="icon"]') as HTMLElement).style.color = "rgb(4, 5, 6)";
    wrap.appendChild(app);
    return wrap;
  },
  // `icon-color` grava --ark-tree-icon-color no host: um intent aponta para o token (segue a marca e o tema do app),
  // `current` para a cor do texto da árvore, e o resto só vale se for uma cor CSS. Sem o atributo, fg-muted.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trees = Array.from(canvasElement.querySelectorAll<ArkTree>("ark-tree"));
    const resolved = (css: string): string => {
      const probe = document.createElement("span");
      probe.style.color = css;
      trees[0].appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    const colorOf = (tree: ArkTree): string => getComputedStyle(ownIcon(tree, "src") as HTMLElement).color;

    await expect(trees[0].style.getPropertyValue("--ark-tree-icon-color")).toBe("");
    await expect(colorOf(trees[0])).toBe(resolved("var(--ark-color-fg-muted)"));
    await expect(trees[1].style.getPropertyValue("--ark-tree-icon-color")).toBe("var(--ark-color-primary)");
    await expect(colorOf(trees[1])).toBe(resolved("var(--ark-color-primary)"));
    await expect(colorOf(trees[2])).toBe(resolved("var(--ark-color-info)"));
    await expect(colorOf(trees[3])).toBe(getComputedStyle(trees[3]).color);
    await expect(colorOf(trees[4])).toBe("rgb(124, 58, 237)");

    // Um valor que não é cor não entra, e tirar o atributo devolve o padrão.
    trees[4].iconColor = "nao-e-cor";
    await expect(trees[4].style.getPropertyValue("--ark-tree-icon-color")).toBe("");
    await expect(colorOf(trees[4])).toBe(resolved("var(--ark-color-fg-muted)"));
    trees[4].iconColor = "#7c3aed";
    await expect(colorOf(trees[4])).toBe("rgb(124, 58, 237)");

    // A propriedade que o app pôs no host é dele: sem `icon-color` o componente não a apaga.
    trees[0].style.setProperty("--ark-tree-icon-color", "rgb(1, 2, 3)");
    trees[0].setAttribute("size", "lg");
    await expect(colorOf(trees[0])).toBe("rgb(1, 2, 3)");
    trees[0].style.removeProperty("--ark-tree-icon-color");
    trees[0].removeAttribute("size");

    // Ícone do app: com `icon-color` segue a cor da árvore; sem o atributo herda a cor do texto, como antes. O que o
    // app pinta por conta própria não muda.
    const app = trees[5];
    const mine = byValue(app, "src").querySelector(':scope > [slot="icon"]') as HTMLElement;
    const painted = byValue(app, "docs").querySelector(':scope > [slot="icon"]') as HTMLElement;
    await expect(getComputedStyle(mine).color).toBe(resolved("var(--ark-color-success)"));
    await expect(getComputedStyle(painted).color).toBe("rgb(4, 5, 6)");
    app.removeAttribute("icon-color");
    await expect(getComputedStyle(mine).color).toBe(getComputedStyle(app).color);
    app.setAttribute("icon-color", "success");
    await expect(getComputedStyle(mine).color).toBe(resolved("var(--ark-color-success)"));
  }
};

export const IconSizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createTree({ size, icons: "files" }));
    // Ícones do app, dimensionados por --ark-tree-icon-size.
    wrap.appendChild(createTree({ size: "xl" }));
    return wrap;
  },
  // O lado do ícone acompanha o `size` da árvore (14, 14, 16, 18 e 20 px), no ícone próprio e na propriedade
  // --ark-tree-icon-size que o ícone do app lê.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const trees = Array.from(canvasElement.querySelectorAll<ArkTree>("ark-tree"));
    const expected = [14, 14, 16, 18, 20];
    for (const [index, side] of expected.entries()) {
      const rect = (ownIcon(trees[index], "src") as HTMLElement).getBoundingClientRect();
      await expect(rect.width).toBe(side);
      await expect(rect.height).toBe(side);
      const svg = (ownIcon(trees[index], "src/index.ts") as HTMLElement).querySelector("svg") as SVGElement;
      await expect(svg.getBoundingClientRect().width).toBe(side);
    }
    const mine = byValue(trees[5], "src").querySelector(':scope > [slot="icon"] > svg') as SVGElement;
    await expect(mine.getBoundingClientRect().width).toBe(20);
    trees[5].setAttribute("size", "xs");
    await expect(mine.getBoundingClientRect().width).toBe(14);
    trees[5].setAttribute("size", "xl");
  }
};

export const TestHooks = {
  render: () => createTree({ testid: "files", selection: "multiple", checkboxes: true }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    await expect(tree).toHaveAttribute("data-ark", "tree");
    await expect(tree).toHaveAttribute("data-testid", "files");
    const item = byValue(tree, "src");
    item.setAttribute("testid", "folder-src");
    await expect(item).toHaveAttribute("data-ark", "tree-item");
    await expect(item).toHaveAttribute("data-testid", "folder-src");
    for (const part of ["row", "toggle", "check", "label"]) {
      const node = item.querySelector(`:scope > [data-ark="tree-item-${part}"]`);
      await expect(node).toHaveAttribute("data-testid", `folder-src-${part}`);
    }
    // O ícone próprio só existe quando pedido, e então também leva os hooks.
    await expect(item.querySelector(':scope > [data-ark="tree-item-icon"]')).toBeNull();
    item.querySelector(':scope > [slot="icon"]')?.remove();
    item.setAttribute("icon", "folder");
    const icon = item.querySelector(':scope > [data-ark="tree-item-icon"]');
    await expect(icon).toHaveAttribute("data-testid", "folder-src-icon");
  }
};
