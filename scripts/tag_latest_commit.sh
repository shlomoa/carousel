#!/usr/bin/env bash

GITNEWTAG=$(/usr/bin/git tag --merged HEAD |  /usr/bin/tail -1 | /usr/bin/perl -pe 's/(.*)(\d+)\n/$1.($2+1)/e')

/usr/bin/git tag -a -m "a new version: $GITNEWTAG" $GITNEWTAG > /dev/null 2>&1

printf "%s" "$GITNEWTAG"
