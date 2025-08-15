SHELL := /bin/bash

# Image coordinates
IMAGE_NAME ?= salary-tool
TAG ?= dev
REGISTRY ?=
PLATFORMS ?= linux/amd64,linux/arm64

# Computed image name
IMAGE := $(if $(REGISTRY),$(REGISTRY)/)$(IMAGE_NAME):$(TAG)

.PHONY: build run push buildx-push compose-up compose-down logs clean

build:
	docker build -t $(IMAGE) -f Dockerfile .

run:
	docker run --rm -p 8080:8080 $(IMAGE)

push:
	@if [[ -z "$(REGISTRY)" ]]; then echo "REGISTRY is empty; pushing local image name $(IMAGE_NAME). Set REGISTRY for remote push (e.g., ghcr.io/OWNER or docker.io/USER)"; fi
	docker push $(IMAGE)

# Multi-arch build and push using buildx
buildx-push:
	# Example usage:
	# make buildx-push REGISTRY=ghcr.io/OWNER IMAGE_NAME=$(IMAGE_NAME) TAG=latest
	docker buildx create --use --name salarytool_builder 2>/dev/null || true
	docker buildx build \
	  --platform $(PLATFORMS) \
	  -t $(IMAGE) \
	  -f Dockerfile \
	  --push \
	  .

compose-up:
	docker compose up --build -d

compose-down:
	docker compose down

logs:
	docker compose logs -f

clean:
	-docker rmi $(IMAGE) || true

