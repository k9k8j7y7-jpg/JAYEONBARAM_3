<?php
/**
 * jayeonbaram 상품 상세 API
 * 상품 ID를 받아 상세 정보 + 이미지 목록을 반환합니다.
 */
$config = require 'db_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $dsn = "mysql:host=127.0.0.1;dbname={$config['db']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $pdo->exec("SET NAMES utf8mb4");

    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid Product ID is required']);
        exit;
    }

    // 1. 제품 기본 정보 및 상세 정보 JOIN 하여 가져오기
    $stmt = $pdo->prepare("
        SELECT p.*, d.full_description, d.usage_guide, d.ingredients, d.main_features, d.detail_image_url, d.usage_image_url
        FROM products p
        LEFT JOIN product_details d ON p.id = d.product_id
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    // 2. 해당 제품의 이미지 목록 가져오기
    $stmt = $pdo->prepare("SELECT image_path, is_main FROM product_images WHERE product_id = ? ORDER BY is_main DESC, id ASC");
    $stmt->execute([$id]);
    $images = $stmt->fetchAll();

    $product['images'] = $images;

    echo json_encode($product);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
