docker-site
===========

This project uses a Makefile to manage a Docker-based Nginx setup using docker-compose.

REQUIREMENTS
------------
- Linux (Ubuntu recommended)
- Docker and Docker Compose
- make utility installed

USAGE
-----

1. Install Docker and Docker Compose:
   make install
   (This runs: sudo apt update, installs docker.io & docker-compose, enables docker, and adds user to docker group)

2. Start the Nginx container:
   make up
   Equivalent to:
     docker-compose -f docker-compose.yml up -d --build

3. Stop the container:
   make down
   Equivalent to:
     docker-compose -f docker-compose.yml down

4. Restart the container:
   make restart
   (Runs make down then make up)

5. Rebuild the container without starting:
   make build
   Equivalent to:
     docker-compose -f docker-compose.yml build

6. View logs:
   make logs
   Equivalent to:
     docker-compose -f docker-compose.yml logs -f

7. Clean up containers, volumes, and orphan resources:
   make clean
   Equivalent to:
     docker-compose -f docker-compose.yml down -v --remove-orphans

8. Open shell inside the nginx container:
   make shell
   Equivalent to:
     docker-compose -f docker-compose.yml exec nginx sh

NOTES
-----
- The Makefile uses PROJECT_NAME := docker-site and docker-compose.yml as the config file.
- Make sure your docker-compose.yml file includes a service named "nginx" for `make shell` to work.
