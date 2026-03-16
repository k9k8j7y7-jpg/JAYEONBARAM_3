USE jayeonbaram;

-- 상세 정보 테이블 생성
CREATE TABLE IF NOT EXISTS product_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    full_description TEXT,
    usage_guide TEXT,
    ingredients TEXT,
    main_features TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 여러 이미지를 위한 테이블 생성
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 기존 상품들에 대해 기본 상세 정보 및 이미지 데이터 삽입
-- (테스트를 위해 모든 상품에 기본 상세 데이터를 생성)
INSERT INTO product_details (product_id, full_description, usage_guide, ingredients, main_features)
SELECT 
    id, 
    CONCAT(name, '는 자연바람만의 특별한 성분으로 당신의 모발을 건강하게 지켜줍니다. 프리미엄 헤어 케어의 정수를 경험해보세요.'),
    '적당량을 덜어 모발에 고르게 펴 바른 후 충분히 헹구어 냅니다.',
    '정제수, 천연 유래 오일 콤플렉스, 케라틴 단백질, 비타민 E 등',
    '저자극 포뮬러, 모발 보습 강화, 영양 공급'
FROM products;

-- 모든 상품에 대해 현재 메인 이미지를 이미지 테이블에도 추가
INSERT INTO product_images (product_id, image_path, is_main)
SELECT id, image_url, TRUE FROM products;
