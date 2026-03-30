CREATE TABLE IF NOT EXISTS product_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    full_description TEXT,
    usage_guide TEXT,
    ingredients TEXT,
    main_features TEXT,
    detail_image_url VARCHAR(500),
    usage_image_url VARCHAR(500),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 만약 기존에 product_details 테이블이 존재했으나 이미지 컬럼이 없는 경우를 위한 안전한 ALTER 문법 시작 --
-- (만약 이미 추가된 컬럼이라면 무시하거나 에러가 날 수 있지만 방어 차원에서 작성합니다)
DELIMITER //

CREATE PROCEDURE AddImagesColumnIfNotExist()
BEGIN
    IF NOT EXISTS(
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'product_details' 
        AND COLUMN_NAME = 'detail_image_url'
    ) THEN
        ALTER TABLE product_details ADD COLUMN detail_image_url VARCHAR(500) DEFAULT NULL;
    END IF;

    IF NOT EXISTS(
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'product_details' 
        AND COLUMN_NAME = 'usage_image_url'
    ) THEN
        ALTER TABLE product_details ADD COLUMN usage_image_url VARCHAR(500) DEFAULT NULL;
    END IF;
END //

DELIMITER ;

CALL AddImagesColumnIfNotExist();
DROP PROCEDURE AddImagesColumnIfNotExist;
