#!/usr/bin/env bash

GITNEWTAG=$(/usr/bin/git tag --merged HEAD |  /usr/bin/tail -1 | /usr/bin/perl -pe 's/(.*)(\d+)\n/$1.($2+1)/e')

/usr/bin/git tag -a "$GITNEWTAG" -m "a new version: $GITNEWTAG"  > /dev/null 2>&1
/usr/bin/git push origin --tags > /dev/null 2>&1

printf "%s" "$GITNEWTAG"
