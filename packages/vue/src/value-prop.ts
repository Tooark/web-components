// `value` nos wrappers: o Vue grava a prop `value` em todo render, mesmo sem mudança, e num custom element um
// `undefined` vira `el.value = ""` seguido de `removeAttribute("value")`. Num campo, numa seleção ou num grupo que o
// app não controla, isso apagava o que o usuário escolheu a cada render do wrapper.

/** `{ value }` só quando o app passa um valor; sem ele o wrapper não toca no `value` do elemento. */
export function valueProp<T>(value: T | undefined): { value?: T } {
  return value === undefined ? {} : { value };
}
