import type { ArkPageChangeDetail, ArkPaginationStyleOptions } from "@tooark/core";
import type { ArkPagination as ArkPaginationElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkPaginationProps = ArkDomProps<
  ArkPaginationStyleOptions & {
    /** Página atual, a partir de 1; um clique a reescreve no elemento e emite onPageChange. */
    page?: number;
    /** Itens por página. Padrão: 10. */
    pageSize?: number;
    /** Total de itens. */
    total?: number;
    /** Opções do seletor de itens por página; sem elas o seletor não aparece. */
    pageSizes?: number[];
    /** Páginas vizinhas da atual, de cada lado. Padrão: 1. */
    siblings?: number;
    disabled?: boolean;
    className?: string;
    /** Página ou itens por página mudaram: detail é { page, pageSize, pageCount }. */
    onPageChange?: (event: CustomEvent<ArkPageChangeDetail>) => void;
  }
>;

export const ArkPagination = forwardRef<ArkPaginationElement, ArkPaginationProps>(
  function ArkPagination(props, forwardedRef): React.JSX.Element {
    const { className, page, pageSize, total, pageSizes, siblings, disabled, localeJson, onPageChange, ...rest } =
      props;
    const [ref, setRef] = useForwardedRef<ArkPaginationElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onPageChange) return;

      const handler = (event: Event) => onPageChange(event as CustomEvent<ArkPageChangeDetail>);
      el.addEventListener("ark-page-change", handler);
      return () => el.removeEventListener("ark-page-change", handler);
    }, [ref, onPageChange]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      page: page !== undefined ? String(page) : undefined,
      "page-size": pageSize !== undefined ? String(pageSize) : undefined,
      total: total !== undefined ? String(total) : undefined,
      "page-sizes": pageSizes && pageSizes.length > 0 ? pageSizes.join(",") : undefined,
      siblings: siblings !== undefined ? String(siblings) : undefined,
      disabled: disabled ? "" : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-pagination", attrs);
  }
);
