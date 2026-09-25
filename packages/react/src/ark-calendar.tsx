import type { ArkCalendarEvent, ArkCalendarStyleOptions, ArkDatepickerLang, ArkLocale } from "@tooark/core";
import React, { createElement, useCallback, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkCalendarProps = ArkCalendarStyleOptions & {
  lang?: ArkDatepickerLang;
  localeJson?: Partial<ArkLocale>;
  value?: string;
  min?: string;
  max?: string;
  onChange?: (detail: { value: string | null; date: Date | null; events: ArkCalendarEvent[] }) => void;
  className?: string;
};

export function ArkCalendar(props: ArkCalendarProps): React.JSX.Element {
  const {
    lang,
    localeJson,
    theme,
    intent,
    accentColor,
    value,
    min,
    max,
    onChange,
    className,
    testid,
    events,
    eventDisplay,
    ...rest
  } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const handleChange = useCallback(
    (e: Event) => {
      if (onChange) {
        onChange((e as CustomEvent).detail);
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

  // O rest leva ao elemento o que o wrapper não mapeia (id, style, data-*, aria-*).
  const attrs: Record<string, unknown> = {
    ...rest,
    lang,
    theme,
    intent,
    value,
    min,
    max,
    testid,
    class: className,
    "accent-color": accentColor,
    "locale-json": localeJson ? JSON.stringify(localeJson) : undefined,
    events: events ? JSON.stringify(events) : undefined,
    "event-display": eventDisplay
  };

  return createElement("ark-calendar", { ...attrs, ref });
}
