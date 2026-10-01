import type { ArkClockStyleOptions, ArkDatepickerLang } from "@tooark/core";
import type { ArkClock as ArkClockElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkClockProps = ArkDomProps<
  ArkClockStyleOptions & {
    value?: string;
    lang?: ArkDatepickerLang;
    /** JSON com strings proprias (hours, minutes, seconds), mesclado sobre o ingles, quando lang e "custom". */
    localeJson?: string;
    className?: string;
    onChange?: (detail: { value: string }) => void;
  }
>;

export const ArkClock = forwardRef<ArkClockElement, ArkClockProps>(
  function ArkClock(props, forwardedRef): React.JSX.Element {
    const { className, seconds, stepMinutes, hoursFormat, localeJson, onChange, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkClockElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onChange) return;

      const handler = (event: Event): void => onChange((event as CustomEvent).detail);
      el.addEventListener("ark-change", handler);
      return () => el.removeEventListener("ark-change", handler);
    }, [ref, onChange]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      seconds: seconds ? "" : undefined,
      "step-minutes": stepMinutes !== undefined ? String(stepMinutes) : undefined,
      "hours-format": hoursFormat,
      "locale-json": localeJson
    };

    return createElement("ark-clock", attrs);
  }
);
