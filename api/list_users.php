<?php
header("Content-Type: application/json; charset=UTF-8");
$config = require_once 'db_config.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("SELECT id, username, email, provider, created_at FROM users");
    $stmt->execute();
    $users = $stmt->fetchAll();

    echo json_encode(["success" => true, "users" => $users]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
