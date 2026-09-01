import { arkEnter, arkExit } from "@tooark/core";
import type { ArkMotionPreset } from "@tooark/core";

const meta = {
  title: "Core/ArkMotion",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Motion tokens (--ark-duration-*, --ark-ease-*) e presets de animacao do @tooark/core: classes CSS (.ark-animate-*) e helpers WAAPI (arkEnter/arkExit). Respeita prefers-reduced-motion automaticamente."
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

    const skeletonTile = createTile("");
    skeletonTile.title = ".ark-skeleton";
    const skeletonWrap = document.createElement("div");
    skeletonWrap.className = "flex w-full flex-col gap-2";
    for (const width of ["w-full", "w-3/4", "w-1/2"]) {
      const bar = document.createElement("div");
      bar.className = `ark-skeleton h-3 ${width}`;
      skeletonWrap.appendChild(bar);
    }
    skeletonTile.appendChild(skeletonWrap);
    loading.grid.appendChild(skeletonTile);

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
    for (const name of ["instant", "fast", "normal", "slow", "slower"]) {
      const row = document.createElement("button");
      row.type = "button";
      row.className =
        "flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-sm";

      const label = document.createElement("code");
      label.className = "w-44 shrink-0";
      label.textContent = `--ark-duration-${name}`;
      row.appendChild(label);

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
    for (const name of ["standard", "in", "out", "in-out", "spring"]) {
      const row = document.createElement("button");
      row.type = "button";
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
      dot.style.transitionDuration = "var(--ark-duration-slower)";
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
