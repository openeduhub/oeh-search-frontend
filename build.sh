#!/usr/bin/env bash

set -e

git submodule update --init

function build_all() {
    npm install
    npm run clean
    npm run build
    npm run docker-build
}

echo "Building ElasticSearch Relay..."
(
    cd elasticsearch-relay
    build_all
)

echo "Building Frontend..."
(
    build_all
)
