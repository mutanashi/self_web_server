FROM openjdk:17-jdk-slim

WORKDIR /app

# 安裝必要的工具
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 複製Maven wrapper和配置文件
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 下載依賴
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# 複製源代碼
COPY src src

# 打包應用
RUN ./mvnw clean package -DskipTests

# 創建exports目錄
RUN mkdir -p exports

# 運行應用
EXPOSE 8080
CMD ["java", "-jar", "target/salary-system-1.0.0.jar"]