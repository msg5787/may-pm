#!/bin/zsh -l
export PATH="/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"
docker compose -p maypm -f compose.yaml up -d --build