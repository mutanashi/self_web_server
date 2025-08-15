########################################
# Build stage
########################################
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copy pom and resolve dependencies first (better layer cache)
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Copy sources and build
COPY src ./src
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
