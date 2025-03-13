-- 添加常用技术分类
INSERT INTO categories (name, description, createdAt, updatedAt)
VALUES 
('前端开发', '前端技术、框架和最佳实践', NOW(), NOW()),
('后端开发', '服务器端编程、API设计和数据库', NOW(), NOW()),
('人工智能', 'AI、机器学习和深度学习技术', NOW(), NOW()),
('移动开发', 'iOS、Android和跨平台应用开发', NOW(), NOW()),
('DevOps', '开发运维、CI/CD和云服务', NOW(), NOW()),
('区块链', '区块链技术、加密货币和智能合约', NOW(), NOW()),
('数据科学', '数据分析、可视化和大数据技术', NOW(), NOW()),
('网络安全', '安全最佳实践、漏洞防护和加密技术', NOW(), NOW());