CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 初始化一些基本數據（可選）
-- 注意：應用會使用 Hibernate 自動建表與遷移（ddl-auto: update），
-- 這裡不要針對尚未存在的表建立索引，避免容器啟動失敗。
-- 如需索引，請在應用啟動並建表後再手動建立。
