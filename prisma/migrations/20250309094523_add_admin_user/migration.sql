-- 首先确保admin角色存在
INSERT IGNORE INTO roles (name, description, createdAt, updatedAt)
VALUES ('admin', '系统管理员', NOW(), NOW());

-- 创建管理员用户（密码：admin123）
-- 注意：这里的密码是使用bcrypt加密后的值，对应明文密码 'admin123'
INSERT INTO users (email, password, name, roleId, active, createdAt, updatedAt)
SELECT 'admin@devnews.com',
       '$2b$10$HAcUcjLusl5yqvhgujzRE.JFxOtYuh8QvcP2ZgohiO1pXS1TEUaO6',
       'Admin',
       r.id,
       true,
       NOW(),
       NOW()
FROM roles r
WHERE r.name = 'admin'
LIMIT 1;