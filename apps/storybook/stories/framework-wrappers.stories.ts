import { type ArkKvRow, type ArkKvValueField, type ArkMarkShape, type ArkSchedulerEvent, toast } from "@tooark/core";
import {
  ArkButton as ReactArkButton,
  ArkCalendar as ReactArkCalendar,
  ArkCheckbox as ReactArkCheckbox,
  ArkDatepicker as ReactArkDatepicker,
  ArkDialog as ReactArkDialog,
  ArkFileInput as ReactArkFileInput,
  ArkInput as ReactArkInput,
  ArkKvEditor as ReactArkKvEditor,
  ArkMenu as ReactArkMenu,
  ArkMenuItem as ReactArkMenuItem,
  ArkScheduler as ReactArkScheduler,
  ArkShapePicker as ReactArkShapePicker,
  ArkSwitch as ReactArkSwitch,
  ArkTextarea as ReactArkTextarea,
  ArkToaster as ReactArkToaster
} from "@tooark/react";
import {
  ArkButton as VueArkButton,
  ArkKvEditor as VueArkKvEditor,
  ArkMenu as VueArkMenu,
  ArkMenuItem as VueArkMenuItem,
  ArkScheduler as VueArkScheduler,
  ArkShapePicker as VueArkShapePicker,
  ArkToaster as VueArkToaster
} from "@tooark/vue";
import type {
  ArkButton as ArkButtonElement,
  ArkDialog as ArkDialogElement,
  ArkKvEditor as ArkKvEditorElement,
  ArkSwitch as ArkSwitchElement
} from "@tooark/web-components";
import { createElement, createRef, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { expect, waitFor } from "storybook/test";
import { createApp, h, nextTick, ref } from "vue";

// Os wrappers com react-dom e vue de verdade. O preview já registrou os elementos, então cada ark-* nasce "upgraded"
// e os frameworks gravam as props como propriedade: o caminho que o React 19 e o Vue seguem num app real a partir do
// segundo render.
const meta = {
  title: "Integration/Framework Wrappers"
};

export default meta;

const EVENT_A: ArkSchedulerEvent = {
  id: "a",
  title: "Planejamento",
  start: "2026-09-15T10:00",
  end: "2026-09-15T11:00"
};
const EVENT_B: ArkSchedulerEvent = {
  id: "b",
  title: "Retrospectiva",
  start: "2026-09-16T14:00",
  end: "2026-09-16T15:00"
};

function mountPoint(canvasElement: HTMLElement): HTMLElement {
  const host = document.createElement("div");
  canvasElement.append(host);
  return host;
}

function reactRoot(canvasElement: HTMLElement, errors: unknown[]): (node: ReactNode) => Root {
  const root = createRoot(mountPoint(canvasElement), {
    onUncaughtError: (error) => errors.push(error),
    onCaughtError: (error) => errors.push(error)
  });
  return (node) => {
    flushSync(() => root.render(node));
    return root;
  };
}

type Ctx = { canvasElement: HTMLElement };

export const ReactSubmitButton = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    let submitted = 0;
    const render = reactRoot(canvasElement, errors);
    const form = (label: string): ReactNode =>
      createElement(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            submitted++;
          }
        },
        createElement(ReactArkButton, { type: "submit", intent: "primary" }, label)
      );

    render(form("Salvar"));
    await expect(errors).toEqual([]);
    const button = canvasElement.querySelector("ark-button") as HTMLElement;
    await expect(button).toHaveAttribute("type", "submit");

    button.click();
    await waitFor(() => expect(submitted).toBe(1));

    // Update depois do mount: o React regrava a prop só quando muda, mas o render não pode lançar.
    render(form("Salvar de novo"));
    await expect(errors).toEqual([]);
  }
};

export const ReactControlledProps = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const tree = (value: string, events: ArkSchedulerEvent[], open: boolean): ReactNode => [
      createElement(ReactArkDatepicker, { key: "dp", value, mode: "date" }),
      createElement(ReactArkScheduler, { key: "sc", date: "2026-09-15", view: "week", events }),
      createElement("button", { key: "tg", id: "wrapper-menu-trigger", type: "button" }, "Ações"),
      createElement(
        ReactArkMenu,
        { key: "mn", htmlFor: "wrapper-menu-trigger", open },
        createElement(ReactArkMenuItem, { value: "abrir" }, "Abrir")
      )
    ];

    render(tree("2026-09-15", [EVENT_A], true));
    await expect(errors).toEqual([]);
    const datepicker = canvasElement.querySelector("ark-datepicker") as HTMLElement & { value: string };
    const scheduler = canvasElement.querySelector("ark-scheduler") as HTMLElement & { events: ArkSchedulerEvent[] };
    const menu = canvasElement.querySelector("ark-menu") as HTMLElement;
    await expect(datepicker.value).toBe("2026-09-15");
    await expect(scheduler.events.map((event) => event.id)).toEqual(["a"]);
    // `open` chega antes do nó entrar no DOM: o menu precisa abrir ao conectar.
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await expect(canvasElement.querySelector("ark-menu-item")).toHaveAttribute("value", "abrir");

    render(tree("2026-09-20", [EVENT_A, EVENT_B], false));
    await expect(errors).toEqual([]);
    await expect(datepicker.value).toBe("2026-09-20");
    await expect(scheduler.events.map((event) => event.id)).toEqual(["a", "b"]);
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
  }
};

export const VueSubmitButton = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    let submitted = 0;
    const app = createApp({
      setup: () => () =>
        h(
          "form",
          {
            onSubmit: (event: SubmitEvent) => {
              event.preventDefault();
              submitted++;
            }
          },
          [h(VueArkButton, { type: "submit" }, () => "Salvar")]
        )
    });
    // O Vue engole a falha de gravar a propriedade com um warn e nunca grava o atributo: o warn é o sintoma.
    app.config.warnHandler = (message) => problems.push(message);
    app.config.errorHandler = (error) => problems.push(String(error));
    app.mount(mountPoint(canvasElement));

    const button = canvasElement.querySelector("ark-button") as HTMLElement;
    await expect(problems).toEqual([]);
    await expect(button).toHaveAttribute("type", "submit");
    button.click();
    await waitFor(() => expect(submitted).toBe(1));
  }
};

export const VueControlledEvents = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const events = ref<ArkSchedulerEvent[]>([EVENT_A]);
    const app = createApp({
      setup: () => () => h(VueArkScheduler, { date: "2026-09-15", view: "week", events: events.value })
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.config.errorHandler = (error) => problems.push(String(error));
    app.mount(mountPoint(canvasElement));

    const scheduler = canvasElement.querySelector("ark-scheduler") as HTMLElement & { events: ArkSchedulerEvent[] };
    await expect(scheduler.events.map((event) => event.id)).toEqual(["a"]);

    events.value = [EVENT_A, EVENT_B];
    await nextTick();
    await expect(problems).toEqual([]);
    await expect(scheduler.events.map((event) => event.id)).toEqual(["a", "b"]);
  }
};

export const VueButtonVariantIntent = {
  render: () => document.createElement("div"),
  // O wrapper não pode mandar um intent padrão: `variant="danger"` sem `intent` é um botão danger.
  play: async ({ canvasElement }: Ctx) => {
    const app = createApp({
      setup: () => () => [
        h(VueArkButton, { variant: "danger", testid: "excluir" }, () => "Excluir"),
        h(VueArkButton, { variant: "outline", intent: "success" }, () => "Salvar")
      ]
    });
    app.mount(mountPoint(canvasElement));
    const [danger, outline] = Array.from(canvasElement.querySelectorAll("ark-button"));
    await expect(danger.hasAttribute("intent")).toBe(false);
    await expect(danger).toHaveAttribute("data-testid", "excluir");
    await expect(danger.classList.contains("ark:bg-danger")).toBe(true);
    await expect(outline.classList.contains("ark:border-success-border")).toBe(true);
  }
};

// `checked` tem três estados: ausente é item comum, true marca e false desmarca um item checkbox.
const roleOf = (el: Element | null): string | null => el?.getAttribute("role") ?? null;

export const VueMenuItemChecked = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const checked = ref<boolean | undefined>(true);
    const app = createApp({
      setup: () => () =>
        h(VueArkMenu, { "aria-label": "Exibir" }, () => [
          h(VueArkMenuItem, { value: "plain" }, () => "Comum"),
          h(VueArkMenuItem, { value: "grid", checked: checked.value }, () => "Grade")
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    const [plain, grid] = Array.from(canvasElement.querySelectorAll("ark-menu-item"));

    await expect(roleOf(plain)).toBe("menuitem");
    await expect(roleOf(grid)).toBe("menuitemcheckbox");
    await expect(grid).toHaveAttribute("aria-checked", "true");
    checked.value = false;
    await nextTick();
    await expect(roleOf(grid)).toBe("menuitemcheckbox");
    await expect(grid).toHaveAttribute("aria-checked", "false");
    checked.value = undefined;
    await nextTick();
    await expect(roleOf(grid)).toBe("menuitem");
    await expect(problems).toEqual([]);
  }
};

export const ReactMenuItemChecked = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const tree = (checked: boolean | undefined): ReactNode =>
      createElement(
        ReactArkMenu,
        { "aria-label": "Exibir" },
        createElement(ReactArkMenuItem, { key: "p", value: "plain" }, "Comum"),
        createElement(ReactArkMenuItem, { key: "g", value: "grid", checked }, "Grade")
      );

    render(tree(true));
    const [plain, grid] = Array.from(canvasElement.querySelectorAll("ark-menu-item"));
    await expect(roleOf(plain)).toBe("menuitem");
    await expect(grid).toHaveAttribute("aria-checked", "true");
    render(tree(false));
    await expect(roleOf(grid)).toBe("menuitemcheckbox");
    await expect(grid).toHaveAttribute("aria-checked", "false");
    // Tirar a prop: o React 19 grava undefined na propriedade, que precisa voltar a item comum.
    render(tree(undefined));
    await expect(roleOf(grid)).toBe("menuitem");
    await expect(errors).toEqual([]);
  }
};

// autofocus e spellcheck também são propriedades nativas booleanas do host: o React 19 grava nelas.
export const ReactNativeBooleanProps = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    render([
      createElement(ReactArkTextarea, { key: "t", label: "Notas", spellcheck: false }),
      createElement(ReactArkInput, { key: "i", label: "Busca", autofocus: true, spellcheck: false })
    ]);
    await expect(errors).toEqual([]);
    const input = canvasElement.querySelector("ark-input input") as HTMLInputElement;
    const textarea = canvasElement.querySelector("ark-textarea textarea") as HTMLTextAreaElement;
    await expect(input.spellcheck).toBe(false);
    await expect(textarea.spellcheck).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(input));
  }
};

// Props que os wrappers não repassavam: lang e ação do toaster, error e directory do file-input, wrap do textarea e
// o resto (data-*, aria-*) nos wrappers que montavam os atributos à mão.
export const ReactPassThroughProps = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const actions: Array<string | null> = [];
    const render = reactRoot(canvasElement, errors);
    render([
      createElement(ReactArkToaster, {
        key: "t",
        lang: "pt",
        duration: 0,
        onAction: (event: CustomEvent<{ id: string; actionId: string | null }>) => actions.push(event.detail.actionId)
      }),
      createElement(ReactArkFileInput, { key: "f", label: "Anexo", error: true }),
      createElement(ReactArkFileInput, { key: "d", label: "Pasta", directory: true, testid: "pasta" }),
      createElement(ReactArkTextarea, { key: "x", label: "Log", wrap: "off" }),
      createElement(ReactArkCalendar, { key: "c", "data-secao": "agenda", "aria-describedby": "dica" })
    ]);
    await expect(errors).toEqual([]);

    const calendar = canvasElement.querySelector("ark-calendar") as HTMLElement;
    await expect(calendar).toHaveAttribute("data-secao", "agenda");
    await expect(calendar).toHaveAttribute("aria-describedby", "dica");
    await expect(canvasElement.querySelector("ark-textarea textarea")).toHaveAttribute("wrap", "off");
    await expect(canvasElement.querySelector('[data-ark="file-input-button"]')).toHaveAttribute("aria-invalid", "true");
    await expect(canvasElement.querySelector('[data-testid="pasta"]')).toHaveAttribute("webkitdirectory");
    await expect(canvasElement.querySelector('input[type="file"]:not([data-testid])')).not.toHaveAttribute(
      "webkitdirectory"
    );

    try {
      toast("Arquivo movido", { actionLabel: "Desfazer", actionId: "undo" });
      const close = await waitFor(() => canvasElement.querySelector('[data-ark="toaster-toast-close"]') as HTMLElement);
      await expect(close.textContent).toBe("Fechar");
      (canvasElement.querySelector('[data-ark="toaster-toast-action"]') as HTMLElement).click();
      await expect(actions).toEqual(["undo"]);
    } finally {
      toast.dismiss();
    }
  }
};

// Atributos e handlers DOM do React nos wrappers (tipados por ArkDomProps): chegam ao elemento como chegariam num
// <div>. O caso que pediu a tipagem: a caixa dentro de uma linha clicável segura o clique com stopPropagation.
export const ReactDomProps = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    let rowClicks = 0;
    let boxClicks = 0;
    const changes: boolean[] = [];
    render(
      createElement(
        "div",
        { onClick: () => rowClicks++ },
        createElement(ReactArkCheckbox, {
          id: "linha-1",
          title: "Ativar a linha",
          style: { marginLeft: "4px" },
          "aria-label": "Ativar",
          "data-linha": "1",
          onClick: (event) => {
            boxClicks++;
            event.stopPropagation();
          },
          onChange: (event) => changes.push(event.detail.checked)
        })
      )
    );
    await expect(errors).toEqual([]);

    const host = canvasElement.querySelector("ark-checkbox") as HTMLElement;
    await expect(host.id).toBe("linha-1");
    await expect(host.title).toBe("Ativar a linha");
    await expect(host.style.marginLeft).toBe("4px");
    await expect(host).toHaveAttribute("data-linha", "1");

    const box = host.querySelector('[data-ark="checkbox"]') as HTMLElement;
    await expect(box).toHaveAccessibleName("Ativar");
    box.click();
    await expect(boxClicks).toBe(1);
    await expect(rowClicks).toBe(0);
    await expect(changes).toEqual([true]);
  }
};

export const VueToasterLangAndAction = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const actions: Array<string | null> = [];
    const app = createApp({
      setup: () => () =>
        h(VueArkToaster, {
          lang: "es",
          duration: 0,
          "onArk-toast-action": (event: CustomEvent<{ actionId: string | null }>) => actions.push(event.detail.actionId)
        })
    });
    app.mount(mountPoint(canvasElement));
    try {
      toast("Guardado", { actionLabel: "Deshacer", actionId: "undo" });
      const close = await waitFor(() => canvasElement.querySelector('[data-ark="toaster-toast-close"]') as HTMLElement);
      await expect(close.textContent).toBe("Cerrar");
      (canvasElement.querySelector('[data-ark="toaster-toast-action"]') as HTMLElement).click();
      await expect(actions).toEqual(["undo"]);
    } finally {
      toast.dismiss();
    }
  }
};

// Dialog que já nasce aberto: o onOpen do wrapper (ligado num useEffect, depois do commit) ainda recebe o ark-open.
export const ReactDialogOpenOnMount = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    let opened = 0;
    // Render comum (sem flushSync), como num app: os efeitos rodam numa tarefa depois do commit.
    const root = createRoot(mountPoint(canvasElement));
    root.render(createElement(ReactArkDialog, { label: "Aviso", open: true, onOpen: () => opened++ }, "Oi"));
    await waitFor(() => expect(opened).toBe(1));
    (canvasElement.querySelector("ark-dialog") as HTMLElement & { close: () => void }).close();
  }
};

const ROW_HOST: ArkKvRow = { id: "host", key: "HOST", value: "localhost", enabled: true };
const ROW_PORT: ArkKvRow = { id: "port", key: "PORT", value: "8080", enabled: true };

// A ref do app chega ao ark-*: direto no ArkButton (sem ref própria) e pela useForwardedRef nos wrappers que usam o
// elemento, cujos efeitos continuam ligando eventos (onOpen do dialog) e gravando propriedades (rows do kv-editor).
export const ReactForwardedRef = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const buttonRef = createRef<ArkButtonElement>();
    const dialogRef = createRef<ArkDialogElement>();
    const kvCalls: Array<ArkKvEditorElement | null> = [];
    const kvRef = (node: ArkKvEditorElement | null): void => {
      kvCalls.push(node);
    };
    // Callback ref do React 19 que devolve limpeza: ao desmontar roda a limpeza, e não uma chamada com null.
    const switchCalls: Array<ArkSwitchElement | null> = [];
    let switchCleanups = 0;
    const switchRef = (node: ArkSwitchElement | null): (() => void) => {
      switchCalls.push(node);
      return () => {
        switchCleanups++;
      };
    };
    let clicks = 0;
    let opened = 0;
    // Refs criadas uma vez, fora do tree: um rerender não troca a callback ref, então ela não é chamada de novo.
    const tree = (rows: ArkKvRow[]): ReactNode => [
      createElement(ReactArkButton, { key: "b", ref: buttonRef, onClick: () => clicks++ }, "Salvar"),
      createElement(ReactArkDialog, { key: "d", ref: dialogRef, label: "Aviso", onOpen: () => opened++ }, "Oi"),
      createElement(ReactArkKvEditor, { key: "k", ref: kvRef, rows }),
      createElement(ReactArkSwitch, { key: "s", ref: switchRef, label: "Wi-Fi" })
    ];

    const root = render(tree([ROW_HOST]));
    await expect(errors).toEqual([]);
    await expect(buttonRef.current?.tagName).toBe("ARK-BUTTON");
    await expect(dialogRef.current?.tagName).toBe("ARK-DIALOG");
    await expect(kvCalls.map((node) => node?.tagName)).toEqual(["ARK-KV-EDITOR"]);
    await expect(switchCalls.map((node) => node?.tagName)).toEqual(["ARK-SWITCH"]);

    const kv = kvCalls[0] as ArkKvEditorElement;
    await expect(kv.rows.map((row) => row.key)).toEqual(["HOST"]);
    buttonRef.current?.click();
    await expect(clicks).toBe(1);
    const dialog = dialogRef.current as ArkDialogElement;
    dialog.show();
    await waitFor(() => expect(opened).toBe(1));
    dialog.close();
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(false));

    render(tree([ROW_HOST, ROW_PORT]));
    await expect(errors).toEqual([]);
    await expect(kv.rows.map((row) => row.key)).toEqual(["HOST", "PORT"]);
    await expect(kvCalls).toHaveLength(1);

    root.unmount();
    await expect(buttonRef.current).toBeNull();
    await expect(dialogRef.current).toBeNull();
    await expect(kvCalls.map((node) => node?.tagName ?? null)).toEqual(["ARK-KV-EDITOR", null]);
    await expect(switchCalls).toHaveLength(1);
    await expect(switchCleanups).toBe(1);
  }
};

// Célula de valor do app para os testes de wrapper: um <input> nativo basta para provar o encanamento.
const nativeValueField: ArkKvValueField = () => {
  const input = document.createElement("input");
  input.setAttribute("data-origem", "app");
  return input;
};

const VALUE_ROWS: ArkKvRow[] = [{ id: "v1", key: "host", value: "{{baseUrl}}", enabled: true }];

function valueCells(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll('ark-kv-editor [data-ark-chrome="row"] > [data-ark-field="value"]'));
}

// `valueField` vai como propriedade (função) e `shapes` como a lista do atributo; sem `valueField` o editor fica como
// sempre, sem a propriedade gravada.
export const ReactKvValueFieldAndShapes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const changes: ArkKvRow[][] = [];
    const onChange = (event: CustomEvent<{ rows: ArkKvRow[] }>) => changes.push(event.detail.rows);
    const tree = (withField: boolean) =>
      createElement("div", null, [
        createElement(ReactArkKvEditor, {
          key: "kv",
          rows: VALUE_ROWS,
          valueField: withField ? nativeValueField : undefined,
          onChange
        }),
        createElement(ReactArkShapePicker, { key: "shapes", shapes: ["moon", "cross", "asterisk"] })
      ]);

    render(tree(false));
    const editor = canvasElement.querySelector("ark-kv-editor") as ArkKvEditorElement;
    await expect(editor.valueField).toBeNull();
    await expect(valueCells(canvasElement)[0].localName).toBe("ark-input");

    render(tree(true));
    const [cell] = valueCells(canvasElement) as HTMLInputElement[];
    await expect(cell).toHaveAttribute("data-origem", "app");
    await expect(cell.value).toBe("{{baseUrl}}");
    cell.value = "{{baseUrl}}/v2";
    cell.dispatchEvent(new Event("input", { bubbles: true }));
    await expect(changes[changes.length - 1]?.[0].value).toBe("{{baseUrl}}/v2");

    render(tree(false));
    await expect(valueCells(canvasElement)[0].localName).toBe("ark-input");

    const radios = Array.from(canvasElement.querySelectorAll('ark-shape-picker [role="radio"]'));
    await expect(radios.map((radio) => radio.getAttribute("data-value"))).toEqual(["moon", "cross", "asterisk"]);
    await expect(errors).toEqual([]);
  }
};

export const VueKvValueFieldAndShapes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const field = ref<ArkKvValueField | undefined>(undefined);
    const shapes = ref<ArkMarkShape[] | "all">(["pentagon", "star"]);
    const changes: ArkKvRow[][] = [];
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(VueArkKvEditor, {
            rows: VALUE_ROWS,
            valueField: field.value,
            onChange: (event: CustomEvent<{ rows: ArkKvRow[] }>) => changes.push(event.detail.rows)
          }),
          h(VueArkShapePicker, { shapes: shapes.value })
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.config.errorHandler = (error) => problems.push(String(error));
    app.mount(mountPoint(canvasElement));

    const editor = canvasElement.querySelector("ark-kv-editor") as ArkKvEditorElement;
    await expect(editor.valueField).toBeNull();
    await expect(valueCells(canvasElement)[0].localName).toBe("ark-input");

    field.value = nativeValueField;
    await nextTick();
    const [cell] = valueCells(canvasElement) as HTMLInputElement[];
    await expect(cell).toHaveAttribute("data-origem", "app");
    cell.value = "{{baseUrl}}/v3";
    cell.dispatchEvent(new Event("input", { bubbles: true }));
    await expect(changes[changes.length - 1]?.[0].value).toBe("{{baseUrl}}/v3");

    const picker = canvasElement.querySelector("ark-shape-picker") as HTMLElement;
    const values = () =>
      Array.from(picker.querySelectorAll('[role="radio"]')).map((radio) => radio.getAttribute("data-value"));
    await expect(values()).toEqual(["pentagon", "star"]);
    shapes.value = "all";
    await nextTick();
    await expect(values()).toHaveLength(10);
    await expect(problems).toEqual([]);
  }
};
