CREATE DATABASE IF NOT EXISTS jayeonbaram;
USE jayeonbaram;

-- 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 상품 테이블 생성
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 초기 카테고리 데이터 삽입
INSERT IGNORE INTO categories (id, name, slug) VALUES (1, 'SHOP', 'shop');
INSERT IGNORE INTO categories (parent_id, name, slug) VALUES 
(1, '클렌징', 'cleansing'),
(1, '스타일링', 'styling'),
(1, '트리트먼트', 'treatment'),
(1, '웨이브펌', 'wave-perm');

-- 테스트용 상품 데이터 삽입 (트리트먼트 카테고리 4종)
SET @treatment_id = (SELECT id FROM categories WHERE slug = 'treatment' LIMIT 1);
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@treatment_id, '케라틴 너리싱 트리트먼트', '곱슬, 반곱슬, 잔머리 집중 케어', 35000, '/images/products/treatment-1.jpg'),
(@treatment_id, '실크 어드밴스드 마스크', '푸석한 머릿결에 실크광 채움', 42000, '/images/products/treatment-2.jpg'),
(@treatment_id, '리페어링 헤어 밤', '극손상 모발을 위한 리페어링 솔루션', 38000, '/images/products/treatment-3.jpg'),
(@treatment_id, '데일리 수분 케어 트리트먼트', '매일 가볍게 사용하는 데일리 케어', 29000, '/images/products/treatment-4.jpg');
