import type { ArkIntent, ArkTheme } from "@tooark/core";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Core/ArkClock",
  parameters: {
    docs: {
      description: {
        component:
          'Superficie de selecao de hora com colunas digitais rolaveis (estilo DigitalClock do MUI). O valor e sempre 24h no formato HH:mm:ss; `hours-format="12"` muda apenas a exibicao, adicionando a coluna AM/PM. Emite `ark-change` com `detail: { value }`.'
      }
    }
  },
  argTypes: {
    value: { control: "text", description: "Hora em HH:mm ou HH:mm:ss (24h). Valor invalido e ignorado" },
    seconds: { control: "boolean", description: "Exibe a coluna de segundos" },
    stepMinutes: {
      control: { type: "number", min: 1, max: 30, step: 1 },
      description: "Intervalo da coluna de minutos (1 a 30; valores fora da faixa sao ajustados)"
    },
    hoursFormat: { control: "inline-radio", options: ["24", "12"], description: "12 adiciona a coluna AM/PM" },
    lang: {
      control: "select",
      options: ["en", "pt", "es"],
      description: "Rotulos das colunas (Horas/Minutos/Segundos)"
    },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    testid: { control: "text", description: "Propaga data-testid para o relogio e cada coluna (<testid>-hours etc.)" }
  },
  args: {
    value: "09:30",
    seconds: false,
    stepMinutes: 1,
    hoursFormat: "24",
    lang: "pt",
    intent: "primary",
    theme: "auto",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  value: string;
  seconds: boolean;
  stepMinutes: number;
  hoursFormat: "24" | "12";
  lang: string;
  intent: ArkIntent;
  theme: ArkTheme;
  testid: string;
};

export const Playground = {
  render: (args: StoryArgs) => {
    const el = document.createElement("ark-clock");
    if (args.value) el.setAttribute("value", args.value);
    if (args.seconds) el.setAttribute("seconds", "");
    if (args.stepMinutes && args.stepMinutes > 1) el.setAttribute("step-minutes", String(args.stepMinutes));
    if (args.testid) el.setAttribute("testid", args.testid);
    el.setAttribute("hours-format", args.hoursFormat);
    el.setAttribute("lang", args.lang);
    el.setAttribute("intent", args.intent);
    el.setAttribute("theme", args.theme);

    el.addEventListener("ark-change", (e) => {
      console.log("ark-change", (e as CustomEvent).detail);
    });

    return el;
  }
};

export const WithSeconds = {
  args: { seconds: true, value: "14:05:30" },
  render: Playground.render
};

export const TwelveHours = {
  args: { hoursFormat: "12", value: "15:45" },
  render: Playground.render
};

export const DarkTheme = {
  args: { theme: "dark", intent: "info" },
  render: Playground.render
};

export const SelectsTime = {
  args: { lang: "pt", value: "" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const clock = canvasElement.querySelector("ark-clock")!;
    const hour = canvasElement.querySelector<HTMLButtonElement>('[data-ark="clock-hours"] button[data-value="9"]')!;
    const minute = canvasElement.querySelector<HTMLButtonElement>(
      '[data-ark="clock-minutes"] button[data-value="30"]'
    )!;

    await userEvent.click(hour);
    await expect(clock).toHaveAttribute("value", "09:00:00");

    await userEvent.click(minute);
    await expect(clock).toHaveAttribute("value", "09:30:00");
    await expect(hour).toHaveAttribute("aria-selected", "true");
    await expect(minute).toHaveAttribute("aria-selected", "true");
  }
};

// lang="custom" com locale-json troca os rótulos das colunas, direto e através do ark-datepicker.
export const CustomLocale = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "24px";
    const clock = document.createElement("ark-clock");
    clock.setAttribute("lang", "custom");
    clock.setAttribute("locale-json", JSON.stringify({ hours: "Hrs", minutes: "Mins" }));
    const picker = document.createElement("ark-datepicker");
    picker.setAttribute("mode", "time");
    picker.setAttribute("lang", "custom");
    picker.setAttribute("locale-json", JSON.stringify({ hours: "Horas*" }));
    wrap.append(clock, picker);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [own, inner] = Array.from(canvasElement.querySelectorAll("ark-clock"));
    await expect(own.querySelector('[data-ark="clock-hours"]')).toHaveAttribute("aria-label", "Hrs");
    await expect(own.querySelector('[data-ark="clock-minutes"]')).toHaveAttribute("aria-label", "Mins");
    await expect(inner.querySelector('[data-ark="clock-hours"]')).toHaveAttribute("aria-label", "Horas*");
  }
};
