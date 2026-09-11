import type { ArkClockStyleOptions, ArkDatepickerLang } from "@tooark/core";
import React, { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkClockProps = ArkClockStyleOptions & {
  value?: string;
  lang?: ArkDatepickerLang;
  className?: string;
  onChange?: (detail: { value: string }) => void;
};

export function ArkClock(props: ArkClockProps): React.JSX.Element {
  const { className, seconds, stepMinutes, hoursFormat, onChange, ...rest } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event): void => onChange((event as CustomEvent).detail);
    el.addEventListener("ark-change", handler);
    return () => el.removeEventListener("ark-change", handler);
  }, [onChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    seconds: seconds ? "" : undefined,
    "step-minutes": stepMinutes !== undefined ? String(stepMinutes) : undefined,
    "hours-format": hoursFormat
  };

  return createElement("ark-clock", attrs);
}
