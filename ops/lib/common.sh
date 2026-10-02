# Shared by ops/deploy.sh and ops/rollback.sh (sourced, not run).
# Layout on the Pi (plans/refonte-la-descente/02-architecture.md §16):
#   /var/www/bullesenvalais/releases/<YYYYMMDD-HHMMSS>/   one build of dist/ each
#   /var/www/bullesenvalais/current -> releases/…        served by the dive block (from S13)
#   /var/www/bullesenvalais/staging -> releases/…        pre-production
#   /var/www/bullesenvalais/shared/                       mail-config.php, state/ (contact quota)

REMOTE="${BEV_REMOTE:-pi@bullesenvalais.ch}"
BASE='/var/www/bullesenvalais'
PRODUCTION_URL='https://dive.bullesenvalais.ch/'
KEEP_RELEASES=5
RELEASE_PATTERN='^[0-9]{8}-[0-9]{6}$'

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

step() {
  printf '\n==> %s\n' "$*"
}

# Symlink name for a target: production is served from "current".
link_for() {
  case "$1" in
    production) printf 'current' ;;
    staging) printf 'staging' ;;
    *) die "unknown target '$1' (staging or production)" ;;
  esac
}

is_release_name() {
  [[ "$1" =~ $RELEASE_PATTERN ]]
}

# Runs a bash script on the Pi. Arguments become $1, $2… of the remote script.
remote() {
  local script="$1"
  shift
  # ssh joins its arguments into one command line for the remote shell: quote each one.
  ssh -o BatchMode=yes "$REMOTE" "bash -s -- $(printf '%q ' "$@")" <<<"set -euo pipefail
$script"
}

# Release the link points to, or nothing.
linked_release() {
  remote 'link="$1"; [ -L "$link" ] && basename "$(readlink "$link")" || true' "$BASE/$1"
}

# Atomic switch: new link next to the old one, then rename over it (mv -T).
switch_link() {
  local link="$1" release="$2"
  remote '
    base="$1"; link="$2"; release="$3"
    sudo test -d "$base/releases/$release" || { echo "no release $release" >&2; exit 1; }
    sudo ln -sfn "releases/$release" "$base/$link.tmp"
    sudo mv -Tf "$base/$link.tmp" "$base/$link"
    printf "%s -> %s\n" "$link" "$(readlink "$base/$link")"
  ' "$BASE" "$link" "$release"
}

# Files every release must hold, and a PHP 7.4 syntax check of the endpoint.
smoke_files() {
  local link="$1"
  remote '
    dir="$1/$2"
    for file in index.html en/index.html 404.html robots.txt sitemap-index.xml api/contact.php; do
      sudo test -s "$dir/$file" || { echo "missing $file in $dir" >&2; exit 1; }
    done
    sudo test ! -e "$dir/api/mail-config.php" || { echo "mail-config.php inside the release" >&2; exit 1; }
    sudo -u www-data test -r "$dir/index.html" || { echo "www-data cannot read the release" >&2; exit 1; }
    sudo -u www-data php7.4 -l "$dir/api/contact.php" >/dev/null
    echo "files ok, contact.php passes php7.4 -l"
  ' "$BASE" "$link"
}

# Production only: the site answers, and tells whether it already serves this release
# (before the S13 switch, nginx still serves the old docroot).
smoke_http() {
  local release_index="$1" status served
  status="$(curl -sS -o /dev/null -w '%{http_code}' "$PRODUCTION_URL")" || die "curl $PRODUCTION_URL failed"
  [ "$status" = '200' ] || die "$PRODUCTION_URL answered $status (rollback: ops/rollback.sh previous)"
  served="$(curl -sS --compressed "$PRODUCTION_URL")"
  if [ "$served" = "$(cat "$release_index")" ]; then
    echo "$PRODUCTION_URL serves this release"
  else
    echo "$PRODUCTION_URL answers 200 but does not serve this release (nginx still on the old docroot?)"
  fi
}
