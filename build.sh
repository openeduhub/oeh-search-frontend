#!/usr/bin/env bash

set -e

if [ $UID = 0 ]; then
    echo "You shall not build as root!"
    echo "Formatting C:\\..."
    exit 1
fi

git submodule init
git submodule foreach git pull origin master
git submodule update

function build_all() {
    npm install
    npm run clean
    npm run build
    npm prune --production
    npm run docker-build
}

echo "Building ElasticSearch Relay..."
(
    cd elasticsearch-relay
    build_all
)

echo "Building Editor Backend..."
(
    cd editor-backend
    build_all
)

echo "Building Frontend..."
(
    build_all
)
