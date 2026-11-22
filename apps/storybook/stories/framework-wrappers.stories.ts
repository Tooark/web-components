import {
  type ArkDataViewColumn,
  type ArkDataViewQueryChangeDetail,
  type ArkDataViewRowClickDetail,
  type ArkDataViewSelectionChangeDetail,
  type ArkKvRow,
  type ArkKvValueField,
  type ArkMarkShape,
  type ArkPageChangeDetail,
  type ArkSchedulerEvent,
  resolveLocale,
  setArkLocale,
  toast
} from "@tooark/core";
import {
  ArkButton as ReactArkButton,
  ArkCalendar as ReactArkCalendar,
  ArkCard as ReactArkCard,
  ArkCheckbox as ReactArkCheckbox,
  ArkClock as ReactArkClock,
  ArkDataView as ReactArkDataView,
  ArkDatepicker as ReactArkDatepicker,
  ArkDialog as ReactArkDialog,
  ArkEmpty as ReactArkEmpty,
  ArkFileInput as ReactArkFileInput,
  ArkInput as ReactArkInput,
  ArkKvEditor as ReactArkKvEditor,
  ArkMenu as ReactArkMenu,
  ArkMenuGroup as ReactArkMenuGroup,
  ArkMenuItem as ReactArkMenuItem,
  ArkNav as ReactArkNav,
  ArkNavItem as ReactArkNavItem,
  ArkPagination as ReactArkPagination,
  ArkScheduler as ReactArkScheduler,
  ArkShapePicker as ReactArkShapePicker,
  ArkSwitch as ReactArkSwitch,
  ArkTextarea as ReactArkTextarea,
  ArkTime as ReactArkTime,
  ArkToaster as ReactArkToaster,
  ArkTree as ReactArkTree,
  ArkTreeItem as ReactArkTreeItem,
  setArkLocale as reactSetArkLocale
} from "@tooark/react";
import { ArkChart as ReactArkChart } from "@tooark/react/chart";
import { ArkCodeEditor as ReactArkCodeEditor } from "@tooark/react/code";
import { ArkWysiwygEditor as ReactArkWysiwygEditor } from "@tooark/react/wysiwyg";
import {
  type ArkDataViewVueColumn,
  ArkButton as VueArkButton,
  ArkCalendar as VueArkCalendar,
  ArkCard as VueArkCard,
  ArkCheckbox as VueArkCheckbox,
  ArkClock as VueArkClock,
  ArkDataView as VueArkDataView,
  ArkEmpty as VueArkEmpty,
  ArkKvEditor as VueArkKvEditor,
  ArkMenu as VueArkMenu,
  ArkMenuGroup as VueArkMenuGroup,
  ArkMenuItem as VueArkMenuItem,
  ArkNav as VueArkNav,
  ArkNavItem as VueArkNavItem,
  ArkPagination as VueArkPagination,
  ArkScheduler as VueArkScheduler,
  ArkShapePicker as VueArkShapePicker,
  ArkSwitch as VueArkSwitch,
  ArkTime as VueArkTime,
  ArkToaster as VueArkToaster,
  ArkTree as VueArkTree,
  ArkTreeItem as VueArkTreeItem,
  setArkLocale as vueSetArkLocale
} from "@tooark/vue";
import { ArkChart as VueArkChart } from "@tooark/vue/chart";
import { ArkCodeEditor as VueArkCodeEditor } from "@tooark/vue/code";
import { ArkWysiwygEditor as VueArkWysiwygEditor } from "@tooark/vue/wysiwyg";
import type {
  ArkButton as ArkButtonElement,
  ArkDataView as ArkDataViewElement,
  ArkDialog as ArkDialogElement,
  ArkKvEditor as ArkKvEditorElement,
  ArkSwitch as ArkSwitchElement
} from "@tooark/web-components";
import { createElement, createRef, type ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createApp, h, nextTick, ref } from "vue";

// Os wrappers com react-dom e vue de verdade. O preview já registrou os elementos, então cada ark-* nasce "upgraded"
// e os frameworks gravam as props como propriedade: o caminho que o React 19 e o Vue seguem num app real a partir do
// segundo render.
const meta = {
  title: "Integration/Framework Wrappers",
  // Só testes (não há o que ver): rodam na suíte, mas ficam fora da barra lateral e da página de docs.
  tags: ["!dev", "!autodocs"]
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

// O cenario do login do Arkcode: React 19, dois ArkInput e um ArkButton de submit; Enter na senha chega ao onSubmit.
export const ReactEnterSubmitsForm = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const submits: string[][] = [];
    const render = reactRoot(canvasElement, errors);
    render(
      createElement(
        "form",
        {
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget as HTMLFormElement);
            submits.push([data.get("user") as string, data.get("pass") as string]);
          }
        },
        createElement(ReactArkInput, {
          key: "user",
          label: "E-mail",
          name: "user",
          type: "email",
          value: "ana@tooark.com"
        }),
        createElement(ReactArkInput, { key: "pass", label: "Senha", name: "pass", type: "password", value: "segredo" }),
        createElement(ReactArkButton, { key: "submit", type: "submit" }, "Entrar")
      )
    );
    await expect(errors).toEqual([]);

    const pass = canvasElement.querySelectorAll<HTMLInputElement>('[data-ark="input"]')[1];
    pass.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(submits).toEqual([["ana@tooark.com", "segredo"]]));
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
      createElement(ReactArkCalendar, { key: "c", "data-secao": "agenda", "aria-describedby": "dica" }),
      createElement(ReactArkClock, { key: "k", lang: "custom", localeJson: '{"hours":"Horas do dia"}' })
    ]);
    await expect(errors).toEqual([]);

    const calendar = canvasElement.querySelector("ark-calendar") as HTMLElement;
    await expect(calendar).toHaveAttribute("data-secao", "agenda");
    await expect(calendar).toHaveAttribute("aria-describedby", "dica");
    await expect(canvasElement.querySelector("ark-textarea textarea")).toHaveAttribute("wrap", "off");
    await expect(canvasElement.querySelector('[data-ark="file-input-button"]')).toHaveAttribute("aria-invalid", "true");
    await expect(canvasElement.querySelector("ark-clock")).toHaveAttribute("locale-json", '{"hours":"Horas do dia"}');
    await expect(canvasElement.querySelector('ark-clock [aria-label="Horas do dia"]')).not.toBeNull();
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

// No Vue os wrappers têm inheritAttrs: false e espalham os attrs no elemento: id, class, style, aria-*, data-* e os
// listeners nativos (onClick) chegam ao ark-*, sem tipagem a mais. O localeJson do relógio é prop do wrapper.
export const VueFallthroughAttrs = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    let rowClicks = 0;
    let boxClicks = 0;
    const changes: boolean[] = [];
    const app = createApp({
      setup: () => () =>
        h("div", { onClick: () => rowClicks++ }, [
          h(VueArkCheckbox, {
            id: "linha-vue",
            class: "minha-classe",
            style: { marginLeft: "4px" },
            title: "Ativar a linha",
            "aria-label": "Ativar",
            "data-linha": "1",
            onClick: (event: MouseEvent) => {
              boxClicks++;
              event.stopPropagation();
            },
            onChange: (event: CustomEvent<{ checked: boolean }>) => changes.push(event.detail.checked)
          }),
          h(VueArkClock, { lang: "custom", localeJson: '{"hours":"Horas do dia"}' })
        ])
    });
    app.mount(mountPoint(canvasElement));

    const host = canvasElement.querySelector("ark-checkbox") as HTMLElement;
    await expect(host.id).toBe("linha-vue");
    await expect(host).toHaveClass("minha-classe");
    await expect(host.style.marginLeft).toBe("4px");
    await expect(host.title).toBe("Ativar a linha");
    await expect(host).toHaveAttribute("data-linha", "1");

    const box = host.querySelector('[data-ark="checkbox"]') as HTMLElement;
    await expect(box).toHaveAccessibleName("Ativar");
    box.click();
    await expect(boxClicks).toBe(1);
    await expect(rowClicks).toBe(0);
    await expect(changes).toEqual([true]);

    await expect(canvasElement.querySelector('ark-clock [aria-label="Horas do dia"]')).not.toBeNull();
    app.unmount();
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

type Person = { id: number; name: string; team: string };

const PEOPLE: Person[] = [
  { id: 1, name: "Ana Lima", team: "Plataforma" },
  { id: 2, name: "Bruno Reis", team: "Produto" },
  { id: 3, name: "Carla Dias", team: "Suporte" }
];

// `render` devolve um nó: o caminho para pôr um componente (aqui um ark-badge) numa célula a partir de um wrapper.
const PEOPLE_COLUMNS: ArkDataViewColumn<Person>[] = [
  { key: "name", label: "Nome", sortable: true },
  {
    key: "team",
    label: "Time",
    render: ({ row }) => {
      const badge = document.createElement("ark-badge");
      badge.textContent = row.team;
      return badge;
    }
  }
];

function shownKeys(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>("ark-data-view [data-ark-row]")).map(
    (row) => row.dataset.arkRow ?? ""
  );
}

// `rows`, `columns` e `selected` vão como propriedade (objetos e funções), o resto como atributo; os eventos chegam
// como CustomEvent com o registro do app; os filhos são os slots; o ArkPagination avulso segue o mesmo caminho.
export const ReactDataViewAndPagination = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const viewRef = createRef<ArkDataViewElement>();
    const queries: ArkDataViewQueryChangeDetail[] = [];
    const clicks: Array<ArkDataViewRowClickDetail<Person>> = [];
    const selections: Array<ArkDataViewSelectionChangeDetail<Person>> = [];
    const pages: ArkPageChangeDetail[] = [];
    const onQueryChange = (event: CustomEvent<ArkDataViewQueryChangeDetail>) => queries.push(event.detail);
    const onRowClick = (event: CustomEvent<ArkDataViewRowClickDetail<Person>>) => clicks.push(event.detail);
    const onSelectionChange = (event: CustomEvent<ArkDataViewSelectionChangeDetail<Person>>) =>
      selections.push(event.detail);
    const onPageChange = (event: CustomEvent<ArkPageChangeDetail>) => pages.push(event.detail);
    const tree = (rows: Person[], page: number, selected: number[]): ReactNode => [
      createElement(
        ReactArkDataView<Person>,
        {
          key: "dv",
          ref: viewRef,
          rows,
          columns: PEOPLE_COLUMNS,
          view: "table",
          pageSize: 2,
          page,
          sort: { key: "name", direction: "asc" },
          selectable: true,
          selected,
          clickable: true,
          label: "Pessoas",
          lang: "pt",
          onQueryChange,
          onRowClick,
          onSelectionChange
        },
        createElement("div", { slot: "selection" }, createElement(ReactArkButton, { intent: "danger" }, "Excluir"))
      ),
      createElement(ReactArkPagination, { key: "pg", page: 1, pageSize: 10, total: 35, lang: "pt", onPageChange })
    ];

    render(tree(PEOPLE, 1, []));
    await expect(errors).toEqual([]);
    const view = viewRef.current as ArkDataViewElement;
    await expect(view.tagName).toBe("ARK-DATA-VIEW");
    await expect(view).toHaveAttribute("page-size", "2");
    await expect(view).toHaveAttribute("sort", "name:asc");
    await expect(view.rows.every((row, index) => row === PEOPLE[index])).toBe(true);
    await expect(shownKeys(canvasElement)).toEqual(["1", "2"]);
    await expect(view.querySelector('[data-ark-row="1"] ark-badge')).toHaveTextContent("Plataforma");
    // O slot do app só aparece com seleção.
    const actions = view.querySelector('[slot="selection"]') as HTMLElement;
    await expect(actions).not.toBeVisible();

    // Eventos: o registro do detail é o objeto do app.
    (view.querySelector('[data-ark-row="2"] td:last-child') as HTMLElement).click();
    await expect(clicks).toHaveLength(1);
    await expect(clicks[0].row === PEOPLE[1]).toBe(true);
    (view.querySelector('[data-ark-row="1"] ark-checkbox') as HTMLElement & { toggle: () => void }).toggle();
    await expect(selections.at(-1)?.selected).toEqual([1]);
    await expect(actions).toBeVisible();
    (view.querySelector('button[data-ark-page="2"]') as HTMLElement).click();
    await expect(queries.at(-1)).toMatchObject({ page: 2, pageSize: 2, reason: "page" });
    await expect(shownKeys(canvasElement)).toEqual(["3"]);

    // Props controladas: página, seleção e registros novos chegam ao elemento sem recriar o nó.
    render(tree(PEOPLE.slice(0, 2), 1, [2]));
    await expect(errors).toEqual([]);
    await expect(viewRef.current === view).toBe(true);
    await expect(shownKeys(canvasElement)).toEqual(["1", "2"]);
    await expect(view.selected).toEqual([2]);
    await expect(view.querySelector('[data-ark-row="2"]')).toHaveAttribute("data-ark-selected");

    const pagination = canvasElement.querySelector("ark-data-view + ark-pagination") as HTMLElement;
    await expect(pagination).toHaveAttribute("total", "35");
    (pagination.querySelector('button[data-ark-page="3"]') as HTMLElement).click();
    await expect(pages).toEqual([{ page: 3, pageSize: 10, pageCount: 4 }]);
    await expect(errors).toEqual([]);
  }
};

export const VueDataViewAndPagination = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const rows = ref<Person[]>(PEOPLE);
    const selected = ref<number[]>([]);
    const queries: ArkDataViewQueryChangeDetail[] = [];
    const selections: Array<ArkDataViewSelectionChangeDetail<Person>> = [];
    const pages: ArkPageChangeDetail[] = [];
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(
            VueArkDataView,
            {
              rows: rows.value,
              columns: PEOPLE_COLUMNS,
              view: "table",
              pageSize: 2,
              sort: "name:desc",
              selectable: true,
              selected: selected.value,
              lang: "pt",
              "onArk-query-change": (event: CustomEvent<ArkDataViewQueryChangeDetail>) => queries.push(event.detail),
              "onArk-selection-change": (event: CustomEvent<ArkDataViewSelectionChangeDetail<Person>>) =>
                selections.push(event.detail)
            },
            () => h("div", { slot: "selection" }, "Ações")
          ),
          h(VueArkPagination, {
            page: 2,
            pageSize: 10,
            total: 35,
            pageSizes: [10, 20],
            lang: "pt",
            "onArk-page-change": (event: CustomEvent<ArkPageChangeDetail>) => pages.push(event.detail)
          })
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.config.errorHandler = (error) => problems.push(String(error));
    app.mount(mountPoint(canvasElement));

    const view = canvasElement.querySelector("ark-data-view") as ArkDataViewElement;
    await expect(view).toHaveAttribute("page-size", "2");
    await expect(view).toHaveAttribute("sort", "name:desc");
    await expect(shownKeys(canvasElement)).toEqual(["3", "2"]);
    await expect(view.querySelector('[data-ark-row="3"] ark-badge')).toHaveTextContent("Suporte");
    await expect(view.querySelector('[slot="selection"]')).toHaveTextContent("Ações");

    (view.querySelector('[data-ark-row="3"] ark-checkbox') as HTMLElement & { toggle: () => void }).toggle();
    await expect(selections.at(-1)?.selected).toEqual([3]);
    (view.querySelector('button[data-ark-page="2"]') as HTMLElement).click();
    await expect(queries.at(-1)).toMatchObject({ page: 2, reason: "page" });
    await expect(shownKeys(canvasElement)).toEqual(["1"]);

    // Props reativas: lista e seleção novas chegam como propriedade.
    rows.value = PEOPLE.slice(1);
    selected.value = [2];
    await nextTick();
    await expect(view.rows.map((row) => row.id)).toEqual([2, 3]);
    await expect(view.selected).toEqual([2]);

    const pagination = canvasElement.querySelector("ark-data-view + ark-pagination") as HTMLElement & { page: number };
    await expect(pagination.page).toBe(2);
    await expect(pagination).toHaveAttribute("page-sizes", "10,20");
    (pagination.querySelector('button[data-ark-page="next"]') as HTMLElement).click();
    await expect(pages).toEqual([{ page: 3, pageSize: 10, pageCount: 4 }]);
    await expect(problems).toEqual([]);
  }
};

// Conteúdo de célula em JSX: o `render` da coluna devolve elementos React (inclusive componentes com eventos), que o
// wrapper desenha por portal nos nós que o elemento cria. As colunas são declaradas inline (novas a cada render do
// app) e o JSX fecha sobre o estado do app: ele se atualiza sem o elemento refazer a tabela.
export const ReactDataViewJsxCells = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const clicks: string[] = [];
    const tree = (rows: Person[], highlight: number | null, cards: boolean): ReactNode =>
      createElement(ReactArkDataView<Person>, {
        rows,
        view: cards ? "cards" : "table",
        lang: "pt",
        columns: [
          {
            key: "name",
            label: "Nome",
            sortable: true,
            cardRole: "title",
            render: ({ row }) =>
              createElement(
                "strong",
                { className: "nome", "data-destaque": row.id === highlight ? "sim" : "nao" },
                row.name
              )
          },
          {
            key: "team",
            label: "Time",
            render: ({ row }) =>
              createElement(ReactArkButton, { size: "sm", onClick: () => clicks.push(row.name) }, row.team)
          },
          { key: "id", label: "#", render: ({ row }) => (row.id > 1 ? `#${row.id}` : null) }
        ],
        cardRender: cards
          ? ({ row, index }) => createElement("p", { className: "corpo" }, `${index}: ${row.team}`)
          : undefined
      });
    const view = () => canvasElement.querySelector("ark-data-view") as ArkDataViewElement;
    const cell = (key: string, column: number) =>
      view().querySelectorAll(`[data-ark-row="${key}"] [data-ark="data-view-cell"]`)[column] as HTMLElement;

    const root = render(tree(PEOPLE, null, false));
    // Os portais entram num microtask depois de o elemento desenhar, antes da pintura.
    await waitFor(() => expect(view().querySelectorAll("td .nome")).toHaveLength(3));
    await expect(errors).toEqual([]);
    await expect(cell("1", 0).querySelector(".nome")).toHaveTextContent("Ana Lima");
    await expect(cell("1", 0).querySelector(".nome")).toHaveAttribute("data-destaque", "nao");
    // Texto vira texto; null não desenha nada (a célula é do React).
    await expect(cell("2", 2)).toHaveTextContent("#2");
    await expect(cell("1", 2).textContent).toBe("");
    // Um componente React dentro da célula, com o evento dele.
    (cell("2", 1).querySelector("ark-button") as HTMLElement).click();
    await expect(clicks).toEqual(["Bruno Reis"]);

    // Outro render do app: colunas novas com os mesmos dados e outro estado. A linha é o mesmo nó (o elemento não
    // refez a tabela) e o JSX mostra o estado novo.
    const firstRow = view().querySelector('[data-ark-row="1"]');
    render(tree(PEOPLE, 1, false));
    await expect(view().querySelector('[data-ark-row="1"]') === firstRow).toBe(true);
    await expect(cell("1", 0).querySelector(".nome")).toHaveAttribute("data-destaque", "sim");

    // Ordenar refaz as células: os portais das antigas saem e os das novas entram.
    const sortButton = view().querySelector('[data-ark-sort-key="name"]') as HTMLElement;
    sortButton.click();
    (view().querySelector('[data-ark-sort-key="name"]') as HTMLElement).click();
    await waitFor(() => expect(view().querySelectorAll("td .nome")).toHaveLength(3));
    await expect(shownKeys(canvasElement)).toEqual(["3", "2", "1"]);
    await expect(cell("3", 0).querySelector(".nome")).toHaveTextContent("Carla Dias");
    await expect(document.querySelectorAll(".nome")).toHaveLength(3);

    // Cards: o título continua em JSX e o corpo vem de `cardRender`.
    render(tree(PEOPLE, null, true));
    await waitFor(() => expect(view().querySelectorAll("li .corpo")).toHaveLength(3));
    await expect(view().querySelector("dl")).toBeNull();
    await expect(view().querySelector('li[data-ark-row="3"] .nome')).toHaveTextContent("Carla Dias");
    await expect(view().querySelector('li[data-ark-row="3"] .corpo')).toHaveTextContent("2: Suporte");

    // Registros novos; desmontar leva os portais junto, sem erro.
    render(tree(PEOPLE.slice(0, 1), null, true));
    await waitFor(() => expect(view().querySelectorAll("li .corpo")).toHaveLength(1));
    await expect(errors).toEqual([]);
    root.unmount();
    await expect(canvasElement.querySelector(".corpo")).toBeNull();
    await expect(errors).toEqual([]);
  }
};

// Conteúdo de célula no Vue: o slot `cell-<key>` (o jeito do template), ou o `render` da coluna devolvendo VNodes;
// o wrapper teleporta para os nós que o elemento cria. O conteúdo é reativo: muda com o estado do app e com os
// campos do registro, sem o elemento refazer a tabela.
export const VueDataViewCellSlots = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const rows = ref<Person[]>(PEOPLE.map((person) => ({ ...person })));
    const highlight = ref<number | null>(null);
    const cards = ref(false);
    const clicks: string[] = [];
    const columns: ArkDataViewVueColumn<Person>[] = [
      { key: "name", label: "Nome", sortable: true, cardRole: "title" },
      { key: "team", label: "Time" },
      { key: "id", label: "#", render: ({ row }) => h("em", { class: "numero" }, `#${row.id}`) }
    ];
    const app = createApp({
      setup: () => () =>
        h(
          VueArkDataView,
          { rows: rows.value, columns, view: cards.value ? "cards" : "table", lang: "pt" },
          {
            "cell-name": ({ row }: { row: Person }) =>
              h("strong", { class: "nome", "data-destaque": row.id === highlight.value ? "sim" : "nao" }, row.name),
            "cell-team": ({ row }: { row: Person }) =>
              h(VueArkButton, { size: "sm", onClick: () => clicks.push(row.name) }, () => row.team),
            ...(cards.value
              ? {
                  card: ({ row, index }: { row: Person; index: number }) =>
                    h("p", { class: "corpo" }, `${index}: ${row.team}`)
                }
              : {}),
            default: () => h("div", { slot: "toolbar" }, "Ações")
          }
        )
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.config.errorHandler = (error) => problems.push(String(error));
    app.mount(mountPoint(canvasElement));
    const view = canvasElement.querySelector("ark-data-view") as ArkDataViewElement;
    const cell = (key: string, column: number) =>
      view.querySelectorAll(`[data-ark-row="${key}"] [data-ark="data-view-cell"]`)[column] as HTMLElement;

    await waitFor(() => expect(view.querySelectorAll("td .nome")).toHaveLength(3));
    await expect(cell("1", 0).querySelector(".nome")).toHaveTextContent("Ana Lima");
    await expect(cell("2", 2).querySelector(".numero")).toHaveTextContent("#2");
    await expect(view.querySelector('[slot="toolbar"]')).toHaveTextContent("Ações");
    (cell("2", 1).querySelector("ark-button") as HTMLElement).click();
    await expect(clicks).toEqual(["Bruno Reis"]);

    // Reativo ao estado do app e aos campos do registro, na mesma linha (o elemento não refez a tabela).
    const firstRow = view.querySelector('[data-ark-row="1"]');
    highlight.value = 1;
    rows.value[0].name = "Ana Maria";
    await nextTick();
    await expect(view.querySelector('[data-ark-row="1"]') === firstRow).toBe(true);
    await expect(cell("1", 0).querySelector(".nome")).toHaveAttribute("data-destaque", "sim");
    await expect(cell("1", 0).querySelector(".nome")).toHaveTextContent("Ana Maria");

    // Ordenar refaz as células: os Teleports das antigas saem e os das novas entram.
    (view.querySelector('[data-ark-sort-key="name"]') as HTMLElement).click();
    (view.querySelector('[data-ark-sort-key="name"]') as HTMLElement).click();
    await waitFor(() => expect(view.querySelectorAll("td .nome")).toHaveLength(3));
    await expect(shownKeys(canvasElement)).toEqual(["3", "2", "1"]);
    await expect(document.querySelectorAll(".nome")).toHaveLength(3);

    // Cards: o slot `card` desenha o corpo e o título segue do slot da célula.
    cards.value = true;
    await waitFor(() => expect(view.querySelectorAll("li .corpo")).toHaveLength(3));
    await expect(view.querySelector("dl")).toBeNull();
    await expect(view.querySelector('li[data-ark-row="3"] .nome')).toHaveTextContent("Carla Dias");
    await expect(view.querySelector('li[data-ark-row="3"] .corpo')).toHaveTextContent("2: Suporte");

    // Sem o slot `card` a grade de campos volta.
    cards.value = false;
    await waitFor(() => expect(view.querySelectorAll("td .nome")).toHaveLength(3));
    app.unmount();
    await expect(problems).toEqual([]);
  }
};

// A navegação com os wrappers: `collapsed`/`collapsible` chegam ao elemento, `value` marca o item atual e o
// `ark-navigate` do item chega ao handler do nav ainda cancelável (listener síncrono), que é como o app roteia.
export const ReactNavCollapsible = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const navigated: string[] = [];
    const tree = (value: string, collapsed: boolean): ReactNode =>
      createElement(
        ReactArkNav,
        {
          label: "Principal",
          value,
          collapsed,
          collapsible: true,
          onNavigate: (event: CustomEvent<{ value: string }>) => {
            event.preventDefault();
            navigated.push(event.detail.value);
          }
        },
        createElement(ReactArkNavItem, { key: "r", href: "/requests", label: "Requisições" }),
        createElement(ReactArkNavItem, { key: "e", href: "/environments", label: "Ambientes" })
      );

    render(tree("/requests", false));
    await expect(errors).toEqual([]);
    const nav = canvasElement.querySelector("ark-nav") as HTMLElement;
    const [requests, environments] = Array.from(canvasElement.querySelectorAll("ark-nav-item"));
    await expect(nav).toHaveAttribute("collapsible", "");
    await expect(nav).not.toHaveAttribute("collapsed");
    await expect(requests).toHaveAttribute("current");

    // Rede de segurança: o clique num link de verdade não pode navegar o iframe; registra se o item já cancelou.
    const prevented: boolean[] = [];
    canvasElement.addEventListener("click", (event) => {
      prevented.push(event.defaultPrevented);
      event.preventDefault();
    });
    environments.querySelector("a")?.click();
    await expect(navigated).toEqual(["/environments"]);
    await expect(prevented).toEqual([true]);

    render(tree("/environments", true));
    await expect(environments).toHaveAttribute("current");
    await expect(requests).not.toHaveAttribute("current");
    await expect(nav).toHaveAttribute("collapsed", "");
    await expect(environments).toHaveAttribute("data-ark-rail");
    await expect(errors).toEqual([]);
  }
};

export const VueNavCollapsible = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const navigated: string[] = [];
    const value = ref("/requests");
    const collapsed = ref(false);
    const app = createApp({
      setup: () => () =>
        h(
          VueArkNav,
          {
            label: "Principal",
            value: value.value,
            collapsed: collapsed.value,
            collapsible: "hidden",
            onArkNavigate: (event: CustomEvent<{ value: string }>) => {
              event.preventDefault();
              navigated.push(event.detail.value);
            }
          },
          () => [
            h(VueArkNavItem, { href: "/requests", label: "Requisições" }),
            h(VueArkNavItem, { href: "/environments", label: "Ambientes" })
          ]
        )
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    const nav = canvasElement.querySelector("ark-nav") as HTMLElement;
    const [requests, environments] = Array.from(canvasElement.querySelectorAll("ark-nav-item"));
    await expect(nav).toHaveAttribute("collapsible", "hidden");
    await expect(requests).toHaveAttribute("current");

    const prevented: boolean[] = [];
    canvasElement.addEventListener("click", (event) => {
      prevented.push(event.defaultPrevented);
      event.preventDefault();
    });
    environments.querySelector("a")?.click();
    await expect(navigated).toEqual(["/environments"]);
    await expect(prevented).toEqual([true]);

    value.value = "/environments";
    collapsed.value = true;
    await nextTick();
    await expect(environments).toHaveAttribute("current");
    await expect(nav).toHaveAttribute("collapsed", "");
    // Recolhida em `hidden`: só o cabeçalho e o botão ficam; os itens somem.
    await expect(nav).toHaveAttribute("data-ark-hidden");
    await expect(environments).not.toBeVisible();
    await expect(problems).toEqual([]);
  }
};

/** Confere no DOM o que os wrappers das props do 2º passo das lacunas do Arkcode gravam no elemento. */
async function expectNewAttributes(canvasElement: HTMLElement): Promise<void> {
  const card = canvasElement.querySelector("ark-card") as HTMLElement;
  await expect(card).toHaveAttribute("wrap-actions", "");
  await expect(card).toHaveAttribute("heading-level", "3");
  await expect((card.querySelector('[data-ark="card-heading"]') as HTMLElement).tagName).toBe("H3");
  const empty = canvasElement.querySelector("ark-empty") as HTMLElement;
  await expect((empty.querySelector('[data-ark="empty-heading"]') as HTMLElement).tagName).toBe("H4");
  const [route, file] = Array.from(canvasElement.querySelectorAll("ark-button")) as HTMLElement[];
  await expect(route.querySelector("a")).not.toHaveAttribute("download");
  await expect(file.querySelector("a")).toHaveAttribute("download", "dados.csv");
  const toggle = canvasElement.querySelector("ark-switch") as HTMLElement;
  await expect(toggle.textContent).toContain("Avisos por e-mail");
  await expect(toggle.querySelector('[role="switch"]')).toHaveAttribute("aria-labelledby", toggle.id);
}

export const ReactNewAttributes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const navigated: string[] = [];
    render(
      createElement(
        "div",
        null,
        createElement(ReactArkCard, { heading: "Relatório", headingLevel: 3, wrapActions: true }),
        createElement(ReactArkEmpty, { heading: "Nada aqui", headingLevel: 4 }),
        createElement(
          ReactArkButton,
          {
            href: "/projetos/42",
            onNavigate: (event: CustomEvent<{ href: string }>) => {
              event.preventDefault();
              navigated.push(event.detail.href);
            }
          },
          "Abrir"
        ),
        createElement(ReactArkButton, { href: "/dados.csv", download: "dados.csv" }, "Baixar"),
        createElement(ReactArkSwitch, null, "Avisos por e-mail")
      )
    );
    await expect(errors).toEqual([]);
    await expectNewAttributes(canvasElement);

    // Rede de segurança: nenhum clique pode navegar o iframe.
    canvasElement.addEventListener("click", (event) => event.preventDefault());
    canvasElement
      .querySelector("ark-button a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await expect(navigated).toEqual(["/projetos/42"]);
  }
};

export const VueNewAttributes = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const navigated: string[] = [];
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(VueArkCard, { heading: "Relatório", headingLevel: 3, wrapActions: true }),
          h(VueArkEmpty, { heading: "Nada aqui", headingLevel: 4 }),
          h(
            VueArkButton,
            {
              href: "/projetos/42",
              onArkNavigate: (event: CustomEvent<{ href: string }>) => {
                event.preventDefault();
                navigated.push(event.detail.href);
              }
            },
            () => "Abrir"
          ),
          h(VueArkButton, { href: "/dados.csv", download: "dados.csv" }, () => "Baixar"),
          h(VueArkSwitch, null, () => "Avisos por e-mail")
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    await nextTick();
    await expect(problems).toEqual([]);
    await expectNewAttributes(canvasElement);

    canvasElement.addEventListener("click", (event) => event.preventDefault());
    canvasElement
      .querySelector("ark-button a")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await expect(navigated).toEqual(["/projetos/42"]);
    app.unmount();
  }
};

/**
 * Confere o grupo do menu renderizado por um wrapper e o idioma padrão: a reexportação de `setArkLocale` é a do core e
 * o calendário sem `lang` (o wrapper Vue gravava `lang="en"`) segue a troca e volta ao inglês.
 */
async function expectMenuGroupAndLocale(canvasElement: HTMLElement, setLocale: typeof setArkLocale): Promise<void> {
  await expect(setLocale === setArkLocale).toBe(true);
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
  await expect(english).toContain(resolveLocale("en").months[8]);
  try {
    setLocale("pt");
    await expect(calendar.textContent).toContain(resolveLocale("pt").months[8]);
  } finally {
    setLocale(null);
  }
  await expect(calendar.textContent).toBe(english);
}

export const ReactMenuGroupAndLocale = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    render(
      createElement(
        "div",
        null,
        createElement(
          ReactArkMenu,
          { "aria-label": "Arquivo" },
          createElement(
            ReactArkMenuGroup,
            { label: "Exportar", testid: "export" },
            createElement(ReactArkMenuItem, { value: "pdf" }, "PDF")
          )
        ),
        createElement(ReactArkCalendar, { value: "2026-09-15" })
      )
    );
    await expect(errors).toEqual([]);
    await expectMenuGroupAndLocale(canvasElement, reactSetArkLocale);
  }
};

export const VueMenuGroupAndLocale = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(VueArkMenu, { "aria-label": "Arquivo" }, () =>
            h(VueArkMenuGroup, { label: "Exportar", testid: "export" }, () =>
              h(VueArkMenuItem, { value: "pdf" }, () => "PDF")
            )
          ),
          h(VueArkCalendar, { value: "2026-09-15" })
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    await nextTick();
    await expect(problems).toEqual([]);
    await expectMenuGroupAndLocale(canvasElement, vueSetArkLocale);
    app.unmount();
  }
};

/** O que os wrappers do ark-time gravam: Date e ms viram ISO, e o texto sai pelo Intl no idioma pedido. */
async function expectTimeWrappers(canvasElement: HTMLElement, instant: Date): Promise<void> {
  const [relative, absolute, fromMs] = Array.from(canvasElement.querySelectorAll("ark-time")) as HTMLElement[];
  await expect(relative).toHaveAttribute("datetime", instant.toISOString());
  await expect(relative.querySelector("time")?.textContent).toBe("há 2 horas");
  await expect(relative).toHaveAttribute("data-testid", "updated");
  await expect(absolute).toHaveAttribute("format", "date");
  await expect(absolute.querySelector("time")?.textContent).toBe(
    new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(instant)
  );
  await expect(fromMs).toHaveAttribute("datetime", instant.toISOString());
}

export const ReactTime = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    const instant = new Date(Date.now() - 2 * 3600000);
    render(
      createElement(
        "div",
        null,
        createElement(ReactArkTime, { datetime: instant, lang: "pt-BR", testid: "updated" }),
        createElement(ReactArkTime, { datetime: instant.toISOString(), format: "date", lang: "en" }),
        createElement(ReactArkTime, { datetime: instant.getTime() })
      )
    );
    await expect(errors).toEqual([]);
    await expectTimeWrappers(canvasElement, instant);
  }
};

export const VueTime = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const instant = new Date(Date.now() - 2 * 3600000);
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(VueArkTime, { datetime: instant, lang: "pt-BR", testid: "updated" }),
          h(VueArkTime, { datetime: instant.toISOString(), format: "date", lang: "en" }),
          h(VueArkTime, { datetime: instant.getTime() })
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    await nextTick();
    await expect(problems).toEqual([]);
    await expectTimeWrappers(canvasElement, instant);
    app.unmount();
  }
};

const SIDE_OPTION = {
  xAxis: { type: "category" as const, data: ["a", "b"] },
  yAxis: {},
  series: [{ type: "bar" as const, data: [1, 2] }]
};

/**
 * Digita no meio do texto de um editor controlado: o valor que o change devolve volta pelo wrapper e não pode mover o
 * cursor (o setValue do editor leva a seleção ao início quando o texto difere).
 */
async function typeInTheMiddle(content: HTMLElement): Promise<void> {
  await userEvent.click(content);
  await userEvent.keyboard("ab");
  await userEvent.keyboard("{ArrowLeft}X");
  // A tecla seguinte mostra onde o cursor ficou depois de o valor devolvido voltar pelo wrapper.
  await userEvent.keyboard("Y");
}

/** O que os wrappers das subpaths entregam: option pela propriedade, texto e JSON controlados sem pular o cursor. */
async function expectSideWrappers(canvasElement: HTMLElement, codeValue: () => string, docText: () => string) {
  const chart = canvasElement.querySelector("ark-chart") as HTMLElement & { option: unknown; resolvedPalette: string };
  await waitFor(() => expect(chart.option).toBeTruthy());
  await expect(chart).toHaveAttribute("palette", "tokens");
  await expect(chart.hasAttribute("option")).toBe(false);

  const code = canvasElement.querySelector("ark-code-editor") as HTMLElement;
  const codeContent = await waitFor(() => code.querySelector(".cm-content") as HTMLElement);
  await expect(code).toHaveAttribute("max-height", "12rem");
  await typeInTheMiddle(codeContent);
  await waitFor(() => expect(codeValue()).toBe("aXYb"));

  const editor = canvasElement.querySelector("ark-wysiwyg-editor") as HTMLElement;
  const prose = await waitFor(() => editor.querySelector(".ProseMirror") as HTMLElement);
  await typeInTheMiddle(prose);
  await waitFor(() => expect(docText()).toBe("aXYb"));
}

/** Texto do JSON do Tiptap. */
function textOf(doc: unknown): string {
  const node = doc as { text?: string; content?: unknown[] } | null;
  if (!node) return "";
  return (node.text ?? "") + (node.content ?? []).map(textOf).join("");
}

/** Estado da tela controlada do ReactSidePackages, lido pelo play. */
const sideState = { code: "", doc: null as unknown, clicks: 0, assigned: 0 };

/** Tela com os três wrappers das subpaths, controlados por estado do React. */
function SideScreen(): ReactNode {
  const [code, setCode] = useState("");
  const [doc, setDoc] = useState<unknown>({ type: "doc", content: [{ type: "paragraph" }] });
  sideState.code = code;
  sideState.doc = doc;
  return createElement(
    "div",
    null,
    createElement(ReactArkChart, {
      option: SIDE_OPTION,
      palette: "tokens",
      height: "160px",
      onChartClick: () => {
        sideState.clicks += 1;
      }
    }),
    createElement(ReactArkCodeEditor, {
      value: code,
      maxHeight: "12rem",
      lineNumbers: false,
      onChange: (event) => setCode(event.detail.value)
    }),
    createElement(ReactArkWysiwygEditor, {
      content: doc as never,
      toolbar: "none",
      "aria-label": "Notas",
      onChange: (event) => setDoc(event.detail)
    })
  );
}

export const ReactSidePackages = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const render = reactRoot(canvasElement, errors);
    Object.assign(sideState, { code: "", doc: null, clicks: 0, assigned: 0 });
    render(createElement(SideScreen));
    await expect(errors).toEqual([]);

    // A option só é reatribuída com referência nova: um render com a mesma não passa pelo setter.
    const chart = canvasElement.querySelector("ark-chart") as HTMLElement & { option: unknown };
    await waitFor(() => expect(chart.option === SIDE_OPTION).toBe(true));
    const proto = Object.getPrototypeOf(chart);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "option")!;
    Object.defineProperty(chart, "option", {
      configurable: true,
      get: () => descriptor.get!.call(chart),
      set: (value) => {
        sideState.assigned += 1;
        descriptor.set!.call(chart, value);
      }
    });
    render(createElement(SideScreen));
    await expect(sideState.assigned).toBe(0);
    delete (chart as { option?: unknown }).option;
    chart.dispatchEvent(new CustomEvent("ark-chart-click", { detail: {}, bubbles: true }));
    await expect(sideState.clicks).toBe(1);

    await expectSideWrappers(
      canvasElement,
      () => sideState.code,
      () => textOf(sideState.doc)
    );
  }
};

export const VueSidePackages = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const code = ref("");
    const doc = ref<unknown>({ type: "doc", content: [{ type: "paragraph" }] });
    let clicks = 0;
    const app = createApp({
      setup: () => () =>
        h("div", [
          h(VueArkChart, {
            option: SIDE_OPTION,
            palette: "tokens",
            height: "160px",
            onArkChartClick: () => {
              clicks += 1;
            }
          }),
          h(VueArkCodeEditor, {
            value: code.value,
            maxHeight: "12rem",
            lineNumbers: false,
            onChange: (event: CustomEvent<{ value: string }>) => {
              code.value = event.detail.value;
            }
          }),
          h(VueArkWysiwygEditor, {
            content: doc.value as never,
            toolbar: "none",
            "aria-label": "Notas",
            onArkWysiwygChange: (event: CustomEvent<unknown>) => {
              doc.value = event.detail;
            }
          })
        ])
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    await nextTick();
    await expect(problems).toEqual([]);

    const chart = canvasElement.querySelector("ark-chart") as HTMLElement;
    chart.dispatchEvent(new CustomEvent("ark-chart-click", { detail: {}, bubbles: true }));
    await expect(clicks).toBe(1);
    await expectSideWrappers(
      canvasElement,
      () => code.value,
      () => textOf(doc.value)
    );
    app.unmount();
  }
};

/**
 * O que os wrappers do ark-tree entregam: a estrutura (níveis pela linha, o filho dentro do pai) e os eventos
 * consolidados chegando ao handler, com a seleção em single pelo clique e a expansão pela seta.
 */
async function expectTreeWrappers(canvasElement: HTMLElement, log: string[]): Promise<void> {
  const tree = canvasElement.querySelector("ark-tree") as HTMLElement;
  const item = (value: string) =>
    canvasElement.querySelector(`ark-tree-item[value="${value}"]`) as HTMLElement & { rowElement: HTMLElement };
  await waitFor(() => expect(item("src").rowElement).toHaveAttribute("role", "treeitem"));
  await expect(tree).toHaveAttribute("role", "tree");
  await expect(item("src").rowElement).toHaveAttribute("aria-level", "1");
  await expect(item("src/index.ts").rowElement).toHaveAttribute("aria-level", "2");
  await expect(item("src/index.ts").parentElement?.closest("ark-tree-item")).toBe(item("src"));
  await expect(item("src").querySelector('[slot="trailing"]')?.textContent).toBe("2");
  // O subitem ocupa a largura do pai (de ponta a ponta na grid dele), mesmo atrás de um wrapper.
  await expect(Math.round(item("src/index.ts").getBoundingClientRect().width)).toBe(
    Math.round(item("src").getBoundingClientRect().width)
  );
  await userEvent.click(within(item("src/index.ts")).getByText("index.ts"));
  await expect(tree).toHaveAttribute("value", "src/index.ts");
  item("docs").rowElement.focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect(log).toEqual(['selection ["src/index.ts"]', "activate src/index.ts", "toggle docs true"]);
}

export const ReactTree = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const errors: unknown[] = [];
    const log: string[] = [];
    const render = reactRoot(canvasElement, errors);
    render(
      createElement(
        ReactArkTree,
        {
          label: "Arquivos",
          selection: "single",
          onToggle: (event) => log.push(`toggle ${event.detail.value} ${event.detail.expanded}`),
          onSelectionChange: (event) => log.push(`selection ${JSON.stringify(event.detail.values)}`),
          onActivate: (event) => log.push(`activate ${event.detail.value}`)
        },
        createElement(
          ReactArkTreeItem,
          { value: "src", label: "src", expanded: true },
          createElement("span", { slot: "trailing" }, "2"),
          createElement(ReactArkTreeItem, { value: "src/index.ts", label: "index.ts" }),
          createElement(ReactArkTreeItem, { value: "src/app.ts", label: "app.ts" })
        ),
        createElement(
          ReactArkTreeItem,
          { value: "docs", label: "docs" },
          createElement(ReactArkTreeItem, { value: "docs/guide.md", label: "guide.md" })
        )
      )
    );
    await expect(errors).toEqual([]);
    await expectTreeWrappers(canvasElement, log);
  }
};

export const VueTree = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: Ctx) => {
    const problems: string[] = [];
    const log: string[] = [];
    const app = createApp({
      setup: () => () =>
        h(
          VueArkTree,
          {
            label: "Arquivos",
            selection: "single",
            onArkToggle: (event: CustomEvent<{ value: string; expanded: boolean }>) =>
              log.push(`toggle ${event.detail.value} ${event.detail.expanded}`),
            onArkSelectionChange: (event: CustomEvent<{ values: string[] }>) =>
              log.push(`selection ${JSON.stringify(event.detail.values)}`),
            onArkActivate: (event: CustomEvent<{ value: string }>) => log.push(`activate ${event.detail.value}`)
          },
          () => [
            h(VueArkTreeItem, { value: "src", label: "src", expanded: true }, () => [
              h("span", { slot: "trailing" }, "2"),
              h(VueArkTreeItem, { value: "src/index.ts", label: "index.ts" }),
              h(VueArkTreeItem, { value: "src/app.ts", label: "app.ts" })
            ]),
            h(VueArkTreeItem, { value: "docs", label: "docs" }, () => [
              h(VueArkTreeItem, { value: "docs/guide.md", label: "guide.md" })
            ])
          ]
        )
    });
    app.config.warnHandler = (message) => problems.push(message);
    app.mount(mountPoint(canvasElement));
    await nextTick();
    await expect(problems).toEqual([]);
    await expectTreeWrappers(canvasElement, log);
    app.unmount();
  }
};
