# Makefile for building and running Docker container

IMAGE_NAME := device-management-service
CONTAINER_NAME := device-management-service
NETWORK := microservices
PORT := 8000

.PHONY: build up down rebuild stop remove logs exec

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down || true
	-@docker rm -f $(CONTAINER_NAME) 2>/dev/null || true

rebuild: down build up

logs:
	docker-compose logs -f $(CONTAINER_NAME)

exec:
	docker exec -it $(CONTAINER_NAME) sh

