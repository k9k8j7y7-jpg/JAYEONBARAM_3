<?php
/**
 * 단체/대량구매 문의 저장 API
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

    // POST 데이터 가져오기
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('Invalid request data');
    }

    // 필수 필드 검증
    $required = ['product_ids', 'quantity', 'author', 'email', 'phone', 'title', 'content'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // 데이터 준비
    $product_ids = is_array($input['product_ids']) ? json_encode($input['product_ids']) : $input['product_ids'];
    
    $sql = "INSERT INTO bulk_purchase_inquiry (product_ids, quantity, author, email, phone, title, content)
            VALUES (:product_ids, :quantity, :author, :email, :phone, :title, :content)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':product_ids' => $product_ids,
        ':quantity'    => (int) $input['quantity'],
        ':author'      => $input['author'],
        ':email'       => $input['email'],
        ':phone'       => $input['phone'],
        ':title'       => $input['title'],
        ':content'     => $input['content']
    ]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
