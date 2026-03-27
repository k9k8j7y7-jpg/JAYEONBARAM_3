<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$config = require_once 'db_config.php';
$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$new_password = $data['newPassword'] ?? '';

if (!$username || !$email || !$new_password) {
    echo json_encode(["success" => false, "message" => "필요한 정보가 누락되었습니다."]);
    exit();
}

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 최종 검증 후 업데이트
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ? AND email = ? AND provider = 'local'");
    $stmt->execute([$hashed_password, $username, $email]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "비밀번호가 성공적으로 변경되었습니다."]);
    } else {
        echo json_encode(["success" => false, "message" => "비밀번호 변경에 실패했습니다. 정보를 다시 확인해주세요."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "업데이트 중 오류가 발생했습니다: " . $e->getMessage()]);
}
?>
