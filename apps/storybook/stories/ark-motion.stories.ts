import type { ArkDuration, ArkEasing, ArkMotionPreset } from "@tooark/core";
import { ARK_DURATION_MS, ARK_EASING_CSS, arkEnter, arkExit } from "@tooark/core";
import { expect } from "storybook/test";

const meta = {
  title: "Core/ArkMotion",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Motion tokens (--ark-duration-*, --ark-ease-*) e presets de animacao do @tooark/core: classes CSS (.ark-animate-*) e helpers WAAPI (arkEnter/arkExit). Respeita prefers-reduced-motion automaticamente; o skeleton e estatico por padrao (.ark-skeleton-animated pulsa) e o spinner continua girando sob movimento reduzido."
      }
    }
  }
};

export default meta;

const ENTER_CLASSES = [
  "ark-animate-fade-in",
  "ark-animate-slide-in-up",
  "ark-animate-slide-in-down",
  "ark-animate-slide-in-left",
  "ark-animate-slide-in-right",
  "ark-animate-scale-in"
];

const EXIT_CLASSES = [
  "ark-animate-fade-out",
  "ark-animate-slide-out-up",
  "ark-animate-slide-out-down",
  "ark-animate-slide-out-left",
  "ark-animate-slide-out-right",
  "ark-animate-scale-out"
];

const WAAPI_PRESETS: ArkMotionPreset[] = ["fade", "slide-up", "slide-down", "slide-left", "slide-right", "scale"];

function createSection(title: string): { section: HTMLElement; grid: HTMLElement } {
  const section = document.createElement("section");
  section.className = "mb-8";

  const heading = document.createElement("h3");
  heading.className = "mb-3 text-sm font-semibold text-slate-700";
  heading.textContent = title;
  section.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-2 gap-3 sm:grid-cols-3";
  section.appendChild(grid);

  return { section, grid };
}

function createTile(label: string): HTMLElement {
  const tile = document.createElement("div");
  tile.className =
    "flex h-24 cursor-pointer select-none items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-center text-xs font-medium text-slate-600 shadow-sm";
  tile.textContent = label;
  tile.title = "Clique para reexecutar";
  return tile;
}

function replayClass(tile: HTMLElement, className: string): void {
  tile.classList.remove(className);
  void tile.offsetWidth;
  tile.classList.add(className);
}

export const Presets = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto max-w-3xl";

    const enter = createSection("Enter — classes CSS (clique para reexecutar)");
    for (const className of ENTER_CLASSES) {
      const tile = createTile(`.${className}`);
      tile.addEventListener("click", () => replayClass(tile, className));
      replayClass(tile, className);
      enter.grid.appendChild(tile);
    }
    container.appendChild(enter.section);

    const exit = createSection("Exit — classes CSS (clique para reexecutar)");
    for (const className of EXIT_CLASSES) {
      const tile = createTile(`.${className}`);
      tile.addEventListener("click", () => replayClass(tile, className));
      exit.grid.appendChild(tile);
    }
    container.appendChild(exit.section);

    const waapi = createSection("WAAPI — arkEnter / arkExit (clique: sai e entra)");
    for (const preset of WAAPI_PRESETS) {
      const tile = createTile(preset);
      tile.addEventListener("click", () => {
        arkExit(tile, preset).then(() => arkEnter(tile, preset));
      });
      waapi.grid.appendChild(tile);
    }
    container.appendChild(waapi.section);

    const loading = createSection("Atencao e loading");

    const shake = createTile(".ark-animate-shake");
    shake.addEventListener("click", () => replayClass(shake, "ark-animate-shake"));
    loading.grid.appendChild(shake);

    const spinTile = createTile("");
    const spinner = document.createElement("div");
    spinner.className = "ark-animate-spin h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700";
    spinTile.appendChild(spinner);
    spinTile.title = ".ark-animate-spin";
    loading.grid.appendChild(spinTile);

    const pulse = createTile(".ark-animate-pulse");
    pulse.classList.add("ark-animate-pulse");
    loading.grid.appendChild(pulse);

    // Skeleton estatico por padrao; o pulso e opt-in.
    for (const extra of ["", " ark-skeleton-animated"]) {
      const skeletonTile = createTile("");
      skeletonTile.title = extra ? ".ark-skeleton.ark-skeleton-animated" : ".ark-skeleton";
      const skeletonWrap = document.createElement("div");
      skeletonWrap.className = "flex w-full flex-col gap-2";
      for (const width of ["w-full", "w-3/4", "w-1/2"]) {
        const bar = document.createElement("div");
        bar.className = `ark-skeleton${extra} h-3 ${width}`;
        skeletonWrap.appendChild(bar);
      }
      skeletonTile.appendChild(skeletonWrap);
      loading.grid.appendChild(skeletonTile);
    }

    container.appendChild(loading.section);

    return container;
  }
};

export const Tokens = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto max-w-3xl";

    const durations = createSection("Duracoes — clique em uma barra para ver a duracao");
    durations.grid.className = "flex flex-col gap-2";
    for (const name of Object.keys(ARK_DURATION_MS) as ArkDuration[]) {
      const row = document.createElement("button");
      row.type = "button";
      row.className =
        "flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-sm";

      const label = document.createElement("code");
      label.className = "w-44 shrink-0";
      label.textContent = `--ark-duration-${name}`;
      row.appendChild(label);

      const value = document.createElement("span");
      value.className = "w-14 shrink-0 tabular-nums text-slate-400";
      value.textContent = `${ARK_DURATION_MS[name]}ms`;
      row.appendChild(value);

      const track = document.createElement("div");
      track.className = "relative h-2 flex-1 rounded-full bg-slate-100";
      const bar = document.createElement("div");
      bar.className = "h-2 w-0 rounded-full bg-slate-700";
      bar.style.transitionProperty = "width";
      bar.style.transitionTimingFunction = "var(--ark-ease-standard)";
      bar.style.transitionDuration = `var(--ark-duration-${name})`;
      track.appendChild(bar);
      row.appendChild(track);

      row.addEventListener("click", () => {
        bar.style.width = "0";
        void bar.offsetWidth;
        bar.style.width = "100%";
      });

      durations.grid.appendChild(row);
    }
    container.appendChild(durations.section);

    const easings = createSection("Easings — clique para comparar as curvas");
    easings.grid.className = "flex flex-col gap-2";
    for (const name of Object.keys(ARK_EASING_CSS) as ArkEasing[]) {
      const row = document.createElement("button");
      row.type = "button";
      row.title = ARK_EASING_CSS[name];
      row.className =
        "flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-sm";

      const label = document.createElement("code");
      label.className = "w-44 shrink-0";
      label.textContent = `--ark-ease-${name}`;
      row.appendChild(label);

      const track = document.createElement("div");
      track.className = "relative h-4 flex-1";
      const dot = document.createElement("div");
      dot.className = "absolute left-0 top-0 h-4 w-4 rounded-full bg-slate-700";
      dot.style.transitionProperty = "left";
      dot.style.transitionTimingFunction = `var(--ark-ease-${name})`;
      dot.style.transitionDuration = "var(--ark-duration-slow)";
      track.appendChild(dot);
      row.appendChild(track);

      row.addEventListener("click", () => {
        dot.style.left = "0";
        void dot.offsetWidth;
        dot.style.left = "calc(100% - 1rem)";
      });

      easings.grid.appendChild(row);
    }
    container.appendChild(easings.section);

    return container;
  }
};

// Todas as regras `@media (prefers-reduced-motion: reduce)` do documento: zeramento dos tokens e presets.
function findReducedMotionRules(): CSSMediaRule[] {
  const found: CSSMediaRule[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSMediaRule)) continue;
      if (rule.media.mediaText.replaceAll(" ", "").includes("prefers-reduced-motion:reduce")) found.push(rule);
    }
  }

  return found;
}

export const ReducedMotionOverride = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto max-w-3xl";

    const section = createSection("Movimento reduzido vence os overrides de duracao do app");
    section.grid.className = "flex flex-col gap-2 text-xs text-slate-600";

    const text = document.createElement("p");
    text.textContent =
      "Nem um `:root { --ark-duration-default: 180ms }` escrito depois do CSS da lib, fora de media query, nem um --ark-animate-duration no proprio elemento reativam os presets sob prefers-reduced-motion: os tokens zeram com !important e os presets fixam 0ms. A play desta story reproduz o cenario forcando as media queries a casar.";
    section.grid.appendChild(text);

    const tile = createTile(".ark-animate-fade-in com --ark-animate-duration: 300ms");
    tile.style.setProperty("--ark-animate-duration", "300ms");
    tile.addEventListener("click", () => replayClass(tile, "ark-animate-fade-in"));
    replayClass(tile, "ark-animate-fade-in");
    section.grid.appendChild(tile);

    container.appendChild(section.section);
    return container;
  },
  // Os overrides valem sem a preferencia e perdem para o zeramento quando ela esta ativa.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const rules = findReducedMotionRules();
    expect(rules.length).toBeGreaterThan(0);

    const tile = canvasElement.querySelector<HTMLElement>(".ark-animate-fade-in");
    expect(tile).not.toBeNull();

    const readDefault = (): number =>
      Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ark-duration-default"));
    const readTile = (): string => getComputedStyle(tile as HTMLElement).animationDuration;

    // Override do app: depois do CSS da lib, fora de qualquer media query.
    const override = document.createElement("style");
    override.textContent = ":root { --ark-duration-default: 180ms; }";
    document.head.appendChild(override);

    const originalMedia = rules.map((rule) => rule.media.mediaText);
    try {
      expect(readDefault()).toBe(180);
      expect(readTile()).toBe("0.3s");

      // O Chromium dos testes roda sem movimento reduzido; força as media queries a casar.
      for (const rule of rules) rule.media.mediaText = "all";
      expect(readDefault()).toBe(0);
      expect(readTile()).toBe("0s");
    } finally {
      rules.forEach((rule, index) => {
        rule.media.mediaText = originalMedia[index];
      });
      override.remove();
    }

    // O que garante a vitoria do token acima e a prioridade da declaracao, nao a ordem das folhas.
    const root = rules
      .flatMap((rule) => Array.from(rule.cssRules))
      .find(
        (inner): inner is CSSStyleRule =>
          inner instanceof CSSStyleRule &&
          inner.selectorText === ":root" &&
          inner.style.getPropertyValue("--ark-duration-default") !== ""
      );
    expect(root).toBeDefined();
    expect((root as CSSStyleRule).style.getPropertyPriority("--ark-duration-default")).toBe("important");
  }
};

export const ReducedMotionLoaders = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto max-w-3xl";

    const section = createSection("Loaders continuos sao isentos de movimento reduzido; loops de atencao param");
    section.grid.className = "flex flex-col gap-2 text-xs text-slate-600";

    const text = document.createElement("p");
    text.textContent =
      "O spinner e o unico sinal de progresso e uma rotacao de 1em nao causa desconforto vestibular, entao .ark-animate-spin continua girando sob prefers-reduced-motion (1s fixo, nao token). Shake, pulse e .ark-skeleton-animated param; .ark-skeleton ja e estatico por padrao.";
    section.grid.appendChild(text);

    const row = document.createElement("div");
    row.className = "flex items-center gap-6";

    const spinner = document.createElement("div");
    spinner.className = "ark-animate-spin h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700";
    row.appendChild(spinner);

    const shake = createTile(".ark-animate-shake");
    shake.classList.add("ark-animate-shake");
    row.appendChild(shake);

    const skeleton = document.createElement("div");
    skeleton.className = "ark-skeleton h-3 w-24";
    row.appendChild(skeleton);

    const animated = document.createElement("div");
    animated.className = "ark-skeleton ark-skeleton-animated h-3 w-24";
    row.appendChild(animated);

    section.grid.appendChild(row);
    container.appendChild(section.section);
    return container;
  },
  // Forca as media queries a casar, como na story acima, e compara o que para com o que continua.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const rules = findReducedMotionRules();
    expect(rules.length).toBeGreaterThan(0);

    const name = (selector: string): string =>
      getComputedStyle(canvasElement.querySelector<HTMLElement>(selector) as HTMLElement).animationName;

    expect(name(".ark-animate-spin")).toBe("ark-spin");
    expect(name(".ark-animate-shake")).toBe("ark-shake");
    expect(name(".ark-skeleton:not(.ark-skeleton-animated)")).toBe("none");
    expect(name(".ark-skeleton-animated")).toBe("ark-pulse");

    const originalMedia = rules.map((rule) => rule.media.mediaText);
    try {
      for (const rule of rules) rule.media.mediaText = "all";
      expect(name(".ark-animate-spin")).toBe("ark-spin");
      expect(name(".ark-animate-shake")).toBe("none");
      expect(name(".ark-skeleton-animated")).toBe("none");
    } finally {
      rules.forEach((rule, index) => {
        rule.media.mediaText = originalMedia[index];
      });
    }
  }
};
