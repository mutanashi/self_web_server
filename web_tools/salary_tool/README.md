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

---

## 🚀 Features covered

- Authentication: register (email required) → email verify → login (JWT)
- Boss: create employee accounts with labels (many-labels), create public items, export employees to Excel filtered by labels
- Employee: clock-in, view monthly salary records, view public items

---

## 🔌 API endpoints (summary)

- `POST /api/auth/register` body: `{ username, email, password }`
- `GET /api/auth/verify?token=...`
- `POST /api/auth/login` body: `{ email, password }` → `{ token, tempToken }`

- `POST /api/boss/employees` (ROLE_BOSS) body: `{ email, password, labels?: ["A","B"] }`
- `POST /api/boss/public-items` (ROLE_BOSS) body: `{ title, content }`
- `POST /api/boss/export` (ROLE_BOSS) body: `{ labelNames: ["A"], year?, month? }` → returns file path under `exports/`

- `POST /api/employee/clock-in` (JWT)
- `GET /api/employee/salaries?year=YYYY&month=MM` (JWT)
- `GET /api/employee/attendances?start=YYYY-MM-DD&end=YYYY-MM-DD` (JWT)
- `GET /api/employee/public-items` (JWT)

Note: initial BOSS user is not auto-created. Create it via SQL or temporarily mark a user as BOSS in the DB.

---

## 🐳 Run with Docker

1) Build and start services

```
docker compose up --build
```

2) Environment variables

- The app reads DB, mail, and JWT config from env vars (see `application.yml`).
- You can create a `.env` by copying `.env.example` and customizing values:

```
cp .env.example .env
# edit .env
```

- Compose automatically uses variables from `.env`. Defaults are baked into `docker-compose.yml` and `application.yml`, so it also runs without a `.env`.

3) Exported files

- The container writes exported Excel files to `/app/exports`, bind-mounted to the repo's `exports/` directory. That folder is already present in the repo.

---

## 🖥️ Frontend (built-in minimal UI)

This repo now serves a simple static frontend for basic flows (register, verify, login, employee actions, boss actions) without needing Node tooling.

- Location: `src/main/resources/static/index.html`
- Served at: `http://localhost:8080/` (same origin as API)
- Security: Static files and `/` are publicly accessible; API remains protected by JWT.

Using it
- Rebuild and start: `docker compose up --build`
- Open: `http://localhost:8080/`
- Register → fetch verification token from DB → verify → login → use buttons for protected endpoints. The UI stores JWT locally until you hit Logout.

Notes
- Verification token: retrieve from DB, e.g.:
  - `docker exec -it salary_postgres psql -U salary_user -d salary_system -c "SELECT id,email,verification_token,enabled,role FROM users;"`
- Boss features: promote your user to BOSS in DB after registration and verification:
  - `docker exec -it salary_postgres psql -U salary_user -d salary_system -c "UPDATE users SET role='BOSS', enabled=true WHERE email='you@example.com';"`
- Exports: the export endpoint returns a file path under `exports/` in the container; the folder is bind-mounted to the repository's `exports/` directory on your host.

---

## 🔐 Security

- All non-auth routes require JWT in `Authorization: Bearer <token>`
- Boss-only routes require `ROLE_BOSS`

---

## 📎 Notes

- Tables are auto-created by JPA (`ddl-auto: update`). Indexes in `init.sql` are optional.
- Email sending may fail without valid SMTP credentials; registration still completes, and you can verify by hitting `/api/auth/verify?token=...` with the saved token from the `users` table.

---

## ✉️ Email via Gmail (App Password)

- Turn on 2‑Step Verification on your Google account.
- Create an App Password (select app: Mail, device: Other) — you’ll get a 16‑character code.
- Copy `.env.example` to `.env` and fill:
  - `SPRING_MAIL_USERNAME=your_gmail_address@gmail.com`
  - `SPRING_MAIL_PASSWORD=your_16_char_google_app_password`
- Start with Docker Compose; Spring uses these env vars.
- Test from the built‑in UI:
  - Register to receive a verification email.
  - Or after logging in, click “Send me a test email”.
