#!/usr/bin/env bash
# Rodada 2026-11-16: dois PRs em sequencia (a main exige branch atualizada e historico linear).
#
#   Git Bash, na raiz do repo (no PowerShell: & "C:\Program Files\Git\bin\bash.exe" prompts/rodada-2026-11-16/commits.sh 1-deps):
#     bash prompts/rodada-2026-11-16/commits.sh 1-deps          # dependencias (#34 + #35 + correcoes)
#     bash prompts/rodada-2026-11-16/commits.sh 2-componentes   # so depois do merge do PR de dependencias
#
# Cada passo cria a branch a partir de origin/main, aplica os patches em ordem (git apply --index + git commit -s),
# confere a arvore final, faz push, abre o PR e liga o auto-merge com rebase. Nada roda se a arvore tiver mudanca
# rastreada, se a branch ja estiver no origin ou se origin/main nao estiver no estado em que os patches foram gerados.
# Se parar no meio (antes do push), rodar o mesmo comando de novo, com a branch em uso, continua de onde parou.
set -euo pipefail

step="${1:-}"
case "$step" in
  1-deps)
    branch="chore/deps-2026-11"
    title="chore(deps): grupos runtime e dev do Dependabot com as correcoes do Biome 2.6, da Motion 14.10 e do tiptap"
    ;;
  2-componentes)
    branch="feat/data-view-nav"
    title="feat: ark-data-view, ark-pagination e ark-nav"
    ;;
  *)
    echo "uso: $0 1-deps | 2-componentes" >&2
    exit 1
    ;;
esac

here="$(cd "$(dirname "$0")" && pwd)"
dir="$here/$step"
# BASE_TREE (arvore de origin/main esperada) e FINAL_TREE (arvore depois do ultimo patch).
# shellcheck disable=SC1091
source "$dir/trees.txt"
cd "$(git rev-parse --show-toplevel)"
lock="$(git rev-parse --git-path index.lock)"

# Outro git (a extensao Git do VS Code, o GitLens, o prompt do terminal) segura o index.lock por um instante e o
# comando falha antes de escrever qualquer coisa, entao tentar de novo e seguro. Outros erros saem na hora.
with_index() {
  local try err
  for try in 1 2 3 4 5 6 7 8 9 10; do
    if err="$("$@" 2>&1)"; then
      [ -z "$err" ] || printf '%s\n' "$err"
      return 0
    fi
    case "$err" in
      *index.lock*) sleep 1 ;;
      *)
        printf '%s\n' "$err" >&2
        return 1
        ;;
    esac
  done
  printf '%s\n' "$err" >&2
  echo "$lock continua preso depois de $try tentativas; se nenhum git estiver rodando, apague o arquivo." >&2
  return 1
}

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "A arvore tem mudancas rastreadas; commite ou guarde antes." >&2
  exit 1
fi

git fetch origin --prune
if git ls-remote --exit-code --heads origin "$branch" > /dev/null 2>&1; then
  echo "A branch $branch ja existe no origin; esta rodada ja foi aplicada?" >&2
  echo "Se o script parou depois do push, termine com:" >&2
  echo "  gh pr create --base main --head $branch --title \"$title\" --body-file \"$dir/pr-body.md\"" >&2
  echo "  gh pr merge $branch --auto --rebase" >&2
  exit 1
fi
if [ "$(git rev-parse 'origin/main^{tree}')" != "$BASE_TREE" ]; then
  echo "origin/main nao esta no estado em que os patches de $step foram gerados." >&2
  [ "$step" = "2-componentes" ] && echo "O PR de dependencias (1-deps) ja foi mesclado?" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$branch"; then
  # Retomada: so com a branch em uso e em cima da origin/main atual; os commits que ela ja tem sao pulados pelo assunto.
  if [ "$(git symbolic-ref --quiet --short HEAD || true)" != "$branch" ] || ! git merge-base --is-ancestor origin/main HEAD; then
    echo "A branch local $branch ja existe. Para continuar de onde parou: git switch $branch e rode de novo." >&2
    echo "Para recomecar do zero: git branch -D $branch" >&2
    exit 1
  fi
  echo "Retomando $branch ($(git rev-list --count origin/main..HEAD) commit(s) ja aplicados)."
  orig="$branch"
  git show-ref --verify --quiet refs/heads/main && orig="main"
else
  orig="$(git symbolic-ref --quiet --short HEAD || git rev-parse HEAD)"
  with_index git switch --no-track -c "$branch" origin/main
fi

on_error() {
  echo "" >&2
  echo "Falhou no meio, nada foi enviado. Rode o mesmo comando de novo para continuar de onde parou" >&2
  echo "(com mudanca staged sobrando, git reset --hard antes). Para desfazer tudo:" >&2
  echo "  git reset --hard && git switch $orig && git branch -D $branch" >&2
}
trap on_error ERR

on_main="$(git log --format=%s origin/main)"
applied="$(git log --format=%s origin/main..HEAD)"
dependabot="dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>"
for patch in "$dir"/*.patch; do
  msg="${patch%.patch}.txt"
  subject="$(head -n 1 "$msg")"
  # Trava contra reaplicar um passo que ja esta na main ou que uma execucao anterior ja commitou na branch.
  if grep -Fxq -- "$subject" <<< "$on_main"; then
    echo "pula (ja na main): $subject"
    continue
  fi
  if grep -Fxq -- "$subject" <<< "$applied"; then
    echo "pula (ja na branch): $subject"
    continue
  fi
  with_index git apply --index "$patch"
  case "$(basename "$patch")" in
    01-dependabot-runtime.patch)
      with_index git commit -q -s -F "$msg" --author="$dependabot" --date="2026-11-09T10:10:28Z"
      ;;
    02-dependabot-dev.patch)
      with_index git commit -q -s -F "$msg" --author="$dependabot" --date="2026-11-09T10:13:07Z"
      ;;
    *) with_index git commit -q -s -F "$msg" ;;
  esac
  echo "ok: $subject"
done

if [ "$(git rev-parse 'HEAD^{tree}')" != "$FINAL_TREE" ]; then
  echo "A arvore final difere da validada; nada foi enviado." >&2
  exit 1
fi
trap - ERR

git push -u origin "$branch"
gh pr create --base main --head "$branch" --title "$title" --body-file "$dir/pr-body.md"
gh pr merge "$branch" --auto --rebase
if [ "$orig" != "$branch" ]; then
  with_index git switch "$orig" 2> /dev/null || with_index git switch --detach "$orig"
fi
echo ""
echo "PR aberto com auto-merge (rebase). Acompanhe com: gh pr checks $branch --watch"
