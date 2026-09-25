import type { ArkSwipeDirection, ArkSwipeInfo } from "@tooark/motion";
import { arkFlip, arkReveal, arkStaggerEnter, arkSwipe } from "@tooark/motion";
import { expect, userEvent, waitFor, within } from "storybook/test";

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
  card.className =
    "flex h-20 select-none items-center justify-center rounded-xl border text-sm font-semibold shadow-sm";
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

// Cleanup do reveal de cada pagina, para o play parar a observacao no fim.
const revealStops = new WeakMap<HTMLElement, () => void>();

const tick = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));
const nextFrame = (): Promise<number> => new Promise((resolve) => requestAnimationFrame(resolve));

// Fim de uma entrada: o transform (animado em JS) chega a `none` um frame antes da opacidade (WAAPI) fechar em 1,
// entao os dois entram na mesma espera.
const settled = (...elements: HTMLElement[]): Promise<void> =>
  waitFor(
    () => {
      for (const el of elements) {
        expect(el.style.transform).toBe("none");
        expect(getComputedStyle(el).opacity).toBe("1");
      }
    },
    { timeout: 3000 }
  );

// O Chromium dos testes roda sem movimento reduzido: troca o matchMedia enquanto `run` executa, como as stories
// de ark-motion fazem com as media queries do CSS.
async function withReducedMotion(run: () => Promise<void> | void): Promise<void> {
  const original = window.matchMedia;
  window.matchMedia = (query: string): MediaQueryList => {
    const list = original.call(window, query);
    if (!query.includes("prefers-reduced-motion")) return list;
    // `matches` e um getter do prototipo sem setter: a propriedade propria sombreia sem atribuir.
    return Object.defineProperty(Object.create(list) as MediaQueryList, "matches", { value: true });
  };
  try {
    await run();
  } finally {
    window.matchMedia = original;
  }
}

// Evento de ponteiro sintetico: o swipe exige `isPrimary` e o mouse (pointerId 1) e sempre um ponteiro ativo, entao
// setPointerCapture nao lanca.
function pointer(target: HTMLElement, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(
    new PointerEvent(type, { pointerId: 1, isPrimary: true, clientX: x, clientY: y, bubbles: true, ...init })
  );
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
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const cards = Array.from(canvasElement.querySelectorAll<HTMLElement>(".grid > div"));
    expect(cards).toHaveLength(9);

    // A entrada inicial roda num microtask e termina com todos visiveis e sem transform residual.
    await settled(...cards);

    // Reexecutar: os itens ainda no intervalo ficam invisiveis (fill both) e tudo termina visivel de novo.
    await userEvent.click(canvas.getByRole("button", { name: "Reexecutar stagger" }));
    await waitFor(() => expect(cards.map((card) => getComputedStyle(card).opacity)).toContain("0"));
    await settled(...cards);
  }
};

// Os helpers leem os tokens da página (aqui sobrescritos no contêiner) antes dos espelhos JS.
export const UsesPageTokens = {
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto grid max-w-md grid-cols-2 gap-3";
    container.style.setProperty("--ark-duration-default", "1500ms");
    container.style.setProperty("--ark-ease-out", "linear");
    for (let i = 0; i < 2; i++) container.appendChild(createCard(`Lento ${i + 1}`, 140 + i * 30));
    return container;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const cards = Array.from(canvasElement.querySelectorAll<HTMLElement>(".grid > div"));
    const done = arkStaggerEnter(cards, { interval: 0 });
    // Com o espelho JS (250 ms) a entrada já teria acabado; com o token da página (1500 ms, linear) está no meio.
    await tick(400);
    const opacity = Number(getComputedStyle(cards[0]).opacity);
    await expect(opacity).toBeGreaterThan(0);
    await expect(opacity).toBeLessThan(0.9);
    await done;
    await settled(...cards);
  }
};

export const ScrollReveal = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { story: "arkReveal: anima a entrada de cada bloco quando ele aparece na viewport (role a pagina)." }
    }
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
      revealStops.set(page, arkReveal(blocks, { preset: "slide-up", once: false, amount: 0.35 }));
    });

    return page;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const page = canvasElement.querySelector<HTMLElement>(".flex")!;
    const blocks = Array.from(page.querySelectorAll<HTMLElement>("div"));
    const first = blocks[0];
    const last = blocks[blocks.length - 1];

    // O primeiro bloco ja esta na viewport: revela e anima ate ficar visivel; o ultimo espera escondido.
    await settled(first);
    expect(last.style.opacity).toBe("0");
    expect(last.style.willChange).toBe("opacity, transform");

    last.scrollIntoView({ block: "center" });
    await settled(last);

    // once: false — sair da viewport esconde de novo e a proxima entrada revela outra vez.
    window.scrollTo(0, 0);
    await waitFor(() => expect(last.style.opacity).toBe("0"));
    last.scrollIntoView({ block: "center" });
    await waitFor(() => expect(last.style.opacity).toBe(""));
    await settled(last);

    // Cleanup: para de observar; voltar a viewport nao revela mais.
    window.scrollTo(0, 0);
    await waitFor(() => expect(last.style.opacity).toBe("0"));
    revealStops.get(page)!();
    last.scrollIntoView({ block: "center" });
    await tick(150);
    expect(last.style.opacity).toBe("0");
    window.scrollTo(0, 0);
  }
};

export const RevealOnce = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: "arkReveal com `once` (padrao): cada bloco anima na primeira entrada e fica visivel ao sair da viewport."
      }
    }
  },
  render: (): HTMLElement => {
    const page = document.createElement("div");
    page.className = "mx-auto flex max-w-xl flex-col gap-10 p-8";

    const blocks: HTMLElement[] = [];
    for (let i = 1; i <= 8; i++) {
      const block = createCard(`Bloco ${i}`, 20 + i * 30);
      block.style.height = "8rem";
      page.appendChild(block);
      blocks.push(block);
    }

    queueMicrotask(() => {
      revealStops.set(page, arkReveal(blocks, { preset: "scale", duration: "quick" }));
    });

    return page;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const page = canvasElement.querySelector<HTMLElement>(".flex")!;
    const blocks = Array.from(page.querySelectorAll<HTMLElement>("div"));
    const last = blocks[blocks.length - 1];

    await settled(blocks[0]);
    expect(last.style.opacity).toBe("0");

    last.scrollIntoView({ block: "center" });
    await settled(last);

    // Sair da viewport nao esconde: a observacao do bloco termina na primeira entrada.
    window.scrollTo(0, 0);
    await tick(150);
    expect(last.style.opacity).not.toBe("0");
    expect(getComputedStyle(last).opacity).toBe("1");
    revealStops.get(page)!();
  }
};

export const FlipReorder = {
  parameters: {
    docs: {
      description: {
        story: "arkFlip: embaralha a lista mudando o DOM e anima cada item da posicao antiga para a nova com spring."
      }
    }
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
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const grid = canvasElement.querySelector<HTMLElement>(".grid")!;
    const shuffle = canvas.getByRole("button", { name: "Embaralhar (FLIP)" });
    const cards = Array.from(grid.children) as HTMLElement[];
    const [first, second] = cards;
    const last = cards[cards.length - 1];
    const slotOfEighth = cards[7].getBoundingClientRect();

    // Primeiro vai para o fim e o ultimo sai do DOM: o primeiro cruza a grade (x e y), o segundo so anda em x e
    // o removido, desconectado, e pulado. Alvos por seletor.
    const run = arkFlip(".grid > div", () => {
      last.remove();
      grid.appendChild(first);
    });
    expect(grid.children).toHaveLength(8);
    expect(grid.lastElementChild).toBe(first);
    await waitFor(() => expect(first.style.transform).toMatch(/^translateX\(.+\) translateY\(.+\)$/));
    await waitFor(() => expect(second.style.transform).toMatch(/^translateX\(.+\)$/));
    expect(last.style.transform).toBe("");
    await run;
    expect(first.style.transform).toBe("none");
    expect(second.style.transform).toBe("none");
    const rect = first.getBoundingClientRect();
    expect(rect.left).toBeCloseTo(slotOfEighth.left, 0);
    expect(rect.top).toBeCloseTo(slotOfEighth.top, 0);

    // Um espacador no topo empurra todos so em y; o botao, fora da grade, nao se move e nao recebe animacao.
    const spacer = document.createElement("div");
    spacer.className = "col-span-3 h-8";
    const push = arkFlip([shuffle, ...cards], () => grid.prepend(spacer), { stiffness: 600, damping: 40 });
    await waitFor(() => expect(first.style.transform).toMatch(/^translateY\(.+\)$/));
    expect(shuffle.style.transform).toBe("");
    await push;
    expect(first.style.transform).toBe("none");

    // Sem alvos ou com movimento reduzido a mutacao e aplicada e nada anima.
    let mutated = 0;
    await arkFlip([], () => {
      mutated += 1;
    });
    expect(mutated).toBe(1);
    await withReducedMotion(async () => {
      const reduced = arkFlip(cards, () => {
        mutated += 1;
        spacer.remove();
      });
      await nextFrame();
      expect(first.style.transform).toBe("none");
      await reduced;
    });
    expect(mutated).toBe(2);
    expect(grid.contains(spacer)).toBe(false);

    // O botao da demo embaralha de verdade.
    await userEvent.click(shuffle);
    expect(grid.children).toHaveLength(8);
  }
};

export const Swipe = {
  parameters: {
    docs: {
      description: {
        story:
          "arkSwipe: gesto de arrastar com feedback visual, deteccao por distancia/velocidade e retorno com spring."
      }
    }
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
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText("Arraste-me");
    const status = canvas.getByText("Arraste o cartao para os lados");
    const box = card.getBoundingClientRect();
    const x0 = box.left + box.width / 2;
    const y0 = box.top + box.height / 2;

    expect(card.style.touchAction).toBe("pan-y");

    // Arrasto curto e lento: o cartao acompanha com resistencia (0.4 -> 60% do delta), nao e swipe e volta com
    // spring ate a posicao original.
    pointer(card, "pointerdown", x0, y0);
    await tick(20);
    pointer(card, "pointermove", x0 + 20, y0);
    expect(card.style.transform).toBe("translateX(12px)");
    // Outro ponteiro e um evento com id diferente sao ignorados enquanto o gesto esta ativo.
    pointer(card, "pointerdown", x0, y0, { pointerId: 2 });
    pointer(card, "pointermove", x0 + 200, y0, { pointerId: 2 });
    pointer(card, "pointerup", x0 + 200, y0, { pointerId: 2 });
    expect(card.style.transform).toBe("translateX(12px)");
    await tick(300);
    pointer(card, "pointermove", x0 + 21, y0);
    pointer(card, "pointerup", x0 + 21, y0);
    expect(status.textContent).toBe("Arraste o cartao para os lados");
    await waitFor(() => expect(card.style.transform).toMatch(/^translateX\(/));
    await waitFor(() => expect(card.style.transform).toBe("none"), { timeout: 3000 });

    // Distancia acima do threshold (48px) com velocidade baixa: swipe para a direita.
    pointer(card, "pointerdown", x0, y0);
    await tick(20);
    pointer(card, "pointermove", x0 + 80, y0);
    await tick(300);
    pointer(card, "pointermove", x0 + 81, y0);
    pointer(card, "pointerup", x0 + 81, y0);
    expect(status.textContent).toMatch(/^Swipe → #1 \(delta 81px, \d+px\/s\)$/);
    await waitFor(() => expect(card.style.transform).toBe("none"), { timeout: 3000 });

    // Abaixo do threshold mas rapido (>= 500px/s): swipe para a esquerda pela velocidade; pointercancel encerra
    // como pointerup.
    pointer(card, "pointerdown", x0, y0);
    await tick(5);
    pointer(card, "pointermove", x0 - 40, y0);
    pointer(card, "pointercancel", x0 - 40, y0);
    expect(status.textContent).toMatch(/^Swipe ← #2 \(delta -40px, -\d+px\/s\)$/);
    await waitFor(() => expect(card.style.transform).toBe("none"), { timeout: 3000 });

    // Ponteiro nao primario nao inicia gesto.
    pointer(card, "pointerdown", x0, y0, { isPrimary: false });
    pointer(card, "pointermove", x0 + 100, y0, { isPrimary: false });
    pointer(card, "pointerup", x0 + 100, y0, { isPrimary: false });
    expect(card.style.transform).toBe("none");
    expect(status.textContent).toMatch(/#2 /);

    // Com movimento reduzido o retorno e imediato, sem spring.
    await withReducedMotion(async () => {
      pointer(card, "pointerdown", x0, y0);
      await tick(20);
      pointer(card, "pointermove", x0 + 10, y0);
      pointer(card, "pointerup", x0 + 10, y0);
      expect(card.style.transform).toBe("");
      await nextFrame();
      await nextFrame();
      expect(card.style.transform).toBe("");
    });

    // Eixo y sem feedback: nada de transform; resistencia fora de 0-1 e limitada; cleanup restaura touch-action e
    // remove os listeners.
    const column = createCard("Vertical", 120);
    column.style.height = "6rem";
    column.style.width = "100%";
    column.style.touchAction = "manipulation";
    canvasElement.appendChild(column);
    const swipes: Array<[ArkSwipeDirection, ArkSwipeInfo]> = [];
    const stop = arkSwipe(column, {
      axis: "y",
      feedback: false,
      resistance: 2,
      threshold: 30,
      onSwipe: (direction, info) => swipes.push([direction, info])
    });
    expect(column.style.touchAction).toBe("pan-x");
    const cy = column.getBoundingClientRect();
    const cx0 = cy.left + cy.width / 2;
    const cy0 = cy.top + cy.height / 2;
    pointer(column, "pointerdown", cx0, cy0);
    await tick(20);
    pointer(column, "pointermove", cx0, cy0 - 50);
    expect(column.style.transform).toBe("");
    pointer(column, "pointerup", cx0, cy0 - 50);
    expect(swipes).toHaveLength(1);
    expect(swipes[0][0]).toBe("up");
    expect(swipes[0][1].delta).toBe(-50);
    pointer(column, "pointerdown", cx0, cy0);
    await tick(20);
    pointer(column, "pointermove", cx0, cy0 + 40);
    pointer(column, "pointerup", cx0, cy0 + 40);
    expect(swipes[1][0]).toBe("down");

    stop();
    expect(column.style.touchAction).toBe("manipulation");
    pointer(column, "pointerdown", cx0, cy0);
    await tick(20);
    pointer(column, "pointermove", cx0, cy0 + 80);
    pointer(column, "pointerup", cx0, cy0 + 80);
    expect(swipes).toHaveLength(2);
    column.remove();
  }
};

export const TargetsAndOptions = {
  parameters: {
    docs: {
      description: {
        story:
          "Alvos aceitos (seletor, elemento, lista, NodeList; SVG e ignorado), presets, distancia em rem/em/px, easing por token, curva ou nome da lib e o atalho com movimento reduzido."
      }
    }
  },
  render: (): HTMLElement => {
    const container = document.createElement("div");
    container.className = "mx-auto flex max-w-md flex-col gap-3";
    for (let i = 1; i <= 3; i++) {
      const card = createCard(`Alvo ${i}`, 300 + i * 20);
      card.classList.add("motion-target");
      container.appendChild(card);
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("aria-hidden", "true");
    container.appendChild(svg);
    return container;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const cards = Array.from(canvasElement.querySelectorAll<HTMLElement>(".motion-target"));
    const svg = canvasElement.querySelector<SVGSVGElement>("svg")!;

    // Sem alvos, ou so com elementos que nao sao HTMLElement, resolve na hora.
    await arkStaggerEnter([]);
    await arkStaggerEnter(svg);
    await arkStaggerEnter([svg]);
    expect(svg.getAnimations()).toHaveLength(0);

    // Seletor + scale + duracao em ms.
    await arkStaggerEnter(".motion-target", { preset: "scale", duration: 80, interval: 0 });
    await settled(...cards);

    // Elemento unico + slide-left com distancia em rem, easing por token e duracao por token.
    await arkStaggerEnter(cards[0], { preset: "slide-left", distance: "1rem", ease: "overshoot", duration: "quick" });
    await settled(...cards);

    // NodeList + slide-right com distancia em em, curva custom e escalonamento a partir do ultimo.
    const list = canvasElement.querySelectorAll(".motion-target");
    const run = arkStaggerEnter(list, {
      preset: "slide-right",
      distance: "2em",
      ease: [0.2, 0, 0, 1],
      from: "last",
      duration: 150,
      interval: 20
    });
    await waitFor(() => expect(cards[2].style.transform).toMatch(/^translateX\(/));
    await run;
    await settled(...cards);

    // Array misto (SVG filtrado) + slide-down em px com nome de easing da lib Motion.
    const down = arkStaggerEnter([svg, cards[1]], {
      preset: "slide-down",
      distance: "24px",
      ease: "easeInOut",
      duration: 150
    });
    await waitFor(() => expect(cards[1].style.transform).toMatch(/^translateY\(-/));
    await down;
    await settled(...cards);

    // Distancia invalida cai no padrao; fade nao tem deslocamento.
    await arkStaggerEnter(cards, { preset: "slide-up", distance: "abc", duration: 50, interval: 0 });
    await arkStaggerEnter(cards, { preset: "fade", duration: 50, interval: 0 });
    await settled(...cards);

    // Movimento reduzido: limpa opacity/transform residuais e resolve; o reveal vira um no-op.
    await withReducedMotion(async () => {
      cards[0].style.opacity = "0";
      cards[0].style.transform = "scale(0.5)";
      await arkStaggerEnter(cards[0]);
      expect(cards[0].style.opacity).toBe("");
      expect(cards[0].style.transform).toBe("");
      const stop = arkReveal(cards);
      expect(cards[0].style.opacity).toBe("");
      stop();
    });
    const none = arkReveal([]);
    none();
  }
};
