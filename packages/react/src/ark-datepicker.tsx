import type { ArkDatepickerLang, ArkDatepickerStyleOptions, ArkLocale } from "@tooark/core";
import type { ArkDatepicker as ArkDatepickerElement } from "@tooark/web-components";
import React, { forwardRef, useCallback, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkDatepickerProps = ArkDomProps<
  ArkDatepickerStyleOptions & {
    lang?: ArkDatepickerLang;
    localeJson?: Partial<ArkLocale>;
    value?: string;
    min?: string;
    max?: string;
    onChange?: (detail: { value: string | null; date: Date | null }) => void;
    className?: string;
  }
>;

export const ArkDatepicker = forwardRef<ArkDatepickerElement, ArkDatepickerProps>(
  function ArkDatepicker(props, forwardedRef): React.JSX.Element {
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
      mode,
      input,
      placeholder,
      name,
      format,
      seconds,
      disabled,
      events,
      eventDisplay,
      stepMinutes,
      hoursFormat,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkDatepickerElement>(forwardedRef);

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
    }, [ref, handleChange]);

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
      mode,
      placeholder,
      name,
      format,
      input: input ? "" : undefined,
      seconds: seconds ? "" : undefined,
      disabled: disabled ? "" : undefined,
      class: className,
      "accent-color": accentColor,
      "locale-json": localeJson ? JSON.stringify(localeJson) : undefined,
      events: events ? JSON.stringify(events) : undefined,
      "event-display": eventDisplay,
      "step-minutes": stepMinutes !== undefined ? String(stepMinutes) : undefined,
      "hours-format": hoursFormat
    };

    return React.createElement("ark-datepicker", { ...attrs, ref: setRef });
  }
);
