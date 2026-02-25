#!/usr/bin/env bash

new_tag=$(git tag --merged HEAD |  tail -1 | perl -pe 's/(.*)(\d+)/$1.($2+1)/e')

#git tag -a $new_tag -m "a new version: $new_tag"

echo $new_tag
