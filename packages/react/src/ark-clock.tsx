import type { ArkClockStyleOptions, ArkDatepickerLang } from "@tooark/core";
import type { ArkClock as ArkClockElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkClockProps = ArkClockStyleOptions & {
  value?: string;
  lang?: ArkDatepickerLang;
  className?: string;
  onChange?: (detail: { value: string }) => void;
};

export const ArkClock = forwardRef<ArkClockElement, ArkClockProps>(
  function ArkClock(props, forwardedRef): React.JSX.Element {
    const { className, seconds, stepMinutes, hoursFormat, onChange, ...rest } = props;
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

    const attrs: Record<string, string | undefined | React.Ref<ArkClockElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      seconds: seconds ? "" : undefined,
      "step-minutes": stepMinutes !== undefined ? String(stepMinutes) : undefined,
      "hours-format": hoursFormat
    };

    return createElement("ark-clock", attrs);
  }
);
