USE jayeonbaram;

-- 기존 상품 및 상세 정보 삭제 (깔끔한 재등록을 위해)
DELETE FROM product_details;
DELETE FROM products;
ALTER TABLE products AUTO_INCREMENT = 1;

-- 1. 클렌징 (ID 확인 후 삽입)
SET @cleansing_id = (SELECT id FROM categories WHERE slug = 'cleansing' LIMIT 1);

-- 이미지 파일이 있는 기존 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@cleansing_id, '퓨어 밸런스 샴푸', '두피 유수분 밸런스를 맞춰주는 프리미엄 샴푸', 32000, '/images/products/cleansing.png'),
(@cleansing_id, '딥 클린 스칼프 스케일러', '답답한 두피를 시원하게 스케일링해주는 솔루션', 28000, '/images/products/cleansing.png'),
(@cleansing_id, '모이스처 휩 클렌저', '부드러운 거품으로 자극 없는 세정', 24000, '/images/products/cleansing.png'),
(@cleansing_id, '허벌 테라피 린스', '허브 성분으로 모발에 활력을 주는 린스', 30000, '/images/products/cleansing.png');

-- 추가 요청 테스트 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(@cleansing_id, '프레쉬 데일리 샴푸', '매일매일 상쾌한 두피 관리', 24000, 'https://placehold.co/400x400?text=Fresh+Daily+Shampoo'),
(@cleansing_id, '스칼프 케어 샴푸', '두피 진정 및 딥 클렌징', 28000, 'https://placehold.co/400x400?text=Scalp+Care+Shampoo'),
(@cleansing_id, '퓨어 클렌징 린스', '부드러운 머릿결을 위한 선택', 22000, 'https://placehold.co/400x400?text=Pure+Cleansing+Rinse'),
(@cleansing_id, '오가닉 허브 샴푸', '민감한 두피를 위한 약산성 솔루션', 32000, 'https://placehold.co/400x400?text=Organic+Herb+Shampoo');

-- 2. 스타일링
SET @styling_id = (SELECT id FROM categories WHERE slug = 'styling' LIMIT 1);

-- 이미지 파일이 있는 기존 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@styling_id, '내추럴 홀드 매트 왁스', '번들거림 없이 강력하게 고정되는 매트 왁스', 22000, '/images/products/styling.png'),
(@styling_id, '실크 글로우 스타일링 오일', '모발에 윤기와 결을 살려주는 스타일링 오일', 35000, '/images/products/styling.png'),
(@styling_id, '볼륨 업 헤어 스프레이', '뿌리 볼륨을 하루 종일 유지해주는 스프레이', 18000, '/images/products/styling.png'),
(@styling_id, '소프트 컬 에센스', '탱글탱글한 웨이브를 유지해주는 컬 에센스', 26000, '/images/products/styling.png');

-- 추가 요청 테스트 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(@styling_id, '소프트 홀드 왁스', '내추럴한 스타일링의 완성', 18000, 'https://placehold.co/400x400?text=Soft+Hold+Wax'),
(@styling_id, '볼륨 파우더 스프레이', '뿌리부터 살아나는 볼륨감', 25000, 'https://placehold.co/400x400?text=Volume+Powder+Spray'),
(@styling_id, '샤인 미스트', '빛나는 윤기와 영양 공급', 19000, 'https://placehold.co/400x400?text=Shine+Mist'),
(@styling_id, '매트 피니쉬 젤', '세련된 무광택 고정력', 21000, 'https://placehold.co/400x400?text=Matte+Finish+Gel');

-- 3. 트리트먼트
SET @treatment_id = (SELECT id FROM categories WHERE slug = 'treatment' LIMIT 1);

-- 이미지 파일이 있는 기존 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@treatment_id, '케라틴 너리싱 트리트먼트', '곱슬, 반곱슬, 잔머리 집중 케어', 35000, '/images/products/treatment.png'),
(@treatment_id, '실크 어드밴스드 마스크', '푸석한 머릿결에 실크광 채움', 42000, '/images/products/treatment.png'),
(@treatment_id, '리페어링 헤어 밤', '극손상 모발을 위한 리페어링 솔루션', 38000, '/images/products/treatment.png'),
(@treatment_id, '데일리 수분 케어 트리트먼트', '매일 가볍게 사용하는 데일리 케어', 29000, '/images/products/treatment.png');

-- 추가 요청 테스트 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(@treatment_id, '실크 어드밴스드 마스크(Ver.2)', '집중 수분 보습 마스크', 42000, 'https://placehold.co/400x400?text=Silk+Advanced+Mask'),
(@treatment_id, '리페어링 헤어 밤(Ver.2)', '손상 모발 긴급 처방', 38000, 'https://placehold.co/400x400?text=Repairing+Hair+Balm'),
(@treatment_id, '케라틴 너리싱 세럼', '끊어지는 모발에 단백질 충전', 35000, 'https://placehold.co/400x400?text=Keratin+Nourishing+Serum'),
(@treatment_id, '스무딩 오일 트리트먼트', '차분하고 윤기나는 머릿결', 29000, 'https://placehold.co/400x400?text=Smoothing+Oil');

-- 4. 웨이브펌
SET @wave_perm_id = (SELECT id FROM categories WHERE slug = 'wave-perm' LIMIT 1);

-- 이미지 파일이 있는 기존 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES
(@wave_perm_id, '웨이브 디파인 펌 키트', '집에서도 간편하게 즐기는 프리미엄 펌 키트', 55000, '/images/products/wave-perm.png'),
(@wave_perm_id, '중화 케어 솔루션', '펌 이후 모발 손상을 최소화하는 중화제', 15000, '/images/products/wave-perm.png'),
(@wave_perm_id, '펌 라스틱 세럼', '웨이브 고정력을 높여주는 전문 세럼', 34000, '/images/products/wave-perm.png'),
(@wave_perm_id, '엘라스틱 웨이브 크림', '탄력 있는 웨이브 컬을 위한 마무리 크림', 28000, '/images/products/wave-perm.png');

-- 추가 요청 테스트 상품 4종
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(@wave_perm_id, '엘라스틱 웨이브 크림(Ver.2)', '탱글탱글한 컬 유지력', 28000, 'https://placehold.co/400x400?text=Elastic+Wave+Cream'),
(@wave_perm_id, '워터 풀 라스틱 세럼', '촉촉한 웨이브 완성', 34000, 'https://placehold.co/400x400?text=Water+Full+Serum'),
(@wave_perm_id, '중화 케어 솔루션(Ver.2)', '펌 후 알칼리 제거 전문 케어', 15000, 'https://placehold.co/400x400?text=Neutralizing+Care'),
(@wave_perm_id, '웨이브 디파인 밤', '컬의 흐름을 살려주는 영양 밤', 31000, 'https://placehold.co/400x400?text=Wave+Define+Balm');

-- 상세 정보 자동 생성
INSERT INTO product_details (product_id, full_description, usage_guide, ingredients, main_features)
SELECT id, CONCAT(name, ' 상세 설명입니다.'), '적당량을 덜어 모발에 고루 바릅니다.', '정제수, 글리세린, 등 추출물', '내추럴 케어, 저자극 솔루션' 
FROM products;
