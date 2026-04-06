import React, { useEffect, useCallback } from "react";
import { registerTooarkComponents } from "@tooark/core";
import type { ArkDatepickerLocale } from "@tooark/core";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: "button" | "submit" | "reset";
        disabled?: boolean;
        variant?: "primary" | "secondary" | "outline" | "ghost";
        size?: "sm" | "md" | "lg";
      };
      "ark-datepicker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        lang?: "en" | "pt" | "es" | "custom";
        "locale-json"?: string;
        value?: string;
        min?: string;
        max?: string;
      };
    }
  }
}

// ---------- ArkButton ----------

export type ArkButtonProps = React.PropsWithChildren<{
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}>;

export function ArkButton(props: ArkButtonProps): React.JSX.Element {
  const { children, className, ...rest } = props;

  useEffect(() => {
    registerTooarkComponents();
  }, []);

  return React.createElement("ark-button", { ...rest, class: className }, children);
}

// ---------- ArkDatepicker ----------

export type ArkDatepickerProps = {
  lang?: "en" | "pt" | "es" | "custom";
  localeJson?: Partial<ArkDatepickerLocale>;
  value?: string;
  min?: string;
  max?: string;
  onChange?: (detail: { value: string | null; date: Date | null }) => void;
  className?: string;
};

export function ArkDatepicker(props: ArkDatepickerProps): React.JSX.Element {
  const { lang, localeJson, value, min, max, onChange, className } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    registerTooarkComponents();
  }, []);

  const handleChange = useCallback(
    (e: Event) => {
      if (onChange) {
        const detail = (e as CustomEvent).detail;
        onChange(detail);
      }
    },
    [onChange]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("ark-change", handleChange);
    return () => el.removeEventListener("ark-change", handleChange);
  }, [handleChange]);

  const attrs: Record<string, string | undefined> = {
    lang,
    value,
    min,
    max,
    class: className,
    "locale-json": localeJson ? JSON.stringify(localeJson) : undefined
  };

  return React.createElement("ark-datepicker", { ...attrs, ref });
}
