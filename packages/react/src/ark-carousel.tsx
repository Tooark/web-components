import type { ArkCarouselSnap, ArkCarouselStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useCallback, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkCarouselProps = PropsWithChildren<
  ArkCarouselStyleOptions & {
    snap?: ArkCarouselSnap;
    onSlideChange?: (detail: { index: number }) => void;
    className?: string;
  }
>;

export function ArkCarousel(props: ArkCarouselProps): React.JSX.Element {
  const {
    children,
    theme,
    intent,
    accentColor,
    slidesPerView,
    gap,
    startIndex,
    loop,
    autoplay,
    autoplayDelay,
    showDots,
    showArrows,
    dragFree,
    snap,
    onSlideChange,
    className,
    testid
  } = props;

  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const handleSlideChange = useCallback(
    (event: Event) => {
      if (onSlideChange) {
        onSlideChange((event as CustomEvent).detail);
      }
    },
    [onSlideChange]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("ark-slide-change", handleSlideChange);
    return () => el.removeEventListener("ark-slide-change", handleSlideChange);
  }, [handleSlideChange]);

  const attrs: Record<string, string | number | boolean | undefined> = {
    theme,
    intent,
    "accent-color": accentColor,
    "slides-per-view": slidesPerView,
    gap,
    "start-index": startIndex,
    "autoplay-delay": autoplayDelay,
    snap,
    testid,
    class: className,
    loop: loop ? true : undefined,
    autoplay: autoplay ? true : undefined,
    "drag-free": dragFree ? true : undefined,
    "show-dots": showDots === undefined ? undefined : showDots ? true : "false",
    "show-arrows": showArrows === undefined ? undefined : showArrows ? true : "false"
  };

  return createElement("ark-carousel", { ...attrs, ref }, children);
}
