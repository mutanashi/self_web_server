# docker-site

This project uses a Makefile to manage a Docker-based Nginx setup using docker-compose.

---

## REQUIREMENTS

- Linux (Ubuntu recommended)
- Docker and Docker Compose
- make utility installed

---

## USAGE

### 1. Install Docker and Docker Compose

```bash
make install
```
This runs:
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Start the Nginx container

```bash
make up
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml up -d --build
```

### 3. Stop the container

```bash
make down
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml down
```

### 4. Restart the container

```bash
make restart
```
This runs:
```bash
make down
make up
```

### 5. Rebuild the container without starting

```bash
make build
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml build
```

### 6. View logs

```bash
make logs
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml logs -f
```

### 7. Clean up containers, volumes, and orphan resources

```bash
make clean
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml down -v --remove-orphans
```

### 8. Open shell inside the nginx container

```bash
make shell
```
Equivalent to:
```bash
docker-compose -f docker-compose.yml exec nginx sh
```

---

## NOTES

- The Makefile uses:
  ```makefile
  PROJECT_NAME := docker-site
  DOCKER_COMPOSE := docker-compose
  DC_FILE := docker-compose.yml
  ```
- Make sure your docker-compose.yml file includes a service named `nginx` for `make shell` to work.
