import type { ArkToastOptions, ArkToastType } from "../types/style";

/** Detalhes de um toast, incluindo suas opções e o ID único. */
type ArkToastDetail = ArkToastOptions & { id: string };

/** Opções de método de toast, omitindo título e tipo. */
type ArkToastMethodOptions = Omit<ArkToastOptions, "title" | "type">;

/** Tipagem do serviço de toast principal. */
type ArkToastFn = ((title: string, options?: ArkToastMethodOptions) => string) & {
  /** Toast de sucesso. */
  success: (title: string, options?: ArkToastMethodOptions) => string;
  /** Toast informativo. */
  info: (title: string, options?: ArkToastMethodOptions) => string;
  /** Toast de alerta. */
  warning: (title: string, options?: ArkToastMethodOptions) => string;
  /** Toast de erro. */
  error: (title: string, options?: ArkToastMethodOptions) => string;
  /** Toast de carregamento; costuma ser dispensado pelo id quando a operação termina. */
  loading: (title: string, options?: ArkToastMethodOptions) => string;
  /** Toast com todas as opções abertas, incluindo type e id. */
  custom: (options: ArkToastOptions) => string;
  /** Dispensa o toast de id informado, ou todos quando id é omitido. */
  dismiss: (id?: string) => void;
};

/** Gera um ID único para um toast. */
function generateId(): string {
  return `ark-toast-${Math.random().toString(36).slice(2, 10)}`;
}

/** Despacha um evento de toast no `window` com os detalhes fornecidos e devolve o ID do toast. */
function dispatchToast(detail: ArkToastDetail): string {
  // verifica se o ambiente é um navegador antes de despachar o evento
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ark-toast", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  return detail.id;
}

/** Dispara um toast e devolve o id, gerando um quando `options.id` vem vazio. */
export function showToast(options: ArkToastOptions): string {
  const detail: ArkToastDetail = {
    ...options,
    id: options.id || generateId(),
    type: options.type || "default"
  };

  return dispatchToast(detail);
}

/** Dispara um toast de tipo específico com título e opções fornecidas e devolve o ID. */
function showTypedToast(type: ArkToastType, title: string, options?: ArkToastMethodOptions): string {
  return showToast({
    ...options,
    title,
    type
  });
}

/** Dispara um toast do tipo padrão com título e opções fornecidas e devolve o ID. */
function baseToast(title: string, options?: ArkToastMethodOptions): string {
  return showTypedToast("default", title, options);
}

/**
 * Serviço de toast: `toast("Salvo")` dispara o tipo padrão e os métodos
 * (`toast.success`, `toast.error`...) fixam o tipo. Só despacha o evento
 * `ark-toast` em window — quem renderiza é o ark-toaster montado na página,
 * então não há acoplamento direto entre o serviço e o elemento.
 * Exemplo de uso:
 * ```ts
 * toast("Salvo");
 * toast.success("Operação bem-sucedida");
 * toast.error("Ocorreu um erro");
 * ```
 */
export const toast: ArkToastFn = Object.assign(baseToast, {
  success: (title: string, options?: ArkToastMethodOptions) => showTypedToast("success", title, options),
  info: (title: string, options?: ArkToastMethodOptions) => showTypedToast("info", title, options),
  warning: (title: string, options?: ArkToastMethodOptions) => showTypedToast("warning", title, options),
  error: (title: string, options?: ArkToastMethodOptions) => showTypedToast("error", title, options),
  loading: (title: string, options?: ArkToastMethodOptions) => showTypedToast("loading", title, options),
  custom: (options: ArkToastOptions) => showToast(options),
  dismiss: (id?: string) => dismissToast(id)
});

/** Dispensa o toast de id informado, ou todos quando id é omitido. */
export function dismissToast(id?: string): void {
  // Se não houver window, não faz nada.
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("ark-toast-dismiss", {
      detail: { id },
      bubbles: true,
      composed: true
    })
  );
}
