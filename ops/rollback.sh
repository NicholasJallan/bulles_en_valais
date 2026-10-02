#!/usr/bin/env bash
# Points a target back to an older release (atomic symlink switch), without rebuilding.
#   ops/rollback.sh [staging|production] previous|<YYYYMMDD-HHMMSS>|--list
# Target defaults to production. "previous" = the release just before the one in use.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=ops/lib/common.sh
source ops/lib/common.sh

usage='usage: ops/rollback.sh [staging|production] previous|<YYYYMMDD-HHMMSS>|--list'
target=production
choice=''
for arg in "$@"; do
  case "$arg" in
    staging | production) target="$arg" ;;
    previous | --list) choice="$arg" ;;
    *) is_release_name "$arg" && choice="$arg" || die "$usage" ;;
  esac
done
[ -n "$choice" ] || die "$usage"
link="$(link_for "$target")"

releases="$(remote 'ls -1 "$1/releases" | grep -E "^[0-9]{8}-[0-9]{6}$" | sort' "$BASE")"
in_use="$(linked_release "$link")"
if [ "$choice" = --list ]; then
  printf '%s\n' "$releases" | sed "s/^$in_use\$/& <- $link/"
  exit 0
fi

if [ "$choice" = previous ]; then
  [ -n "$in_use" ] || die "$link points to no release"
  wanted="$(printf '%s\n' "$releases" | grep -B1 -x "$in_use" | grep -vx "$in_use" || true)"
  [ -n "$wanted" ] || die "no release older than $in_use"
else
  wanted="$choice"
  printf '%s\n' "$releases" | grep -qx "$wanted" || die "no release $wanted (ops/rollback.sh --list)"
fi
[ "$wanted" != "$in_use" ] || die "$link already points to $wanted"

step "Switch $link: ${in_use:-nothing} -> $wanted"
switch_link "$link" "$wanted"

step "Smoke test"
smoke_files "$link"
if [ "$target" = production ]; then
  status="$(curl -sS -o /dev/null -w '%{http_code}' "$PRODUCTION_URL")" || die "curl $PRODUCTION_URL failed"
  echo "$PRODUCTION_URL answered $status"
fi
remote 'printf "%s\n" "$2" | sudo tee -a "$1/deploy.log" >/dev/null' "$BASE" "$wanted $target rollback $(whoami)"
step "Done: $target -> releases/$wanted"
