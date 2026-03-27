<?php
header("Content-Type: application/json; charset=UTF-8");
$config = require_once 'db_config.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $username = 'admin';
    $password = 'admin1234!';
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $name = '관리자';
    $email = 'admin@jayeonbaram.com';

    $stmt = $pdo->prepare("INSERT INTO users (username, password, name, email, provider) VALUES (?, ?, ?, ?, 'local')");
    $stmt->execute([$username, $hashed_password, $name, $email]);

    echo json_encode(["success" => true, "message" => "admin 계정이 생성되었습니다."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
