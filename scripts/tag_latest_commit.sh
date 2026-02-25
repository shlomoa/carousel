#!/usr/bin/env bash

new_tag=$(/usr/bin/git tag --merged HEAD |  /usr/bin/tail -1 | /usr/bin/perl -pe 's/(.*)(\d+)\n/$1.($2+1)/e')

/usr/bin/git tag -a -m "a new version: $new_tag" $new_tag > /dev/null 2>&1

printf $new_tag
