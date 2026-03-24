USE jayeonbaram;

-- Clear any dummy data if needed, or just insert
-- Categories: 1:SHOP, 2:클렌징, 3:스타일링, 4:트리트먼트, 5:웨이브펌

-- 클렌징 (ID: 2)
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(2, '프레쉬 데일리 샴푸', '매일매일 상쾌한 두피 관리', 24000, 'https://placehold.co/400x400?text=Fresh+Daily+Shampoo'),
(2, '스칼프 케어 샴푸', '두피 진정 및 딥 클렌징', 28000, 'https://placehold.co/400x400?text=Scalp+Care+Shampoo'),
(2, '퓨어 클렌징 린스', '부드러운 머릿결을 위한 선택', 22000, 'https://placehold.co/400x400?text=Pure+Cleansing+Rinse'),
(2, '오가닉 허브 샴푸', '민감한 두피를 위한 약산성 솔루션', 32000, 'https://placehold.co/400x400?text=Organic+Herb+Shampoo');

-- 스타일링 (ID: 3)
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(3, '소프트 홀드 왁스', '내추럴한 스타일링의 완성', 18000, 'https://placehold.co/400x400?text=Soft+Hold+Wax'),
(3, '볼륨 파우더 스프레이', '뿌리부터 살아나는 볼륨감', 25000, 'https://placehold.co/400x400?text=Volume+Powder+Spray'),
(3, '샤인 미스트', '빛나는 윤기와 영양 공급', 19000, 'https://placehold.co/400x400?text=Shine+Mist'),
(3, '매트 피니쉬 젤', '세련된 무광택 고정력', 21000, 'https://placehold.co/400x400?text=Matte+Finish+Gel');

-- 트리트먼트 (ID: 4)
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(4, '실크 어드밴스드 마스크', '집중 수분 보습 마스크', 42000, 'https://placehold.co/400x400?text=Silk+Advanced+Mask'),
(4, '리페어링 헤어 밤', '손상 모발 긴급 처방', 38000, 'https://placehold.co/400x400?text=Repairing+Hair+Balm'),
(4, '케라틴 너리싱 세럼', '끊어지는 모발에 단백질 충전', 35000, 'https://placehold.co/400x400?text=Keratin+Nourishing+Serum'),
(4, '스무딩 오일 트리트먼트', '차분하고 윤기나는 머릿결', 29000, 'https://placehold.co/400x400?text=Smoothing+Oil');

-- 웨이브펌 (ID: 5)
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(5, '엘라스틱 웨이브 크림', '탱글탱글한 컬 유지력', 28000, 'https://placehold.co/400x400?text=Elastic+Wave+Cream'),
(5, '워터 풀 라스틱 세럼', '촉촉한 웨이브 완성', 34000, 'https://placehold.co/400x400?text=Water+Full+Serum'),
(5, '중화 케어 솔루션', '펌 후 알칼리 제거 전문 케어', 15000, 'https://placehold.co/400x400?text=Neutralizing+Care'),
(5, '웨이브 디파인 밤', '컬의 흐름을 살려주는 영양 밤', 31000, 'https://placehold.co/400x400?text=Wave+Define+Balm');

-- Fill product_details as well (optional but good for testing)
INSERT INTO product_details (product_id, full_description, usage_guide, ingredients, main_features)
SELECT id, CONCAT(name, ' 상세 설명입니다.'), '적당량을 덜어 모발에 고루 바릅니다.', '정제수, 글리세린, 등등', '내추럴 케어, 저자극' FROM products WHERE id > 10;
