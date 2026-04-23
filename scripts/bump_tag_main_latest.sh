#!/usr/bin/env bash

GITNEWTAG=$(git tag --merged HEAD |  tail -1 | perl -pe 's/(.*)(\d+)\n/$1.($2+1)/e')

git tag -a "$GITNEWTAG" -m "a new version: $GITNEWTAG"  > /dev/null 2>&1
git push origin --tags > /dev/null 2>&1

printf "%s" "$GITNEWTAG"
