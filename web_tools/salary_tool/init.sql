-- 創建數據庫
CREATE DATABASE IF NOT EXISTS salary_system;

-- 使用數據庫
\c salary_system;

-- 創建擴展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 初始化一些基本數據（可選）
-- 這些表會由Hibernate自動創建，這裡只是預留一些初始化腳本的位置

-- 創建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_attendances_user_id ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_check_in_time ON attendances(check_in_time);
CREATE INDEX IF NOT EXISTS idx_salary_records_user_year_month ON salary_records(user_id, year, month);