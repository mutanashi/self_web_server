# Makefile for FastAPI server

SERVICE_NAME := fastapi-server
PORT := 8001

.PHONY: build up down rebuild logs exec test

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

rebuild: down build up

logs:
	docker-compose logs -f $(SERVICE_NAME)

exec:
	docker exec -it $(SERVICE_NAME) bash

test:
	curl http://localhost:$(PORT)/health

# Development commands
dev:
	python main.py

install:
	pip install -r requirements.txt
