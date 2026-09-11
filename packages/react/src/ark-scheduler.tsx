import type { ArkDatepickerLang, ArkSchedulerEvent, ArkSchedulerStyleOptions } from "@tooark/core";
import React, { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkSchedulerProps = ArkSchedulerStyleOptions & {
  lang?: ArkDatepickerLang;
  className?: string;
  onEventClick?: (detail: { event: ArkSchedulerEvent; id: string | null }) => void;
  onSlotClick?: (detail: { start: string; end: string; allDay: boolean }) => void;
  onViewChange?: (detail: { view: string }) => void;
  onRangeChange?: (detail: { start: string; end: string; view: string }) => void;
};

export function ArkScheduler(props: ArkSchedulerProps): React.JSX.Element {
  const {
    className,
    events,
    hourStart,
    hourEnd,
    slotMinutes,
    hoursFormat,
    onEventClick,
    onSlotClick,
    onViewChange,
    onRangeChange,
    ...rest
  } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handlers: Array<[string, EventListener]> = [];
    function bind<T>(name: string, handler?: (detail: T) => void): void {
      if (!handler) return;
      const listener: EventListener = (event) => handler((event as CustomEvent<T>).detail);
      el!.addEventListener(name, listener);
      handlers.push([name, listener]);
    }

    bind("ark-event-click", onEventClick);
    bind("ark-slot-click", onSlotClick);
    bind("ark-view-change", onViewChange);
    bind("ark-range-change", onRangeChange);

    return () => {
      for (const [name, listener] of handlers) {
        el.removeEventListener(name, listener);
      }
    };
  }, [onEventClick, onSlotClick, onViewChange, onRangeChange]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    events: events ? JSON.stringify(events) : undefined,
    "hour-start": hourStart !== undefined ? String(hourStart) : undefined,
    "hour-end": hourEnd !== undefined ? String(hourEnd) : undefined,
    "slot-minutes": slotMinutes !== undefined ? String(slotMinutes) : undefined,
    "hours-format": hoursFormat
  };

  return createElement("ark-scheduler", attrs);
}
