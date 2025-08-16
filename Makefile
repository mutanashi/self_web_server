PROJECT_NAME := docker-site
DOCKER_COMPOSE := docker-compose
DC_FILE := docker-compose.yml
SALARY_DC_FILE := web_tools/salary_tool/docker-compose.yml

.PHONY: install init up down update build logs clean shell salary-up salary-down salary-logs salary-shell salary-build up-with-salary restart-salary-only

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

# Salary Tool specific commands (can run independently)
salary-up:
	@echo "🔼 Starting Salary Tool independently on port 8080..."
	cd web_tools/salary_tool && $(DOCKER_COMPOSE) -f docker-compose.yml up -d --build

salary-down:
	@echo "🔽 Stopping Salary Tool..."
	cd web_tools/salary_tool && $(DOCKER_COMPOSE) -f docker-compose.yml down

salary-logs:
	@echo "📜 Salary Tool Logs:"
	cd web_tools/salary_tool && $(DOCKER_COMPOSE) -f docker-compose.yml logs -f

salary-shell:
	@echo "🔧 Entering Salary Tool container..."
	cd web_tools/salary_tool && $(DOCKER_COMPOSE) -f docker-compose.yml exec salary_app bash

salary-build:
	@echo "🔨 Building Salary Tool..."
	cd web_tools/salary_tool && $(DOCKER_COMPOSE) -f docker-compose.yml build --no-cache

# Combined management with main stack
up-with-salary:
	@echo "🔼 Starting main stack with Salary Tool integrated..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) up -d --build

restart-salary-only:
	@echo "🔄 Restarting only Salary Tool (nginx stays up)..."
	$(DOCKER_COMPOSE) -f $(DC_FILE) restart salary_tool salary_postgres
