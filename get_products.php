<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$db   = 'jayeonbaram';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     echo json_encode(['error' => 'DB Connection Failed']);
     exit;
}

$category_slug = isset($_GET['category']) ? $_GET['category'] : '';

if (!$category_slug) {
    echo json_encode(['error' => 'Category slug is required']);
    exit;
}

// 1. 카테고리 ID 및 하위 카테고리 ID들 가져오기
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
$stmt = $pdo->prepare("SELECT * FROM products WHERE category_id IN ($in_query) ORDER BY created_at DESC");
$stmt->execute($category_ids);
$products = $stmt->fetchAll();

echo json_encode($products);
