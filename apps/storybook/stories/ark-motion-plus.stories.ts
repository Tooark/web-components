import { arkFlip, arkReveal, arkStaggerEnter, arkSwipe } from "@tooark/motion";
import type { ArkSwipeDirection } from "@tooark/motion";

const meta = {
  title: "Motion/ArkMotion",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Camada 3 do motion Tooark (@tooark/motion): helpers de alto nivel sobre a lib Motion (motion.dev) — stagger, scroll reveal, FLIP e swipe com fisica de spring. Pacote opt-in, integrado aos tokens --ark-*."
      }
    }
  }
};

export default meta;

function createCard(label: string, hue: number): HTMLElement {
  const card = document.createElement("div");
  card.className = "flex h-20 select-none items-center justify-center rounded-xl border text-sm font-semibold shadow-sm";
  card.style.background = `oklch(0.96 0.03 ${hue})`;
  card.style.borderColor = `oklch(0.85 0.06 ${hue})`;
  card.style.color = `oklch(0.35 0.08 ${hue})`;
  card.textContent = label;
  return card;
}

function createActionButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100";
  button.textContent = label;
  return button;
}

export const Stagger = {
  parameters: {
    docs: { description: { story: "arkStaggerEnter: entrada escalonada de listas com presets e tokens --ark-*." } }
  },
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto flex max-w-2xl flex-col gap-4";

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-3 gap-3";
    const cards = Array.from({ length: 9 }, (_, i) => createCard(`Item ${i + 1}`, 200 + i * 18));
    for (const card of cards) grid.appendChild(card);

    const replay = createActionButton("Reexecutar stagger");
    replay.addEventListener("click", () => {
      void arkStaggerEnter(cards, { preset: "slide-up", interval: 55 });
    });

    container.appendChild(replay);
    container.appendChild(grid);

    queueMicrotask(() => {
      void arkStaggerEnter(cards, { preset: "slide-up", interval: 55 });
    });

    return container;
  }
};

export const ScrollReveal = {
  parameters: {
    layout: "fullscreen",
    docs: { description: { story: "arkReveal: anima a entrada de cada bloco quando ele aparece na viewport (role a pagina)." } }
  },
  render: (): HTMLElement => {
    const page = document.createElement("div");
    page.className = "mx-auto flex max-w-xl flex-col gap-10 p-8";

    const hint = document.createElement("p");
    hint.className = "text-sm text-slate-500";
    hint.textContent = "Role para baixo — cada bloco revela ao entrar na viewport.";
    page.appendChild(hint);

    const blocks: HTMLElement[] = [];
    for (let i = 1; i <= 10; i++) {
      const block = createCard(`Bloco ${i}`, 140 + i * 20);
      block.style.height = "8rem";
      page.appendChild(block);
      blocks.push(block);
    }

    queueMicrotask(() => {
      arkReveal(blocks, { preset: "slide-up", once: false, amount: 0.35 });
    });

    return page;
  }
};

export const FlipReorder = {
  parameters: {
    docs: { description: { story: "arkFlip: embaralha a lista mudando o DOM e anima cada item da posicao antiga para a nova com spring." } }
  },
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto flex max-w-2xl flex-col gap-4";

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-3 gap-3";
    const cards = Array.from({ length: 9 }, (_, i) => createCard(`Item ${i + 1}`, 20 + i * 30));
    for (const card of cards) grid.appendChild(card);

    const shuffle = createActionButton("Embaralhar (FLIP)");
    shuffle.addEventListener("click", () => {
      void arkFlip(cards, () => {
        const shuffled = [...grid.children].sort(() => Math.random() - 0.5);
        for (const child of shuffled) grid.appendChild(child);
      });
    });

    container.appendChild(shuffle);
    container.appendChild(grid);
    return container;
  }
};

export const Swipe = {
  parameters: {
    docs: { description: { story: "arkSwipe: gesto de arrastar com feedback visual, deteccao por distancia/velocidade e retorno com spring." } }
  },
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto flex max-w-md flex-col items-center gap-4";

    const status = document.createElement("p");
    status.className = "text-sm text-slate-500";
    status.textContent = "Arraste o cartao para os lados";

    const card = createCard("Arraste-me", 260);
    card.style.height = "8rem";
    card.style.width = "100%";
    card.style.cursor = "grab";

    let count = 0;
    arkSwipe(card, {
      onSwipe: (direction: ArkSwipeDirection, info) => {
        count += 1;
        const arrow = direction === "left" ? "←" : direction === "right" ? "→" : direction === "up" ? "↑" : "↓";
        status.textContent = `Swipe ${arrow} #${count} (delta ${Math.round(info.delta)}px, ${Math.round(info.velocity)}px/s)`;
      }
    });

    container.appendChild(status);
    container.appendChild(card);
    return container;
  }
};
