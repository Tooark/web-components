import type { ArkCarouselSnap, ArkCarouselStyleOptions } from "@tooark/core";
import type { ArkCarousel as ArkCarouselElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useCallback, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkCarouselProps = PropsWithChildren<
  ArkDomProps<
    ArkCarouselStyleOptions & {
      snap?: ArkCarouselSnap;
      onSlideChange?: (detail: { index: number }) => void;
      className?: string;
    }
  >
>;

export const ArkCarousel = forwardRef<ArkCarouselElement, ArkCarouselProps>(
  function ArkCarousel(props, forwardedRef): React.JSX.Element {
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
      testid,
      ...rest
    } = props;

    const [ref, setRef] = useForwardedRef<ArkCarouselElement>(forwardedRef);

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
    }, [ref, handleSlideChange]);

    // O rest leva ao elemento o que o wrapper não mapeia (id, style, data-*, aria-*).
    const attrs: Record<string, unknown> = {
      ...rest,
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

    return createElement("ark-carousel", { ...attrs, ref: setRef }, children);
  }
);
