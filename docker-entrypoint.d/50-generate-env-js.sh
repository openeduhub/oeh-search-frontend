#!/usr/bin/env bash

set -e

function generateEnvJs {
    echo "(function (window) {"
    echo "    window.__env = window.__env || {};"
    if [[ -v RELAY_URL ]]; then
        echo "    window.__env.RELAY_URL = '$RELAY_URL';"
        echo "    window.__env.SHOW_EXPERIMENTS = '$SHOW_EXPERIMENTS';"
    fi
    echo "})(this);"
} > env.js

generateEnvJs

# Copy to each localization directory
for dest in /usr/share/nginx/html/*; do cp env.js $dest; done
rm env.js