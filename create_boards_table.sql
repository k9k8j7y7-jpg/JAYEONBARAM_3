/* g:\vibecoding\JAYEONBARAM\create_boards_table.sql */
CREATE TABLE IF NOT EXISTS boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    content TEXT,
    views INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (category, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO boards (category, title, author, content, views) VALUES
('notice', '[안내] 자연바람 공식 홈페이지 리뉴얼 오픈 이벤트', '관리자', '자연바람 홈페이지가 새롭게 단장했습니다...', 152),
('notice', '[알람] 3월 봄맞이 샴푸&트리트먼트 세트 한정 세일', '관리자', '봄을 맞아 특별한 할인을 준비했습니다.', 243);
