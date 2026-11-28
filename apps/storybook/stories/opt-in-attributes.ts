import { expect, waitFor } from "storybook/test";

/**
 * Confere os atributos opt-in da 1.10.0 renderizados por um wrapper (React, Vue ou Angular), na mesma cena nos três:
 * cada prop nova chega ao elemento e produz o efeito dela.
 */
export async function expectOptInAttributes(canvasElement: HTMLElement): Promise<void> {
  const textarea = canvasElement.querySelector("ark-textarea") as HTMLElement;
  await waitFor(() => expect(textarea).toHaveAttribute("max-rows", "4"));
  await expect((textarea.querySelector("textarea") as HTMLTextAreaElement).style.maxHeight).not.toBe("");
}
