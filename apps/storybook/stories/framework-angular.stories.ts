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
  ArkCardComponent,
  ArkDataViewCardDirective,
  ArkDataViewCellDirective,
  ArkDataViewComponent,
  ArkEmptyComponent,
  ArkPaginationComponent,
  ArkSwitchComponent
} from "@tooark/angular";
import type {
  ArkDataViewColumn,
  ArkDataViewLayout,
  ArkDataViewQueryChangeDetail,
  ArkDataViewSelectionChangeDetail,
  ArkPageChangeDetail
} from "@tooark/core";
import type { ArkDataView as ArkDataViewElement } from "@tooark/web-components";
import { expect, waitFor } from "storybook/test";

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
