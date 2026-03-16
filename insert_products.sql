USE jayeonbaram;

-- 기존 상품 데이터 삭제
DELETE FROM products;

-- 클렌징
SET @cleansing_id = (SELECT id FROM categories WHERE slug = 'cleansing' LIMIT 1);
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@cleansing_id, '퓨어 밸런스 샴푸', '두피 유수분 밸런스를 맞춰주는 프리미엄 샴푸', 32000, '/images/products/cleansing.png'),
(@cleansing_id, '딥 클린 스칼프 스케일러', '답답한 두피를 시원하게 스케일링해주는 솔루션', 28000, '/images/products/cleansing.png'),
(@cleansing_id, '모이스처 휩 클렌저', '부드러운 거품으로 자극 없는 세정', 24000, '/images/products/cleansing.png'),
(@cleansing_id, '허벌 테라피 린스', '허브 성분으로 모발에 활력을 주는 린스', 30000, '/images/products/cleansing.png');

-- 스타일링
SET @styling_id = (SELECT id FROM categories WHERE slug = 'styling' LIMIT 1);
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@styling_id, '내추럴 홀드 매트 왁스', '번들거림 없이 강력하게 고정되는 매트 왁스', 22000, '/images/products/styling.png'),
(@styling_id, '실크 글로우 스타일링 오일', '모발에 윤기와 결을 살려주는 스타일링 오일', 35000, '/images/products/styling.png'),
(@styling_id, '볼륨 업 헤어 스프레이', '뿌리 볼륨을 하루 종일 유지해주는 스프레이', 18000, '/images/products/styling.png'),
(@styling_id, '소프트 컬 에센스', '탱글탱글한 웨이브를 유지해주는 컬 에센스', 26000, '/images/products/styling.png');

-- 트리트먼트
SET @treatment_id = (SELECT id FROM categories WHERE slug = 'treatment' LIMIT 1);
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@treatment_id, '케라틴 너리싱 트리트먼트', '곱슬, 반곱슬, 잔머리 집중 케어', 35000, '/images/products/treatment.png'),
(@treatment_id, '실크 어드밴스드 마스크', '푸석한 머릿결에 실크광 채움', 42000, '/images/products/treatment.png'),
(@treatment_id, '리페어링 헤어 밤', '극손상 모발을 위한 리페어링 솔루션', 38000, '/images/products/treatment.png'),
(@treatment_id, '데일리 수분 케어 트리트먼트', '매일 가볍게 사용하는 데일리 케어', 29000, '/images/products/treatment.png');

-- 웨이브펌
SET @wave_perm_id = (SELECT id FROM categories WHERE slug = 'wave-perm' LIMIT 1);
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@wave_perm_id, '웨이브 디파인 펌 키트', '집에서도 간편하게 즐기는 프리미엄 펌 키트', 55000, '/images/products/wave-perm.png'),
(@wave_perm_id, '중화 케어 솔루션', '펌 이후 모발 손상을 최소화하는 중화제', 15000, '/images/products/wave-perm.png'),
(@wave_perm_id, '펌 라스틱 세럼', '웨이브 고정력을 높여주는 전문 세럼', 34000, '/images/products/wave-perm.png'),
(@wave_perm_id, '엘라스틱 웨이브 크림', '탄력 있는 웨이브 컬을 위한 마무리 크림', 28000, '/images/products/wave-perm.png');
