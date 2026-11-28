// O compilador JIT precisa estar carregado antes de qualquer classe decorada do Angular.
import "@angular/compiler";
import {
  Component,
  type ComponentRef,
  createComponent,
  ErrorHandler,
  provideZonelessChangeDetection,
  type Type
} from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import {
  ArkButtonComponent,
  ArkButtonGroupComponent,
  ArkCalendarComponent,
  ArkCardComponent,
  ArkCarouselComponent,
  ArkCommandItemComponent,
  ArkCommandPaletteComponent,
  ArkDataViewCardDirective,
  ArkDataViewCellDirective,
  ArkDataViewComponent,
  ArkDialogComponent,
  ArkDrawerComponent,
  ArkEmptyComponent,
  ArkMenuComponent,
  ArkMenuGroupComponent,
  ArkMenuItemComponent,
  ArkNavComponent,
  ArkNavGroupComponent,
  ArkPaginationComponent,
  ArkRadioComponent,
  ArkRadioGroupComponent,
  ArkSplitPaneComponent,
  ArkSwitchComponent,
  ArkTabComponent,
  ArkTabsComponent,
  ArkTextareaComponent,
  ArkTimeComponent,
  ArkTreeComponent,
  ArkTreeItemComponent,
  setArkLocale as angularSetArkLocale
} from "@tooark/angular";
import { ArkChartComponent } from "@tooark/angular/chart";
import { ArkCodeEditorComponent } from "@tooark/angular/code";
import { ArkWysiwygEditorComponent } from "@tooark/angular/wysiwyg";
import type {
  ArkDataViewColumn,
  ArkDataViewLayout,
  ArkDataViewQueryChangeDetail,
  ArkDataViewSelectionChangeDetail,
  ArkPageChangeDetail
} from "@tooark/core";
import { resolveLocale, setArkLocale } from "@tooark/core";
import type { ArkDataView as ArkDataViewElement } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { expectOptInAttributes } from "./opt-in-attributes";
import { expectOwnContainerEvents, expectOwnOverlayEvents } from "./overlay-events";
import { expectRadioGroupValue, type RadioGroupProps } from "./radio-group-value";

// Os wrappers Angular de verdade, compilados em JIT a partir do src (o Vite transforma os decorators legados, ver
// main.ts) e montados numa aplicação sem zone.js, como o padrão do Angular 21. O preview já registrou os elementos.
const meta = {
  title: "Integration/Angular Wrappers",
  // Só testes (não há o que ver): rodam na suíte, mas ficam fora da barra lateral e da página de docs.
  tags: ["!dev", "!autodocs"]
};

export default meta;

type Ctx = { canvasElement: HTMLElement };

type Person = { id: number; name: string; team: string };

const PEOPLE: Person[] = [
  { id: 1, name: "Ana Lima", team: "Plataforma" },
  { id: 2, name: "Bruno Reis", team: "Produto" },
  { id: 3, name: "Carla Dias", team: "Suporte" }
];

const COLUMNS: ArkDataViewColumn<Person>[] = [
  { key: "name", label: "Nome", sortable: true, cardRole: "title" },
  { key: "team", label: "Time" },
  // Sem template: o `render` da coluna vale como no elemento (nó ou texto).
  { key: "id", label: "#", render: ({ row }) => `#${row.id}` }
];

/** Monta um componente numa aplicação Angular própria, dentro do canvas da story. */
async function mount<T>(canvasElement: HTMLElement, component: Type<T>, errors: unknown[]) {
  const app = await createApplication({
    providers: [
      provideZonelessChangeDetection(),
      { provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } }
    ]
  });
  const hostElement = document.createElement("div");
  canvasElement.append(hostElement);
  const ref: ComponentRef<T> = createComponent(component, { environmentInjector: app.injector, hostElement });
  app.attachView(ref.hostView);
  const detect = (): void => ref.changeDetectorRef.detectChanges();
  detect();
  return { app, ref, host: ref.instance, detect };
}

function shownKeys(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>("ark-data-view [data-ark-row]")).map(
    (row) => row.dataset.arkRow ?? ""
  );
}

class DataViewHost {
  rows = PEOPLE;
  columns = COLUMNS;
  view: ArkDataViewLayout = "table";
  selected: number[] = [];
  highlight: number | null = null;
  withCard = false;
  clicks: string[] = [];
  queries: ArkDataViewQueryChangeDetail[] = [];
  selections: ArkDataViewSelectionChangeDetail[] = [];
  pages: ArkPageChangeDetail[] = [];
}

// Inputs como atributo ou propriedade, outputs com o CustomEvent, conteúdo projetado como slot, e o conteúdo das
// células em `ng-template`: o wrapper instancia o template por célula, a view entra na detecção de mudanças do
// componente que o declarou e sai quando o elemento refaz as células.
export const DataViewTemplatesAndPagination = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [
        ArkDataViewComponent,
        ArkDataViewCellDirective,
        ArkDataViewCardDirective,
        ArkButtonComponent,
        ArkPaginationComponent
      ],
      template: `
        <ark-data-view-wrapper
          [rows]="rows"
          [columns]="columns"
          [view]="view"
          [pageSize]="2"
          [selectable]="true"
          [selected]="selected"
          label="Pessoas"
          lang="pt"
          (arkQueryChange)="queries.push($event.detail)"
          (arkSelectionChange)="selections.push($event.detail)">
          <ng-template arkDataViewCell="name" let-row let-index="index">
            <strong class="nome" [attr.data-destaque]="row.id === highlight ? 'sim' : 'nao'">{{ row.name }}</strong>
          </ng-template>
          <ng-template arkDataViewCell="team" let-row>
            <ark-button-wrapper size="sm" (click)="clicks.push(row.name)">{{ row.team }}</ark-button-wrapper>
          </ng-template>
          @if (withCard) {
            <ng-template arkDataViewCard let-row let-index="index">
              <p class="corpo">{{ index }}: {{ row.team }}</p>
            </ng-template>
          }
          <div slot="selection">Ações</div>
        </ark-data-view-wrapper>
        <ark-pagination-wrapper
          [page]="1"
          [pageSize]="10"
          [total]="35"
          ariaLabel="Páginas de pessoas"
          lang="pt"
          (arkPageChange)="pages.push($event.detail)">
        </ark-pagination-wrapper>`
    })(DataViewHost);

    const { app, ref, host, detect } = await mount(canvasElement, Host, errors);
    const view = canvasElement.querySelector("ark-data-view") as ArkDataViewElement;
    const cell = (key: string, column: number) =>
      view.querySelectorAll(`[data-ark-row="${key}"] [data-ark="data-view-cell"]`)[column] as HTMLElement;

    await expect(errors).toEqual([]);
    await expect(view).toHaveAttribute("page-size", "2");
    await expect(view).toHaveAttribute("label", "Pessoas");
    await expect(view.rows.every((row, index) => row === PEOPLE[index])).toBe(true);
    await expect(shownKeys(canvasElement)).toEqual(["1", "2"]);

    // Templates de célula: o registro em let-row, um wrapper Angular com evento dentro da célula, e a coluna sem
    // template com o `render` dela.
    await expect(view.querySelectorAll("td .nome")).toHaveLength(2);
    await expect(cell("1", 0).querySelector(".nome")).toHaveTextContent("Ana Lima");
    await expect(cell("1", 0).querySelector(".nome")).toHaveAttribute("data-destaque", "nao");
    await expect(cell("2", 2)).toHaveTextContent("#2");
    (cell("2", 1).querySelector("ark-button") as HTMLElement).click();
    await expect(host.clicks).toEqual(["Bruno Reis"]);

    // O template segue o estado do componente que o declarou, na mesma linha (o elemento não refez a tabela).
    const firstRow = view.querySelector('[data-ark-row="1"]');
    host.highlight = 1;
    detect();
    await expect(view.querySelector('[data-ark-row="1"]') === firstRow).toBe(true);
    await expect(cell("1", 0).querySelector(".nome")).toHaveAttribute("data-destaque", "sim");

    // Outputs com o CustomEvent; o slot projetado só aparece com seleção.
    const actions = view.querySelector('[slot="selection"]') as HTMLElement;
    await expect(actions).toHaveTextContent("Ações");
    await expect(actions).not.toBeVisible();
    (view.querySelector('[data-ark-row="1"] ark-checkbox') as HTMLElement & { toggle: () => void }).toggle();
    await expect(host.selections.at(-1)?.selected).toEqual([1]);
    await expect(actions).toBeVisible();

    // Outra página: as células novas ganham views novas e as antigas são destruídas.
    (view.querySelector('button[data-ark-page="2"]') as HTMLElement).click();
    await expect(host.queries.at(-1)).toMatchObject({ page: 2, pageSize: 2, reason: "page" });
    await expect(shownKeys(canvasElement)).toEqual(["3"]);
    await expect(cell("3", 0).querySelector(".nome")).toHaveTextContent("Carla Dias");
    await expect(document.querySelectorAll(".nome")).toHaveLength(1);

    // Cards: o template de card entra depois (um @if) e desenha o corpo; o título segue do template da célula.
    host.view = "cards";
    host.withCard = true;
    detect();
    await waitFor(() => expect(view.querySelector("li .corpo")).toHaveTextContent("2: Suporte"));
    await expect(view.querySelector("dl")).toBeNull();
    await expect(view.querySelector('li[data-ark-row="3"] .nome')).toHaveTextContent("Carla Dias");
    host.withCard = false;
    detect();
    await waitFor(() => expect(view.querySelector("dl")).not.toBeNull());

    // Inputs de propriedade: lista e seleção novas chegam ao elemento.
    host.rows = PEOPLE.slice(0, 2);
    host.selected = [2];
    detect();
    await expect(view.rows.map((row) => row.id)).toEqual([1, 2]);
    await expect(view.selected).toEqual([2]);

    // O wrapper da paginação avulsa: input `ariaLabel` no elemento e o output com o CustomEvent.
    const pagination = canvasElement.querySelector("ark-pagination-wrapper > ark-pagination") as HTMLElement;
    await expect(pagination).toHaveAttribute("total", "35");
    await expect(pagination).toHaveAccessibleName("Páginas de pessoas");
    (pagination.querySelector('button[data-ark-page="3"]') as HTMLElement).click();
    await expect(host.pages).toEqual([{ page: 3, pageSize: 10, pageCount: 4 }]);

    ref.destroy();
    app.destroy();
    await expect(errors).toEqual([]);
  }
};

class NewAttributesHost {
  navigated: string[] = [];
  onNavigate(event: CustomEvent<{ href: string }>): void {
    event.preventDefault();
    this.navigated.push(event.detail.href);
  }
}

// Props do 2º passo das lacunas do Arkcode: heading-level, wrap-actions, download e ark-navigate no botão, filhos
// projetados como rótulo do switch.
export const NewAttributes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkCardComponent, ArkEmptyComponent, ArkButtonComponent, ArkSwitchComponent],
      template: `
        <ark-card-wrapper heading="Relatório" [headingLevel]="3" [wrapActions]="true"></ark-card-wrapper>
        <ark-empty-wrapper heading="Nada aqui" [headingLevel]="4"></ark-empty-wrapper>
        <ark-button-wrapper href="/projetos/42" (arkNavigate)="onNavigate($event)">Abrir</ark-button-wrapper>
        <ark-button-wrapper href="/dados.csv" download="dados.csv">Baixar</ark-button-wrapper>
        <ark-switch-wrapper>Avisos por e-mail</ark-switch-wrapper>`
    })(NewAttributesHost);

    const { app, ref, host } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    const card = canvasElement.querySelector("ark-card") as HTMLElement;
    await expect(card).toHaveAttribute("wrap-actions", "");
    await expect((card.querySelector('[data-ark="card-heading"]') as HTMLElement).tagName).toBe("H3");
    const empty = canvasElement.querySelector("ark-empty") as HTMLElement;
    await expect((empty.querySelector('[data-ark="empty-heading"]') as HTMLElement).tagName).toBe("H4");
    const [route, file] = Array.from(canvasElement.querySelectorAll("ark-button")) as HTMLElement[];
    await expect(file.querySelector("a")).toHaveAttribute("download", "dados.csv");
    const toggle = canvasElement.querySelector("ark-switch") as HTMLElement;
    await waitFor(() => expect(toggle.querySelector('[role="switch"]')).toHaveAttribute("aria-labelledby", toggle.id));
    await expect(toggle.textContent).toContain("Avisos por e-mail");

    canvasElement.addEventListener("click", (event) => event.preventDefault());
    route.querySelector("a")?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await expect(host.navigated).toEqual(["/projetos/42"]);
    ref.destroy();
    app.destroy();
  }
};

// ark-menu-group-wrapper dentro do menu, e o idioma padrão: a reexportação de setArkLocale é a do core e o calendário
// sem `lang` (o wrapper gravava `lang="en"` por padrão) segue a troca.
export const MenuGroupAndLocale = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkMenuComponent, ArkMenuGroupComponent, ArkMenuItemComponent, ArkCalendarComponent],
      template: `
        <ark-menu-wrapper ariaLabel="Arquivo">
          <ark-menu-group-wrapper label="Exportar" testid="export">
            <ark-menu-item-wrapper value="pdf">PDF</ark-menu-item-wrapper>
          </ark-menu-group-wrapper>
        </ark-menu-wrapper>
        <ark-calendar-wrapper value="2026-09-15"></ark-calendar-wrapper>`
    })(class {});

    const { app, ref } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    await expect(angularSetArkLocale === setArkLocale).toBe(true);
    const group = canvasElement.querySelector("ark-menu-group") as HTMLElement;
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAttribute("data-testid", "export");
    const label = group.querySelector('[data-ark="menu-group-label"]') as HTMLElement;
    await expect(label).toHaveTextContent("Exportar");
    await expect(group).toHaveAttribute("aria-labelledby", label.id);
    await expect(group.querySelector("ark-menu-item")).toHaveAttribute("value", "pdf");

    const calendar = canvasElement.querySelector("ark-calendar") as HTMLElement;
    await expect(calendar.hasAttribute("lang")).toBe(false);
    const english = calendar.textContent;
    try {
      angularSetArkLocale("pt");
      await expect(calendar.textContent).toContain(resolveLocale("pt").months[8]);
    } finally {
      angularSetArkLocale(null);
    }
    await expect(calendar.textContent).toBe(english);
    ref.destroy();
    app.destroy();
  }
};

// ark-time-wrapper: Date e ms viram ISO no atributo, e o texto sai pelo Intl no idioma pedido.
export const Time = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const instant = new Date(Date.now() - 2 * 3600000);
    const Host = Component({
      standalone: true,
      imports: [ArkTimeComponent],
      template: `
        <ark-time-wrapper [datetime]="instant" lang="pt-BR" testid="updated"></ark-time-wrapper>
        <ark-time-wrapper [datetime]="iso" format="date" lang="en"></ark-time-wrapper>
        <ark-time-wrapper [datetime]="ms"></ark-time-wrapper>`
    })(
      class {
        instant = instant;
        iso = instant.toISOString();
        ms = instant.getTime();
      }
    );

    const { app, ref } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    const [relative, absolute, fromMs] = Array.from(canvasElement.querySelectorAll("ark-time")) as HTMLElement[];
    await expect(relative).toHaveAttribute("datetime", instant.toISOString());
    await expect(relative.querySelector("time")?.textContent).toBe("há 2 horas");
    await expect(relative).toHaveAttribute("data-testid", "updated");
    await expect(absolute).toHaveAttribute("format", "date");
    await expect(absolute.querySelector("time")?.textContent).toBe(
      new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(instant)
    );
    await expect(fromMs).toHaveAttribute("datetime", instant.toISOString());
    ref.destroy();
    app.destroy();
  }
};

// Entradas secundárias @tooark/angular/chart, /code e /wysiwyg: option pela propriedade, e texto e JSON controlados
// (o valor que o (changed) devolve volta pelo binding sem mover o cursor).
class SidePackagesHost {
  option = {
    xAxis: { type: "category" as const, data: ["a", "b"] },
    yAxis: {},
    series: [{ type: "bar" as const, data: [1, 2] }]
  };
  code = "";
  doc: unknown = { type: "doc", content: [{ type: "paragraph" }] };
  clicks = 0;
}

function sideText(doc: unknown): string {
  const node = doc as { text?: string; content?: unknown[] } | null;
  if (!node) return "";
  return (node.text ?? "") + (node.content ?? []).map(sideText).join("");
}

export const SidePackages = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkChartComponent, ArkCodeEditorComponent, ArkWysiwygEditorComponent],
      template: `
        <ark-chart-wrapper [option]="option" palette="tokens" height="160px" (chartClick)="clicks = clicks + 1"></ark-chart-wrapper>
        <ark-code-editor-wrapper [value]="code" maxHeight="12rem" [lineNumbers]="false" (changed)="code = $event.detail.value"></ark-code-editor-wrapper>
        <ark-wysiwyg-editor-wrapper [content]="doc" toolbar="none" ariaLabel="Notas" (changed)="doc = $event.detail"></ark-wysiwyg-editor-wrapper>`
    })(SidePackagesHost);

    const { app, ref, host, detect } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    const chart = canvasElement.querySelector("ark-chart") as HTMLElement & { option: unknown };
    await waitFor(() => expect(chart.option === host.option).toBe(true));
    await expect(chart).toHaveAttribute("palette", "tokens");
    chart.dispatchEvent(new CustomEvent("ark-chart-click", { detail: {}, bubbles: true }));
    await expect(host.clicks).toBe(1);

    const type = async (content: HTMLElement): Promise<void> => {
      await userEvent.click(content);
      for (const key of ["a", "b", "{ArrowLeft}", "X", "Y"]) {
        await userEvent.keyboard(key);
        detect();
      }
    };
    const code = canvasElement.querySelector("ark-code-editor") as HTMLElement;
    await expect(code).toHaveAttribute("max-height", "12rem");
    await type(await waitFor(() => code.querySelector(".cm-content") as HTMLElement));
    await waitFor(() => expect(host.code).toBe("aXYb"));
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as HTMLElement;
    await type(await waitFor(() => editor.querySelector(".ProseMirror") as HTMLElement));
    await waitFor(() => expect(sideText(host.doc)).toBe("aXYb"));
    ref.destroy();
    app.destroy();
  }
};

// ark-tree-wrapper e ark-tree-item-wrapper (display: contents entre a árvore, ou o item pai, e o item): a árvore acha
// os itens por descendência, o subitem ocupa a largura do pai e os eventos chegam aos outputs.
class TreeHost {
  log: string[] = [];
}

export const Tree = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkTreeComponent, ArkTreeItemComponent],
      template: `
        <ark-tree-wrapper label="Arquivos" selection="single" icons="files" iconColor="primary"
          (arkToggle)="log.push('toggle ' + $event.detail.value + ' ' + $event.detail.expanded)"
          (arkSelectionChange)="log.push('selection ' + $any($event.detail.values).join(','))"
          (arkActivate)="log.push('activate ' + $event.detail.value)">
          <ark-tree-item-wrapper value="src" label="src" [expanded]="true">
            <span slot="trailing">2</span>
            <ark-tree-item-wrapper value="src/index.ts" label="index.ts"></ark-tree-item-wrapper>
            <ark-tree-item-wrapper value="src/app.ts" label="app.ts"></ark-tree-item-wrapper>
          </ark-tree-item-wrapper>
          <ark-tree-item-wrapper value="docs" label="docs">
            <ark-tree-item-wrapper value="docs/guide.md" label="guide.md" icon="folder"></ark-tree-item-wrapper>
          </ark-tree-item-wrapper>
        </ark-tree-wrapper>`
    })(TreeHost);

    const { app, ref, host } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    const tree = canvasElement.querySelector("ark-tree") as HTMLElement;
    const item = (value: string) =>
      canvasElement.querySelector(`ark-tree-item[value="${value}"]`) as HTMLElement & { rowElement: HTMLElement };
    await waitFor(() => expect(item("src/index.ts").rowElement).toHaveAttribute("aria-level", "2"));
    await expect(item("src/index.ts").parentElement?.closest("ark-tree-item")).toBe(item("src"));
    await expect(item("src").rowElement).toHaveAttribute("aria-setsize", "2");
    await expect(item("src/index.ts").rowElement).toHaveAttribute("aria-setsize", "2");
    await expect(Math.round(item("src/index.ts").getBoundingClientRect().width)).toBe(
      Math.round(item("src").getBoundingClientRect().width)
    );
    // As props dos ícones chegam como atributos e desenham o ícone próprio.
    const kind = (value: string) =>
      item(value).querySelector(':scope > [data-ark-chrome="icon"]')?.getAttribute("data-ark-icon") ?? null;
    await expect(tree).toHaveAttribute("icons", "files");
    await expect(tree.style.getPropertyValue("--ark-tree-icon-color")).toBe("var(--ark-color-primary)");
    await expect(kind("src")).toBe("folder-open");
    await expect(kind("src/index.ts")).toBe("file");
    await expect(kind("docs/guide.md")).toBe("folder");
    await expect(item("docs/guide.md")).not.toBeVisible();
    await userEvent.click(within(item("src/index.ts")).getByText("index.ts"));
    await expect(tree).toHaveAttribute("value", "src/index.ts");
    item("docs").rowElement.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(item("docs/guide.md")).toBeVisible();
    await expect(host.log).toEqual(["selection src/index.ts", "activate src/index.ts", "toggle docs true"]);
    ref.destroy();
    app.destroy();
  }
};

// ark-button-group-wrapper e ark-radio-group-wrapper: os wrappers dos filhos (ark-button-wrapper, ark-radio-wrapper)
// ficam entre o grupo e o elemento e gravam os próprios padrões, e mesmo assim o atributo do grupo vale, os botões
// saem colados (o wrapper vira display: contents dentro do grupo) e o output do grupo recebe um `change` só.
class GroupsHost {
  log: string[] = [];
}

export const Groups = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkButtonComponent, ArkButtonGroupComponent, ArkRadioComponent, ArkRadioGroupComponent],
      template: `
        <ark-button-group-wrapper label="Período" size="sm" variant="outline" orientation="vertical">
          <ark-button-wrapper>Dia</ark-button-wrapper>
          <ark-button-wrapper>Semana inteira</ark-button-wrapper>
        </ark-button-group-wrapper>
        <ark-radio-group-wrapper label="Plano" name="plano" value="pro" size="lg" errorMessage="Escolha um plano."
          (changed)="log.push('group ' + $event.detail.value)">
          <ark-radio-wrapper value="pro" label="Profissional"></ark-radio-wrapper>
          <ark-radio-wrapper value="team" label="Equipe"
            (changed)="log.push('radio ' + $event.detail.value)"></ark-radio-wrapper>
        </ark-radio-group-wrapper>`
    })(GroupsHost);

    const { app, ref, host } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);

    const buttons = canvasElement.querySelector("ark-button-group") as HTMLElement;
    const [first, second] = Array.from(buttons.querySelectorAll<HTMLElement>("ark-button"));
    await waitFor(() => expect(second).toHaveAttribute("data-ark-group-pos", "last"));
    await expect(buttons).toHaveAttribute("aria-label", "Período");
    await expect(first).toHaveAttribute("data-ark-group-pos", "first");
    await expect(first).toHaveAttribute("data-ark-group-dir", "vertical");
    // O padrão que o wrapper do botão grava (size="md", variant="primary") cede ao do grupo.
    await expect(first).toHaveAttribute("size", "sm");
    await expect(first).toHaveAttribute("variant", "outline");
    // Atrás do wrapper o botão continua sendo o item do grupo: estica na coluna e cola no vizinho.
    await expect(getComputedStyle(first.parentElement as HTMLElement).display).toBe("contents");
    await expect(first.getBoundingClientRect().width).toBe(second.getBoundingClientRect().width);
    await expect(
      Math.round((first.getBoundingClientRect().bottom - second.getBoundingClientRect().top) * 100) / 100
    ).toBe(1);

    const radios = canvasElement.querySelector("ark-radio-group") as HTMLElement;
    const radio = (value: string) => radios.querySelector(`ark-radio[value="${value}"]`) as HTMLElement;
    await waitFor(() => expect(radio("pro")).toHaveAttribute("checked", ""));
    await expect(radios).toHaveAccessibleName("Plano");
    await expect(radios).toHaveAccessibleDescription("Escolha um plano.");
    await expect(radio("pro")).toHaveAttribute("size", "lg");
    await expect(radio("pro")).toHaveAttribute("name", "plano");
    // Os rádios ficam empilhados abaixo da legenda e acima da mensagem, mesmo atrás dos wrappers.
    const label = (radios.querySelector('[data-ark="radio-group-label"]') as HTMLElement).getBoundingClientRect();
    const message = (radios.querySelector('[data-ark="radio-group-error"]') as HTMLElement).getBoundingClientRect();
    await expect(label.bottom).toBeLessThanOrEqual(radio("pro").getBoundingClientRect().top);
    await expect(radio("pro").getBoundingClientRect().bottom).toBeLessThanOrEqual(
      radio("team").getBoundingClientRect().top
    );
    await expect(radio("team").getBoundingClientRect().bottom).toBeLessThanOrEqual(message.top);
    await userEvent.click(within(radios).getByRole("radio", { name: "Equipe" }));
    await expect(radios).toHaveAttribute("value", "team");
    await expect(radio("pro").hasAttribute("checked")).toBe(false);
    await expect(host.log).toEqual(["radio team", "group team"]);
    ref.destroy();
    app.destroy();
  }
};

class RadioGroupValueHost {
  label = "Plano";
  value: string | undefined = undefined;
}

// `value` do ark-radio-group-wrapper: sem ele a escolha do usuário fica, com ele o app controla, e tirá-lo desmarca
// (ver radio-group-value.ts).
export const RadioGroupValue = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkRadioComponent, ArkRadioGroupComponent],
      template: `
        <ark-radio-group-wrapper name="plano" [label]="label" [value]="value">
          <ark-radio-wrapper value="pro" label="Profissional"></ark-radio-wrapper>
          <ark-radio-wrapper value="team" label="Equipe"></ark-radio-wrapper>
        </ark-radio-group-wrapper>`
    })(RadioGroupValueHost);

    const { app, ref, host, detect } = await mount(canvasElement, Host, errors);
    await expectRadioGroupValue(canvasElement, async (props: RadioGroupProps) => {
      host.label = props.label;
      host.value = props.value;
      detect();
    });
    await expect(errors).toEqual([]);
    ref.destroy();
    app.destroy();
  }
};

class OverlayEventsHost {
  log: string[] = [];
}

// (arkOpen) e (arkClose) só para os eventos do próprio elemento (ver overlay-events.ts): um ark-menu ou uma aba
// fechável dentro de um ark-dialog-wrapper disparava o (arkClose) do diálogo, e o app o fechava.
export const OverlayEventsAreItsOwn = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [
        ArkDialogComponent,
        ArkDrawerComponent,
        ArkCommandPaletteComponent,
        ArkCommandItemComponent,
        ArkMenuComponent,
        ArkMenuItemComponent,
        ArkTabsComponent,
        ArkTabComponent
      ],
      template: `
        <ark-dialog-wrapper label="Editar"
          (arkOpen)="log.push('ark-dialog:open')" (arkClose)="log.push('ark-dialog:close')">
          <span data-child>Corpo</span>
          <button type="button" id="angular-events-trigger">Opções</button>
          <ark-menu-wrapper for="angular-events-trigger" ariaLabel="Opções"
            (arkOpen)="log.push('ark-menu:open')" (arkClose)="log.push('ark-menu:close')">
            <ark-menu-item-wrapper value="copy"><span data-child>Duplicar</span></ark-menu-item-wrapper>
          </ark-menu-wrapper>
          <ark-tabs-wrapper label="Arquivos" variant="editor"
            (arkClose)="log.push('ark-tabs:close:' + $event.detail.value)">
            <ark-tab-wrapper value="t1" [closable]="true"><span data-child>um.ts</span></ark-tab-wrapper>
          </ark-tabs-wrapper>
        </ark-dialog-wrapper>
        <ark-drawer-wrapper label="Filtros"
          (arkOpen)="log.push('ark-drawer:open')" (arkClose)="log.push('ark-drawer:close')">
          <span data-child>Corpo</span>
        </ark-drawer-wrapper>
        <ark-command-palette-wrapper label="Comandos"
          (arkOpen)="log.push('ark-command-palette:open')" (arkClose)="log.push('ark-command-palette:close')">
          <ark-command-item-wrapper value="a"><span data-child>Alpha</span></ark-command-item-wrapper>
        </ark-command-palette-wrapper>`
    })(OverlayEventsHost);

    const { app, ref, host } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    await expectOwnOverlayEvents(canvasElement.lastElementChild as HTMLElement, host.log);
    await expect(errors).toEqual([]);
    ref.destroy();
    app.destroy();
  }
};

class ContainerEventsHost {
  log: string[] = [];
  rows = [{ id: 1, name: "Ana" }];
  columns: ArkDataViewColumn<{ id: number; name: string }>[] = [{ key: "name", label: "Nome" }];
}

// Os outros wrappers cujo elemento recebe conteúdo do app (ver overlay-events.ts): o (arkResize) de um
// ark-split-pane-wrapper recebia o `ark-resize` de outro split-pane dentro de um painel dele.
export const ContainerEventsAreItsOwn = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [
        ArkSplitPaneComponent,
        ArkCarouselComponent,
        ArkNavComponent,
        ArkNavGroupComponent,
        ArkTreeComponent,
        ArkTreeItemComponent,
        ArkDataViewComponent
      ],
      template: `
        <ark-split-pane-wrapper style="display: block; height: 200px"
          (arkResize)="log.push('ark-split-pane:ark-resize')">
          <div><span data-child>Lateral</span></div>
          <ark-split-pane-wrapper direction="vertical" (arkResize)="log.push('inner:ark-resize')">
            <div>Editor</div>
            <div>Console</div>
          </ark-split-pane-wrapper>
        </ark-split-pane-wrapper>
        <ark-carousel-wrapper (arkSlideChange)="log.push('ark-carousel:ark-slide-change')">
          <div><span data-child>Um</span></div>
          <div>Dois</div>
        </ark-carousel-wrapper>
        <ark-nav-wrapper label="Principal" (arkCollapse)="log.push('ark-nav:ark-collapse')">
          <ark-nav-group-wrapper label="Explorador" [expandable]="true" [open]="true"
            (arkToggle)="log.push('ark-nav-group:ark-toggle')">
            <ark-tree-wrapper label="Arquivos"
              (arkToggle)="log.push('ark-tree:ark-toggle')"
              (arkSelectionChange)="log.push('ark-tree:ark-selection-change')"
              (arkActivate)="log.push('ark-tree:ark-activate')">
              <ark-tree-item-wrapper value="src" label="src">
                <span slot="trailing" data-child>2</span>
                <ark-tree-item-wrapper value="a" label="a.ts"></ark-tree-item-wrapper>
              </ark-tree-item-wrapper>
            </ark-tree-wrapper>
          </ark-nav-group-wrapper>
        </ark-nav-wrapper>
        <ark-data-view-wrapper [rows]="rows" [columns]="columns"
          (arkQueryChange)="log.push('ark-data-view:ark-query-change')"
          (arkViewChange)="log.push('ark-data-view:ark-view-change')"
          (arkRowClick)="log.push('ark-data-view:ark-row-click')"
          (arkSelectionChange)="log.push('ark-data-view:ark-selection-change')"
          (arkReorder)="log.push('ark-data-view:ark-reorder')">
          <span slot="toolbar" data-child>Filtros</span>
        </ark-data-view-wrapper>`
    })(ContainerEventsHost);

    const { app, ref, host } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    await expectOwnContainerEvents(canvasElement.lastElementChild as HTMLElement, host.log);
    await expect(errors).toEqual([]);
    ref.destroy();
    app.destroy();
  }
};

class OptInAttributesHost {}

// Atributos opt-in da 1.10.0 pelos wrappers: cada prop nova chega ao elemento (conferência comum em
// opt-in-attributes.ts, a mesma cena nos três frameworks).
export const OptInAttributes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const Host = Component({
      standalone: true,
      imports: [ArkTextareaComponent],
      template: `<ark-textarea-wrapper label="Notas" [autosize]="true" [maxRows]="4"></ark-textarea-wrapper>`
    })(OptInAttributesHost);

    const { app, ref } = await mount(canvasElement, Host, errors);
    await expect(errors).toEqual([]);
    await expectOptInAttributes(canvasElement);
    ref.destroy();
    app.destroy();
  }
};
