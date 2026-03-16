<?php
$host = 'localhost';
$db   = 'jayeonbaram';
$user = 'root';
$pass = 'Xi!R:yFGC4N6';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     die("DB Connection Failed");
}

// 카테고리 목록 가져오기
$categories = $pdo->query("SELECT * FROM categories")->fetchAll();

$message = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category_id = $_POST['category_id'];
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $image_url = $_POST['image_url'];

    $stmt = $pdo->prepare("INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$category_id, $name, $description, $price, $image_url])) {
        $message = "상품이 성공적으로 등록되었습니다!";
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>JAYEONBARAM - 상품 관리</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f4f7f6; display: flex; justify-content: center; padding: 50px; }
        .container { background: white; padding: 40px; border-radius: 20px; shadow: 0 10px 30px rgba(0,0,0,0.1); width: 500px; }
        h1 { color: #0A3D2E; font-size: 24px; margin-bottom: 30px; text-align: center; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        input, select, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
        button { width: 100%; padding: 15px; background: #0A3D2E; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        button:hover { background: #082d22; }
        .message { padding: 15px; background: #e8f5e9; color: #2e7d32; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>상품 등록 관리자</h1>
        <?php if ($message): ?>
            <div class="message"><?php echo $message; ?></div>
        <?php endif; ?>
        <form method="POST">
            <div class="form-group">
                <label>카테고리</label>
                <select name="category_id" required>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?php echo $cat['id']; ?>"><?php echo $cat['name']; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label>상품명</label>
                <input type="text" name="name" required placeholder="상품명을 입력하세요">
            </div>
            <div class="form-group">
                <label>간략 설명</label>
                <textarea name="description" rows="3" required placeholder="상품 설명을 입력하세요"></textarea>
            </div>
            <div class="form-group">
                <label>가격 (₩)</label>
                <input type="number" name="price" required placeholder="숫자만 입력">
            </div>
            <div class="form-group">
                <label>이미지 URL</label>
                <input type="text" name="image_url" required value="/images/products/treatment.png">
            </div>
            <button type="submit">상품 등록하기</button>
        </form>
        <div style="margin-top: 20px; text-align: center;">
            <a href="http://52.78.157.86/api/get_products.php?category=shop" target="_blank" style="color: #666; font-size: 13px;">등록된 데이터 확인 (JSON)</a>
        </div>
    </div>
</body>
</html>
