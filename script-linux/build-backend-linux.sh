#!/usr/bin/env bash

set -e

# Builds the server-side golang resources for tectonic-console. For a
# complete build, you must also run build-frontend

PROJECT_DIR=$(basename ${PWD})

# GIT_TAG=`git describe --always --tags HEAD`
GIT_TAG="${PRODUCT}:${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${HOTFIX_VERSION}"
echo ${GIT_TAG}
LD_FLAGS="-w -X github.com/tmax-cloud/hypercloud-console/version.Version=${GIT_TAG}"
echo ${LD_FLAGS}

CGO_ENABLED=0 go build -ldflags "${LD_FLAGS}" -o bin/bridge github.com/tmax-cloud/hypercloud-console/cmd/bridge
