<?php
/**
 * jayeonbaram v6.0 기반 상품 목록 API
 * 카테고리 슬러그를 받아 하위 카테고리 상품까지 모두 반환합니다.
 */
$config = require 'db_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // 서버 환경(127.0.0.1)에 맞는 DSN 설정
    $dsn = "mysql:host=127.0.0.1;dbname={$config['db']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $pdo->exec("SET NAMES utf8mb4");

    $category_slug = isset($_GET['category']) ? $_GET['category'] : 'all';

    if ($category_slug === 'all') {
        // 전체 상품 조회
        $sql = "SELECT p.*, c.slug as category_slug 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.id DESC";
        $stmt = $pdo->query($sql);
        $products = $stmt->fetchAll();
    } else {
        // 1. 카테고리 ID 및 하위 카테고리 ID들 가져오기 (v6.0 로직)
        $stmt = $pdo->prepare("
            SELECT id FROM categories 
            WHERE slug = ? 
            OR parent_id = (SELECT id FROM categories WHERE slug = ?)
        ");
        $stmt->execute([$category_slug, $category_slug]);
        $category_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($category_ids)) {
            echo json_encode([]);
            exit;
        }

        // 2. 해당 카테고리들에 속한 상품 가져오기
        $in_query = implode(',', array_fill(0, count($category_ids), '?'));
        $sql = "SELECT p.*, c.slug as category_slug 
                FROM products p 
                INNER JOIN categories c ON p.category_id = c.id 
                WHERE p.category_id IN ($in_query) 
                ORDER BY p.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($category_ids);
        $products = $stmt->fetchAll();
    }

    echo json_encode($products);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'debug' => ['user' => $config['user']]
    ]);
}
?>
