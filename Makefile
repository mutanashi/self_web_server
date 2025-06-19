PROJECT_NAME := docker-site
DOCKER_COMPOSE := docker-compose
DC_FILE := docker-compose.yml

.PHONY: install init up down restart build logs clean shell

install:
	@echo "apt update and Install docker"
	$sudo apt update
	$sudo apt install docker.io docker-compose -y
	$sudo systemctl enable docker
	$sudo usermod -aG docker $USER


init:
	
up:
	@echo "🔼 Starting $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) up -d --build

down:
	@echo "🔽 Stopping $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) down

restart: down up

build:
	@echo "🔨 Rebuilding containers..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) build

logs:
	@echo "📜 Logs:"
	$(DOCKER_COMPOSE) -f $(DC_FILE) logs -f

clean:
	@echo "🧹 Cleaning containers, volumes..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) down -v --remove-orphans

shell:
	@echo "🔧 Entering nginx container..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) exec nginx sh
