#!/usr/bin/env bash
# Deploys dist/ to the Pi as a new release, then switches the target's symlink atomically.
#   ops/deploy.sh staging|production [--dry-run] [--skip-build]
#     --dry-run     build and test locally, then only show what would be sent (rsync -n)
#     --skip-build  reuse the dist/ already built (tests must have run on this commit)
# Never touches the old docroot (/var/www/html/dive) nor shared/; keeps the last 5 releases
# (and always the ones current and staging point to).
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck source=ops/lib/common.sh
source ops/lib/common.sh

target=''
dry_run=false
skip_build=false
for arg in "$@"; do
  case "$arg" in
    staging | production) target="$arg" ;;
    --dry-run) dry_run=true ;;
    --skip-build) skip_build=true ;;
    *) die "usage: ops/deploy.sh staging|production [--dry-run] [--skip-build]" ;;
  esac
done
[ -n "$target" ] || die "usage: ops/deploy.sh staging|production [--dry-run] [--skip-build]"
link="$(link_for "$target")"

[ -z "$(git status --porcelain)" ] || die "the working tree is not clean: commit first"
commit="$(git rev-parse --short HEAD)"
release="$(TZ=Europe/Zurich date +%Y%m%d-%H%M%S)"
is_release_name "$release" || die "bad release name $release"

if $skip_build; then
  [ -f dist/index.html ] && [ -f dist/api/contact.php ] || die "no dist/ to reuse: run without --skip-build"
else
  step "Build $commit (npm ci, tests, build + check:dist)"
  npm ci
  npm test
  npm run build
fi

step "Pre-flight on $REMOTE"
remote '
  base="$1"; release="$2"
  sudo test -d "$base/releases" || { echo "missing $base/releases (see S12)" >&2; exit 1; }
  sudo test -f "$base/shared/mail-config.php" || { echo "missing $base/shared/mail-config.php" >&2; exit 1; }
  sudo test ! -e "$base/releases/$release" || { echo "release $release already exists" >&2; exit 1; }
  df -h "$base" | tail -1
' "$BASE" "$release"
previous="$(linked_release "$link")"
echo "$link -> ${previous:-nothing yet}; new release: $release ($commit)"

# macOS ships openrsync (no --chmod): modes are set on the Pi after the transfer.
rsync_options=(-rlt -e "ssh ${SSH_OPTIONS[*]}" --rsync-path='sudo rsync' --exclude='.DS_Store')
if $dry_run; then
  step "Dry run: files that would go to releases/$release"
  rsync "${rsync_options[@]}" -n --stats dist/ "$REMOTE:$BASE/releases/$release/" | tail -n 16
  echo "dry run: nothing sent, $link unchanged"
  exit 0
fi

step "Send dist/ to releases/$release"
rsync "${rsync_options[@]}" dist/ "$REMOTE:$BASE/releases/$release/"
remote 'sudo chmod -R u=rwX,go=rX "$1" && sudo chown -R www-data:www-data "$1"' "$BASE/releases/$release"

step "Switch $link"
switch_link "$link" "$release"

step "Smoke test"
smoke_files "$link"
if [ "$target" = production ]; then
  smoke_http dist/index.html
fi

step "Keep the last $KEEP_RELEASES releases"
remote '
  base="$1"; keep="$2"; entry="$3"
  in_use="$(for l in current staging; do [ -L "$base/$l" ] && basename "$(readlink "$base/$l")"; done || true)"
  ls -1 "$base/releases" | grep -E "^[0-9]{8}-[0-9]{6}$" | sort | head -n "-$keep" | while read -r old; do
    if printf "%s\n" "$in_use" | grep -qx "$old"; then continue; fi
    sudo rm -rf -- "$base/releases/$old" && echo "removed $old"
  done
  printf "%s\n" "$entry" | sudo tee -a "$base/deploy.log" >/dev/null
' "$BASE" "$KEEP_RELEASES" "$release $target $commit $(whoami)"

rollback_hint='ops/rollback.sh previous'
[ "$target" = staging ] && rollback_hint='ops/rollback.sh staging previous'
step "Done: $target -> releases/$release ($commit); undo: $rollback_hint"
