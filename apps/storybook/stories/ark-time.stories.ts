import type { ArkTimeFormat } from "@tooark/core";
import type { ArkTime } from "@tooark/web-components";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkTime",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Data e hora pelo `Intl`, sem dependência: `format="relative"` (padrão, "há 3 minutos", "ontem"), `date`, `time` ou `datetime`. `datetime` aceita ISO com fuso (`2026-09-15T13:00:00Z`), hora local sem fuso (`2026-09-15T10:00`) ou só a data (`2026-09-15`, contada em dias de calendário); a propriedade também aceita um `Date` ou ms. O conteúdo é um `<time datetime>` próprio, com a data completa no `title`. O relativo se atualiza sozinho na próxima vez em que o texto muda e para fora do documento ou com a aba oculta. O idioma é o `lang` (qualquer tag, como `pt-BR`), senão o de `setArkLocale()`, senão `en`.'
      }
    }
  },
  argTypes: {
    offsetMinutes: { control: { type: "number" }, description: "Minutos em relação a agora (negativo é passado)." },
    format: { control: "inline-radio", options: ["relative", "date", "time", "datetime"] },
    lang: { control: "select", options: ["en", "pt-BR", "es", "fr", "ja"] }
  },
  args: { offsetMinutes: -180, format: "relative", lang: "pt-BR" }
};

export default meta;

type StoryArgs = { offsetMinutes: number; format: ArkTimeFormat; lang: string };

function createTime(datetime: string, attrs: Record<string, string> = {}): ArkTime {
  const el = document.createElement("ark-time");
  el.setAttribute("datetime", datetime);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  return el;
}

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function localDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const text = (el: Element): string => el.querySelector("time")?.textContent ?? "";

export const Playground = {
  render: (args: StoryArgs) => {
    const el = createTime(new Date(Date.now() + args.offsetMinutes * 60000).toISOString(), {
      format: args.format,
      lang: args.lang
    });
    const wrap = document.createElement("p");
    wrap.className = "text-sm";
    wrap.append("Atualizado ", el);
    return wrap;
  }
};

export const Formats = {
  parameters: {
    docs: {
      description: {
        story: "Os quatro formatos em três idiomas. Passe o mouse para ver a data completa no `title`."
      }
    }
  },
  render: () => {
    const table = document.createElement("table");
    table.className = "text-sm border-separate border-spacing-x-4 border-spacing-y-1";
    const instant = ago(3 * 3600000);
    const head = document.createElement("tr");
    for (const label of ["", "relative", "date", "time", "datetime"]) {
      const th = document.createElement("th");
      th.className = "text-left font-medium";
      th.textContent = label;
      head.appendChild(th);
    }
    table.appendChild(head);
    for (const lang of ["en", "pt-BR", "es"]) {
      const row = document.createElement("tr");
      const label = document.createElement("td");
      label.textContent = lang;
      row.appendChild(label);
      for (const format of ["relative", "date", "time", "datetime"]) {
        const cell = document.createElement("td");
        cell.appendChild(createTime(instant, { format, lang }));
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    return table;
  }
};

export const Rules = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-1 text-sm";
    wrap.append(
      createTime(ago(2 * 3600000), { lang: "en", "data-case": "past" }),
      createTime(new Date(Date.now() + 2 * 3600000 + 30000).toISOString(), { lang: "en", "data-case": "future" }),
      createTime(ago(2 * 3600000), { lang: "pt-BR", "data-case": "pt" }),
      createTime(localDate(-1), { lang: "en", "data-case": "yesterday" }),
      createTime(localDate(0), { lang: "pt-BR", "data-case": "today" }),
      createTime("2026-09-15T13:00:00Z", { lang: "en", format: "date", "data-case": "absolute" }),
      createTime("2026-09-15", { lang: "en", format: "datetime", "data-case": "date-only" }),
      createTime("ontem à tarde", { lang: "en", "data-case": "invalid" }),
      createTime(ago(60000), { lang: "xx-invalid-tag-!", "data-case": "bad-lang" })
    );
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const byCase = (name: string): ArkTime => canvasElement.querySelector(`[data-case="${name}"]`) as ArkTime;

    await expect(text(byCase("past"))).toBe("2 hours ago");
    await expect(text(byCase("future"))).toBe("in 2 hours");
    // A tag inteira vai para o Intl.
    await expect(text(byCase("pt"))).toBe("há 2 horas");
    // Só a data conta dias de calendário.
    await expect(text(byCase("yesterday"))).toBe("yesterday");
    await expect(text(byCase("today"))).toBe("hoje");
    await expect(text(byCase("absolute"))).toBe(
      new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date("2026-09-15T13:00:00Z"))
    );
    // Só a data mostra só a data, mesmo em `datetime`, e fica no fuso local.
    await expect(text(byCase("date-only"))).toBe("Sep 15, 2026");
    await expect(byCase("date-only").querySelector("time")).toHaveAttribute("datetime", "2026-09-15");
    await expect(text(byCase("invalid"))).toBe("");
    await expect(byCase("invalid").querySelector("time")).not.toHaveAttribute("datetime");
    await expect(text(byCase("bad-lang"))).toBe("1 minute ago");

    // O <time> leva o instante em ISO e a data completa no title; um title do host vence.
    const past = byCase("past");
    const time = past.querySelector("time")!;
    await expect(time).toHaveAttribute("datetime", past.date!.toISOString());
    await expect(time.getAttribute("title")).toBe(
      new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(past.date!)
    );
    past.setAttribute("title", "Último acesso");
    past.setAttribute("format", "relative");
    past.format = "time";
    await expect(time).not.toHaveAttribute("title");
    await expect(text(past)).toBe(new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(past.date!));

    // A propriedade aceita Date e ms e grava o ISO; um formato desconhecido volta ao relativo.
    const instant = new Date(Date.now() - 5 * 60000);
    past.datetime = instant;
    await expect(past).toHaveAttribute("datetime", instant.toISOString());
    past.setAttribute("format", "calendar");
    await expect(past.format).toBe("relative");
    await expect(text(past)).toBe("5 minutes ago");
    past.datetime = instant.getTime() - 60000;
    await expect(text(past)).toBe("6 minutes ago");
    past.datetime = null;
    await expect(past.hasAttribute("datetime")).toBe(false);
    await expect(past.date).toBeNull();
    await expect(text(past)).toBe("");
  }
};

export const RelativeUpdates = {
  render: () => createTime(ago(3600000), { lang: "en" }),
  // O relativo muda sozinho na fronteira seguinte (58 s -> 1 min); fora do documento e com a aba oculta não agenda,
  // e a volta atualiza na hora. O instante é gravado no play, e não no render: o tempo entre os dois não conta.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-time") as ArkTime;
    el.datetime = ago(58000);
    await expect(text(el)).toMatch(/^5[89] seconds ago$/);
    await waitFor(() => expect(text(el)).toBe("1 minute ago"), { timeout: 4000 });

    // Aba oculta: o timer para, e a volta à aba atualiza.
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "hidden")!;
    let hidden = true;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    try {
      el.datetime = ago(58000);
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await expect(text(el)).toMatch(/^5[89] seconds ago$/);
      hidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
      await expect(text(el)).toBe("1 minute ago");
    } finally {
      delete (document as { hidden?: boolean }).hidden;
      expect(Object.getOwnPropertyDescriptor(Document.prototype, "hidden")).toEqual(descriptor);
    }

    // Fora do documento não atualiza; ao voltar, atualiza na hora.
    el.datetime = ago(58000);
    const parent = el.parentElement!;
    el.remove();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await expect(text(el)).toMatch(/^5[89] seconds ago$/);
    parent.appendChild(el);
    await expect(text(el)).toBe("1 minute ago");
  }
};

export const TestHooks = {
  render: () => createTime("2026-09-15T13:00:00Z", { testid: "updated-at", lang: "en" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-time")!;
    await expect(el).toHaveAttribute("data-ark", "time");
    await expect(el).toHaveAttribute("data-testid", "updated-at");
    const time = el.querySelector("time")!;
    await expect(time).toHaveAttribute("data-ark", "time-value");
    await expect(time).toHaveAttribute("data-testid", "updated-at-value");
  }
};
