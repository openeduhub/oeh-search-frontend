#!/usr/bin/env bash

set -e

variables=(
    "EDU_SHARING_API_URL"
    "WORDPRESS_URL"
)

function generateEnvJs() {
    echo "(function (window) {"
    echo "    window.__env = window.__env || {};"
    for variable in "${variables[@]}"; do
        if [[ -v $variable ]]; then
            echo "    window.__env.$variable = '${!variable}';"
        fi
    done
    echo "})(this);"
} >env.js

generateEnvJs

# Copy to each localization directory
for dest in /usr/share/nginx/html/search/*; do cp env.js $dest; done
rm env.js
