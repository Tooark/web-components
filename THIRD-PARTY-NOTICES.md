# Third-Party Notices

Tooark Web Components is licensed under the [Apache License 2.0](LICENSE).

The distributed artifacts (`dist/`) of every `@tooark/*` package contain only
code authored in this repository: all runtime dependencies are declared as
`external` at build time and are installed separately by consumers, under
their own licenses. The list below documents those licenses for transparency.

## Runtime dependencies (installed with `@tooark/*` packages)

| Dependency                                                                    | License | Used by                                                |
| ----------------------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| [tslib](https://github.com/microsoft/tslib)                                   | 0BSD    | every package except `@tooark/react` and `@tooark/vue` |
| [Tiptap](https://tiptap.dev/) (`@tiptap/*`, ProseMirror)                      | MIT     | `@tooark/wysiwyg`                                      |
| [motion](https://motion.dev/) (incl. framer-motion, motion-dom, motion-utils) | MIT     | `@tooark/motion`                                       |

## Peer dependencies (provided by the consumer)

| Dependency                                                                    | License    | Used by           |
| ----------------------------------------------------------------------------- | ---------- | ----------------- |
| [ECharts](https://echarts.apache.org/)                                        | Apache-2.0 | `@tooark/chart`   |
| [CodeMirror 6](https://codemirror.net/) (`@codemirror/*`, `@lezer/highlight`) | MIT        | `@tooark/code`    |
| [React](https://react.dev/) / react-dom                                       | MIT        | `@tooark/react`   |
| [Vue 3](https://vuejs.org/)                                                   | MIT        | `@tooark/vue`     |
| [Angular](https://angular.dev/) (`@angular/core`, `@angular/common`)          | MIT        | `@tooark/angular` |
| [RxJS](https://rxjs.dev/) (via Angular)                                       | Apache-2.0 | `@tooark/angular` |

[Tailwind CSS v4](https://tailwindcss.com/) (MIT) builds the stylesheets at development time; the published
`styles.css` is already compiled, so consumers do not need it.

## License compatibility assessment

Audited with `pnpm licenses list --prod` (see date in git history). All
production dependencies are under permissive licenses — MIT, Apache-2.0,
0BSD, BSD-2-Clause, BSD-3-Clause and ISC — every one of them compatible
with distribution of this project under the Apache License 2.0. No copyleft
(GPL/LGPL/AGPL) licenses are present in the production dependency graph.

None of these dependencies ships a NOTICE file whose contents this project
is required to propagate, since their code is not redistributed here.

To re-audit after dependency changes:

```bash
pnpm licenses list --prod
```
