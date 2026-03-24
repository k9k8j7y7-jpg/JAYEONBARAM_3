USE jayeonbaram;
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_name VARCHAR(50) NOT NULL,
    rating TINYINT DEFAULT 5,
    is_best TINYINT DEFAULT 0,
    hit_count INT DEFAULT 0,
    recommend_count INT DEFAULT 0,
    thumbnail_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (is_best, created_at DESC),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
