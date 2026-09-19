// Trava de rolagem da página enquanto um overlay modal está aberto: overflow
// hidden no elemento raiz mais a compensação da barra de rolagem que some,
// para o conteúdo não pular. Contada por dono: a página só destrava quando o
// último dono libera, então dialog sobre dialog não solta a trava cedo.

const owners = new Set<object>();
let restore: (() => void) | null = null;

function apply(): void {
  const root = document.documentElement;
  const previous = {
    overflow: root.style.overflow,
    paddingRight: root.style.paddingRight,
    gap: root.style.getPropertyValue("--ark-scroll-lock-gap")
  };

  const before = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  // Só compensa o que de fato sumiu: com scrollbar-gutter stable a calha fica e nada muda.
  const gap = Math.max(0, before - (window.innerWidth - root.clientWidth));
  if (gap > 0) root.style.paddingRight = `${gap}px`;
  root.style.setProperty("--ark-scroll-lock-gap", `${gap}px`);

  restore = () => {
    root.style.overflow = previous.overflow;
    root.style.paddingRight = previous.paddingRight;
    if (previous.gap) {
      root.style.setProperty("--ark-scroll-lock-gap", previous.gap);
    } else {
      root.style.removeProperty("--ark-scroll-lock-gap");
    }
  };
}

/**
 * Trava a rolagem da página em nome de `owner` (em geral o host do overlay): `overflow: hidden` no elemento raiz e
 * um `padding-right` do tamanho da barra que sumiu, também exposto em `--ark-scroll-lock-gap` para elementos
 * fixos do app compensarem. Idempotente por dono; várias travas se acumulam. No-op sem DOM.
 */
export function lockScroll(owner: object): void {
  if (typeof document === "undefined" || owners.has(owner)) return;
  owners.add(owner);
  if (owners.size === 1) apply();
}

/** Libera a trava de `owner`; a página volta a rolar quando o último dono libera. No-op para quem não travou. */
export function unlockScroll(owner: object): void {
  if (!owners.delete(owner) || owners.size > 0) return;
  restore?.();
  restore = null;
}

/** Indica se alguma trava de rolagem está ativa. */
export function isScrollLocked(): boolean {
  return owners.size > 0;
}
