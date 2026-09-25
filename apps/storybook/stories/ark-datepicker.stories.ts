import type { ArkDatepickerLang, ArkDatepickerStyleOptions } from "@tooark/core";
import { expect, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkDatepicker",
  parameters: {
    docs: {
      description: {
        component:
          "Seletor de data/hora que compoe ark-input + ark-calendar + ark-clock. O `mode` define o formato do valor: `datetime` (padrao, YYYY-MM-DDTHH:mm:ss), `date` (YYYY-MM-DD) ou `time` (HH:mm:ss). Sem `input` os paineis sao renderizados inline; com `input`, vira campo + popup com digitacao validada (`format`), fechamento por Esc/clique fora e envio em formulario via input hidden (`name`). Emite `ark-change` com `detail: { value, date }`."
      }
    }
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["datetime", "date", "time"],
      description: "datetime = calendario + relogio, date = so calendario, time = so relogio"
    },
    input: {
      control: "boolean",
      description: "Renderiza campo de texto + popup no lugar dos paineis inline"
    },
    value: {
      control: "text",
      description: "Valor ISO conforme o mode: YYYY-MM-DDTHH:mm:ss, YYYY-MM-DD ou HH:mm:ss"
    },
    placeholder: {
      control: "text",
      description: "So no modo input; vazio usa o proprio format em minusculas"
    },
    name: {
      control: "text",
      description: "So no modo input; nome do campo hidden enviado no formulario com o valor ISO"
    },
    format: {
      control: "text",
      description:
        "Mascara de exibicao e digitacao com tokens YYYY MM DD HH mm ss (sensivel a maiusculas). Vazio = MM/DD/YYYY HH:mm em en e DD/MM/YYYY HH:mm nos demais"
    },
    seconds: {
      control: "boolean",
      description: "Adiciona a coluna de segundos e o token ss ao format padrao"
    },
    stepMinutes: {
      control: { type: "number", min: 1, max: 30, step: 1 },
      description: "Intervalo da coluna de minutos do relogio (1 a 30)"
    },
    hoursFormat: {
      control: "inline-radio",
      options: ["24", "12"],
      description: "12 adiciona a coluna AM/PM; o valor emitido continua em 24h"
    },
    disabled: { control: "boolean", description: "Bloqueia o campo e a abertura do popup" },
    lang: {
      control: "select",
      options: ["en", "pt", "es", "custom"],
      description: "Built-in locale or 'custom' to use locale-json"
    },
    localeJson: {
      control: "text",
      description: "JSON string with partial locale overrides (used when lang='custom')"
    },
    theme: {
      control: "select",
      options: ["auto", "light", "dark"]
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    accentColor: {
      control: "color",
      description: "Custom accent color for selected/today states"
    },
    min: { control: "text", description: "Minimum selectable date (YYYY-MM-DD)" },
    max: { control: "text", description: "Maximum selectable date (YYYY-MM-DD)" },
    events: {
      control: "text",
      description: "JSON repassado ao calendario interno: [{ date, label?, color?, intent? }]"
    },
    eventDisplay: {
      control: "inline-radio",
      options: ["dots", "count", "list"],
      description: "Como os eventos aparecem no calendario interno"
    },
    testid: {
      control: "text",
      description: "Propaga data-testid: <testid> no campo, <testid>-calendar e <testid>-clock nos paineis"
    }
  },
  args: {
    mode: "datetime",
    input: false,
    value: "",
    placeholder: "",
    name: "",
    format: "",
    seconds: false,
    stepMinutes: 1,
    hoursFormat: "24",
    disabled: false,
    lang: "en",
    localeJson: "",
    theme: "auto",
    intent: "primary",
    accentColor: "",
    min: "",
    max: "",
    events: "",
    eventDisplay: "dots",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  mode: "datetime" | "date" | "time";
  input: boolean;
  value: string;
  placeholder: string;
  name: string;
  format: string;
  seconds: boolean;
  stepMinutes: number;
  hoursFormat: "24" | "12";
  disabled: boolean;
  lang: ArkDatepickerLang;
  localeJson: string;
  theme: NonNullable<ArkDatepickerStyleOptions["theme"]>;
  intent: NonNullable<ArkDatepickerStyleOptions["intent"]>;
  accentColor: string;
  min: string;
  max: string;
  events: string;
  eventDisplay: "dots" | "count" | "list";
  testid: string;
};

function createDatepicker(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-datepicker");
  el.setAttribute("mode", args.mode || "datetime");
  el.setAttribute("lang", args.lang || "en");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("hours-format", args.hoursFormat || "24");

  if (args.input) el.setAttribute("input", "");
  if (args.seconds) el.setAttribute("seconds", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.value) el.setAttribute("value", args.value);
  if (args.placeholder) el.setAttribute("placeholder", args.placeholder);
  if (args.name) el.setAttribute("name", args.name);
  if (args.format) el.setAttribute("format", args.format);
  if (args.stepMinutes && args.stepMinutes > 1) el.setAttribute("step-minutes", String(args.stepMinutes));
  if (args.min) el.setAttribute("min", args.min);
  if (args.max) el.setAttribute("max", args.max);
  if (args.accentColor) el.setAttribute("accent-color", args.accentColor);
  if (args.lang === "custom" && args.localeJson) el.setAttribute("locale-json", args.localeJson);
  if (args.events) el.setAttribute("events", args.events);
  if (args.events && args.eventDisplay) el.setAttribute("event-display", args.eventDisplay);
  if (args.testid) el.setAttribute("testid", args.testid);

  el.addEventListener("ark-change", (e) => {
    console.log("ark-change", (e as CustomEvent).detail);
  });

  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createDatepicker(args)
};

export const English = {
  args: { lang: "en", mode: "date" },
  render: Playground.render
};

export const Portuguese = {
  args: { lang: "pt", mode: "date" },
  render: Playground.render
};

export const Spanish = {
  args: { lang: "es", mode: "date" },
  render: Playground.render
};

export const CustomLocale = {
  args: {
    lang: "custom",
    mode: "date",
    localeJson: JSON.stringify({
      months: [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "İyun",
        "İyul",
        "Avqust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr"
      ],
      weekdaysMin: ["B", "BE", "ÇA", "Ç", "CA", "C", "Ş"],
      today: "Bu gün",
      clear: "Təmizlə"
    })
  },
  render: Playground.render
};

export const WithMinMax = {
  args: {
    lang: "pt",
    mode: "date",
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().slice(0, 10),
    max: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().slice(0, 10)
  },
  render: Playground.render
};

export const PreselectedDate = {
  args: {
    lang: "en",
    mode: "date",
    value: new Date().toISOString().slice(0, 10)
  },
  render: Playground.render
};

export const SemanticIntents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gridTemplateColumns = "repeat(auto-fit, minmax(240px, 1fr))";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      const box = document.createElement("div");
      box.style.display = "flex";
      box.style.flexDirection = "column";
      box.style.gap = "8px";

      const label = document.createElement("strong");
      label.textContent = intent;

      const picker = createDatepicker({ lang: "en", mode: "date", intent: intent as StoryArgs["intent"] });

      box.appendChild(label);
      box.appendChild(picker);
      wrap.appendChild(box);
    });

    return wrap;
  }
};

export const InputMode = {
  args: { input: true, mode: "date", lang: "pt", name: "data" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const picker = canvasElement.querySelector("ark-datepicker")!;
    const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-ark="datepicker-toggle"]')!;
    const popup = canvasElement.querySelector<HTMLElement>('[data-ark="datepicker-popup"]')!;

    await userEvent.click(toggle);
    // O popup e um popover manual proprio: top layer, ancorado abaixo do campo por positionAnchored.
    await expect(popup).toHaveAttribute("popover", "manual");
    expect(popup.matches(":popover-open")).toBe(true);
    await expect(popup).toHaveAttribute("data-ark-side", "bottom");
    const field = canvasElement.querySelector<HTMLElement>("ark-input")!.getBoundingClientRect();
    expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(field.bottom);
    // Alinhado ao inicio do campo (positionAnchored ainda respeita a margem minima da viewport).
    expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(field.left);

    const day = popup.querySelector<HTMLButtonElement>('[data-ark="calendar-day"][data-date$="-15"]')!;
    const iso = day.getAttribute("data-date")!;
    await userEvent.click(day);

    await expect(picker).toHaveAttribute("value", iso);

    // Campo exibe o formato localizado (pt → DD/MM/YYYY) e o popup fecha.
    const input = canvasElement.querySelector<HTMLInputElement>('[data-ark="input"]')!;
    const [y, m, d] = iso.split("-");
    await expect(input.value).toBe(`${d}/${m}/${y}`);
    // A saida anima antes de sair do top layer.
    await waitFor(() => expect(popup.matches(":popover-open")).toBe(false));
    expect(getComputedStyle(popup).display).toBe("none");
  }
};

export const InsideOverflowHidden = {
  args: { input: true, mode: "date", lang: "pt" },
  parameters: {
    docs: {
      description: {
        story:
          "O popup vive no top layer (popover manual): um container com `overflow: hidden` e altura curta nao o corta, e nao ha z-index para disputar. Sem espaco abaixo ele vira para cima (`data-ark-side`)."
      }
    }
  },
  render: (args: StoryArgs) => {
    const box = document.createElement("div");
    box.className = "h-16 w-80 overflow-hidden rounded-lg border border-dashed border-slate-300 p-3";
    box.appendChild(createDatepicker(args));
    return box;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const box = canvasElement.querySelector<HTMLElement>("div.overflow-hidden")!;
    const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-ark="datepicker-toggle"]')!;
    const popup = canvasElement.querySelector<HTMLElement>('[data-ark="datepicker-popup"]')!;

    await userEvent.click(toggle);
    expect(popup.matches(":popover-open")).toBe(true);
    const rect = popup.getBoundingClientRect();
    expect(rect.bottom).toBeGreaterThan(box.getBoundingClientRect().bottom);
    // Visivel de verdade: o ponto central do popup e dele mesmo, nao do container que o cortaria.
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(popup.contains(hit)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(popup.matches(":popover-open")).toBe(false));
  }
};

export const InputModeTyping = {
  args: { input: true, mode: "date", lang: "pt", name: "data" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const picker = canvasElement.querySelector("ark-datepicker")!;
    const input = canvasElement.querySelector<HTMLInputElement>('[data-ark="input"]')!;

    await userEvent.type(input, "05/09/2026");
    await userEvent.keyboard("{Enter}");

    await expect(picker).toHaveAttribute("value", "2026-09-05");
  }
};

export const CustomFormat = {
  args: { input: true, mode: "date", lang: "pt", format: "DD.MM.YYYY", placeholder: "dd.mm.aaaa" },
  render: Playground.render
};

export const DateTimeInline = {
  args: { lang: "pt", mode: "datetime" },
  render: Playground.render
};

export const InputDateTime = {
  args: { input: true, lang: "pt", mode: "datetime", name: "agendamento" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const picker = canvasElement.querySelector("ark-datepicker")!;
    const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-ark="datepicker-toggle"]')!;

    await userEvent.click(toggle);
    const popup = canvasElement.querySelector<HTMLElement>('[data-ark="datepicker-popup"]')!;
    expect(popup.matches(":popover-open")).toBe(true);

    // Seleciona a data: no modo datetime o popup continua aberto para a hora.
    const day = popup.querySelector<HTMLButtonElement>('[data-ark="calendar-day"][data-date$="-15"]')!;
    const iso = day.getAttribute("data-date")!;
    await userEvent.click(day);
    await expect(picker).toHaveAttribute("value", `${iso}T00:00:00`);
    expect(popup.matches(":popover-open")).toBe(true);

    // Seleciona a hora.
    const hour = popup.querySelector<HTMLButtonElement>('[data-ark="clock-hours"] button[data-value="9"]')!;
    await userEvent.click(hour);
    await expect(picker).toHaveAttribute("value", `${iso}T09:00:00`);

    // Campo mostra data e hora formatadas (pt → DD/MM/YYYY HH:mm).
    const input = canvasElement.querySelector<HTMLInputElement>('[data-ark="input"]')!;
    const [y, m, d] = iso.split("-");
    await expect(input.value).toBe(`${d}/${m}/${y} 09:00`);
  }
};

export const TimeOnly = {
  args: { input: true, mode: "time", lang: "pt" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const picker = canvasElement.querySelector("ark-datepicker")!;
    const toggle = canvasElement.querySelector<HTMLButtonElement>('[data-ark="datepicker-toggle"]')!;

    await userEvent.click(toggle);
    const popup = canvasElement.querySelector<HTMLElement>('[data-ark="datepicker-popup"]')!;
    const hour = popup.querySelector<HTMLButtonElement>('[data-ark="clock-hours"] button[data-value="14"]')!;
    const minute = popup.querySelector<HTMLButtonElement>('[data-ark="clock-minutes"] button[data-value="30"]')!;

    await userEvent.click(hour);
    await userEvent.click(minute);
    await expect(picker).toHaveAttribute("value", "14:30:00");

    const input = canvasElement.querySelector<HTMLInputElement>('[data-ark="input"]')!;
    await expect(input.value).toBe("14:30");
  }
};

export const TimeWithSeconds = {
  args: { input: true, mode: "time", lang: "pt", seconds: true, stepMinutes: 5 },
  render: Playground.render
};

export const TwelveHours = {
  args: { input: true, mode: "datetime", lang: "en", hoursFormat: "12" },
  render: Playground.render
};

export const WithCalendarEvents = {
  args: {
    lang: "pt",
    mode: "date",
    eventDisplay: "dots",
    events: JSON.stringify([
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().slice(0, 10),
        label: "Reunião",
        intent: "info"
      },
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString().slice(0, 10),
        label: "Entrega",
        intent: "danger"
      }
    ])
  },
  render: Playground.render
};

export const Disabled = {
  args: { input: true, mode: "date", lang: "pt", value: new Date().toISOString().slice(0, 10), disabled: true },
  render: Playground.render
};

export const InputModeDark = {
  args: { input: true, theme: "dark", lang: "pt", mode: "datetime" },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.minHeight = "420px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    wrap.appendChild(createDatepicker({ ...args, theme: "dark" }));
    return wrap;
  }
};

export const DarkTheme = {
  args: {
    mode: "date",
    theme: "dark",
    intent: "info"
  },
  render: Playground.render
};

export const CustomAccent = {
  args: {
    lang: "en",
    mode: "date",
    accentColor: "#7c3aed"
  },
  render: Playground.render
};

// Inline também participa do formulário (`name`) e `disabled` tira calendário e relógio de interação.
export const InlineFormAndDisabled = {
  render: () => {
    const form = document.createElement("form");
    form.appendChild(createDatepicker({ mode: "date", lang: "pt", value: "2026-09-15", name: "entrega" }));
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    const picker = canvasElement.querySelector("ark-datepicker") as HTMLElement;
    await expect(new FormData(form).get("entrega")).toBe("2026-09-15");

    await userEvent.click(canvasElement.querySelector('[data-ark="calendar-day"][data-date="2026-09-20"]')!);
    await expect(new FormData(form).get("entrega")).toBe("2026-09-20");

    picker.setAttribute("disabled", "");
    const day = canvasElement.querySelector('[data-ark="calendar-day"][data-date="2026-09-22"]') as HTMLElement;
    // inert: fora do alcance do ponteiro e do foco (um click() sintético ainda dispararia, então testa o foco).
    await expect(day.closest("[inert]")).not.toBeNull();
    day.focus();
    await expect(document.activeElement).not.toBe(day);
    // Como qualquer controle desabilitado, o valor não vai no submit.
    await expect(new FormData(form).has("entrega")).toBe(false);

    picker.removeAttribute("disabled");
    await expect(day.closest("[inert]")).toBeNull();
  }
};
