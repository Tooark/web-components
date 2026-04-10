import type { ArkToastOptions, ArkToastType } from "../types/style";

type ArkToastDetail = ArkToastOptions & { id: string };

type ArkToastMethodOptions = Omit<ArkToastOptions, "title" | "type">;

type ArkToastFn = ((title: string, options?: ArkToastMethodOptions) => string) & {
  success: (title: string, options?: ArkToastMethodOptions) => string;
  info: (title: string, options?: ArkToastMethodOptions) => string;
  warning: (title: string, options?: ArkToastMethodOptions) => string;
  error: (title: string, options?: ArkToastMethodOptions) => string;
  loading: (title: string, options?: ArkToastMethodOptions) => string;
  custom: (options: ArkToastOptions) => string;
  dismiss: (id?: string) => void;
};

function generateId(): string {
  return `ark-toast-${Math.random().toString(36).slice(2, 10)}`;
}

function dispatchToast(detail: ArkToastDetail): string {
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

export function showToast(options: ArkToastOptions): string {
  const detail: ArkToastDetail = {
    ...options,
    id: options.id || generateId(),
    type: options.type || "default"
  };

  return dispatchToast(detail);
}

function showTypedToast(type: ArkToastType, title: string, options?: ArkToastMethodOptions): string {
  return showToast({
    ...options,
    title,
    type
  });
}

function baseToast(title: string, options?: ArkToastMethodOptions): string {
  return showTypedToast("default", title, options);
}

export const toast: ArkToastFn = Object.assign(baseToast, {
  success: (title: string, options?: ArkToastMethodOptions) => showTypedToast("success", title, options),
  info: (title: string, options?: ArkToastMethodOptions) => showTypedToast("info", title, options),
  warning: (title: string, options?: ArkToastMethodOptions) => showTypedToast("warning", title, options),
  error: (title: string, options?: ArkToastMethodOptions) => showTypedToast("error", title, options),
  loading: (title: string, options?: ArkToastMethodOptions) => showTypedToast("loading", title, options),
  custom: (options: ArkToastOptions) => showToast(options),
  dismiss: (id?: string) => dismissToast(id)
});

export function dismissToast(id?: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("ark-toast-dismiss", {
      detail: { id },
      bubbles: true,
      composed: true
    })
  );
}
