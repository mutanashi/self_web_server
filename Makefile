PROJECT_NAME := docker-site
DOCKER_COMPOSE := docker-compose
DC_FILE := docker-compose.yml

.PHONY: install init up down update build logs clean shell

install:
	@echo "apt update and Install docker"
	sudo apt update
	sudo apt install docker.io docker-compose -y
	sudo systemctl enable docker
	sudo usermod -aG docker $(USER)


init:
	
up:
	@echo "🔼 Starting $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) up -d --build

down:
	@echo "🔽 Stopping $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) down

update:
	@echo "🔼 Updating $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) down --volumes --remove-orphans
	# 如需全系統清除才開啟以下兩行（小心使用）
<<<<<<< HEAD
	docker container prune -f
	docker image prune -f
=======
	# docker container prune -f
	# docker image prune -f
>>>>>>> ab3f93ff25fa531972575795d9eae357a6ea1b1a
	$(DOCKER_COMPOSE) -f $(DC_FILE) up -d --build

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
