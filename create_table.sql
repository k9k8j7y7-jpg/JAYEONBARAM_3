CREATE TABLE IF NOT EXISTS product_qna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    password VARCHAR(255),
    is_private TINYINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    views INT DEFAULT 0,
    parent_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
