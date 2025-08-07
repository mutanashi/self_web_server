# 💼 Salary System

A salary management system built with Java Spring Boot, featuring role-based access for bosses and employees, JWT authentication, email verification, and Excel export functionality. The system is containerized using Docker and uses a SQL-based backend initialized with `init.sql`.

---

## 📁 Project Structure

salary-system/
├── docker-compose.yml
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/
│   └── wrapper/
│       ├── maven-wrapper.jar
│       └── maven-wrapper.properties
├── init.sql
├── exports/
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── salary/
        │           ├── SalarySystemApplication.java
        │           ├── config/
        │           │   ├── SecurityConfig.java
        │           │   ├── JwtConfig.java
        │           │   └── EmailConfig.java
        │           ├── controller/
        │           │   ├── AuthController.java
        │           │   ├── BossController.java
        │           │   └── EmployeeController.java
        │           ├── dto/
        │           │   ├── AuthRequest.java
        │           │   ├── AuthResponse.java
        │           │   ├── RegisterRequest.java
        │           │   ├── CreateEmployeeRequest.java
        │           │   ├── CreatePublicItemRequest.java
        │           │   └── ExportRequest.java
        │           ├── entity/
        │           │   ├── User.java
        │           │   ├── Attendance.java
        │           │   ├── PublicItem.java
        │           │   └── SalaryRecord.java
        │           ├── repository/
        │           │   ├── UserRepository.java
        │           │   ├── AttendanceRepository.java
        │           │   ├── PublicItemRepository.java
        │           │   └── SalaryRecordRepository.java
        │           ├── service/
        │           │   ├── AuthService.java
        │           │   ├── BossService.java
        │           │   ├── EmployeeService.java
        │           │   ├── EmailService.java
        │           │   ├── ExcelExportService.java
        │           │   └── JwtService.java
        │           └── util/
        │               └── PasswordGenerator.java
        └── resources/
            ├── application.yml
            └── templates/
                └── verification-email.html