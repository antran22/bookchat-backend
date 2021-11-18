#!/bin/sh

IMAGE_TAG="registry.git.yitec.net/bookchat/backend"
CANONICAL_TAG="$IMAGE_TAG:$(date +%Y_%m_%d)"
LATEST_TAG="$IMAGE_TAG:latest"

docker build --platform linux/amd64 -t $LATEST_TAG -t $CANONICAL_TAG . && \
  docker push $LATEST_TAG && \
  docker push $CANONICAL_TAG
