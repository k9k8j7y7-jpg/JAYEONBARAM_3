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

if (!$username || !$email) {
    echo json_encode(["success" => false, "message" => "아이디와 이메일을 모두 입력해주세요."]);
    exit();
}

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND email = ? AND provider = 'local'");
    $stmt->execute([$username, $email]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode(["success" => true, "message" => "본인 확인이 완료되었습니다."]);
    } else {
        echo json_encode(["success" => false, "message" => "일치하는 회원 정보가 없거나 소셜 로그인 계정입니다."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "조회 중 오류가 발생했습니다: " . $e->getMessage()]);
}
?>
