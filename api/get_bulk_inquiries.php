<?php
/**
 * 단체/대량구매 문의 목록 조회 API
 */
header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/db_config.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec("SET NAMES utf8mb4");

    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = 20;
    $offset = ($page - 1) * $perPage;

    // 전체 개수 조회
    $total = (int)$pdo->query("SELECT COUNT(*) FROM bulk_purchase_inquiry")->fetchColumn();
    $totalPages = ceil($total / $perPage);

    // 목록 조회
    $stmt = $pdo->prepare("SELECT * FROM bulk_purchase_inquiry ORDER BY created_at DESC LIMIT :lim OFFSET :off");
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $data = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $data,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_items' => $total
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
