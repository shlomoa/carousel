#!/usr/bin/env bash
set -euo pipefail

LATEST_TAG=$(git tag --merged HEAD | sort -V | tail -1)

if [[ -z "$LATEST_TAG" ]]; then
  GITNEWTAG="v1"
else
  GITNEWTAG=$(printf "%s" "$LATEST_TAG" | perl -pe 's/(.*)(\d+)/$1.($2+1)/e')
fi

git tag -a "$GITNEWTAG" -m "a new version: $GITNEWTAG"
git push origin "$GITNEWTAG"

printf "%s" "$GITNEWTAG"
