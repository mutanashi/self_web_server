########################################
# Build stage
########################################
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy pom and resolve dependencies first (better layer cache)
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Build frontend first
COPY frontend ./frontend
WORKDIR /workspace/frontend
RUN npm ci && npm run build

# Copy sources and build backend
WORKDIR /workspace
COPY src ./src

# Copy frontend static files to Spring Boot static resources
RUN mkdir -p src/main/resources/static && \
    cp -r frontend/out/* src/main/resources/static/

RUN mvn -q -DskipTests package

########################################
# Runtime stage
########################################
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy fat jar from build stage
COPY --from=build /workspace/target/salary-system-1.0.0.jar /app/app.jar

# App directory for exports
RUN mkdir -p /app/exports

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
