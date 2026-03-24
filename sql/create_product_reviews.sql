-- product_reviews 테이블 생성
-- 실행: MySQL 콘솔 또는 phpMyAdmin에서 이 SQL을 실행하세요.

CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_best TINYINT(1) NOT NULL DEFAULT 0,
    hit_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 조회 성능을 위한 인덱스
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_is_best ON product_reviews(is_best);
