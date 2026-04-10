import React, { useCallback, useEffect } from "react";
import type { ArkDatepickerLang, ArkDatepickerLocale, ArkDatepickerStyleOptions } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkDatepickerProps = ArkDatepickerStyleOptions & {
  lang?: ArkDatepickerLang;
  localeJson?: Partial<ArkDatepickerLocale>;
  value?: string;
  min?: string;
  max?: string;
  onChange?: (detail: { value: string | null; date: Date | null }) => void;
  className?: string;
};

export function ArkDatepicker(props: ArkDatepickerProps): React.JSX.Element {
  const { lang, localeJson, theme, intent, accentColor, value, min, max, onChange, className } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
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
    theme,
    intent,
    value,
    min,
    max,
    class: className,
    "accent-color": accentColor,
    "locale-json": localeJson ? JSON.stringify(localeJson) : undefined
  };

  return React.createElement("ark-datepicker", { ...attrs, ref });
}
