<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'jwt_helper.php';

$config = require_once 'db_config.php';
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "아이디와 비밀번호를 입력해주세요."]);
    exit();
}

$username = $data['username'];
$password = $data['password'];
$remember = isset($data['remember']) && $data['remember'] === true;

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("SELECT id, username, password, name, email FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Expiration: 24h or 30 days
        $exp = time() + ($remember ? (30 * 24 * 60 * 60) : (24 * 60 * 60));
        
        $payload = [
            "id" => $user['id'],
            "username" => $user['username'],
            "name" => $user['name'],
            "email" => $user['email'],
            "exp" => $exp
        ];
        
        $token = JWTHelper::encode($payload);
        
        unset($user['password']);
        echo json_encode([
            "success" => true,
            "token" => $token,
            "user" => $user
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "아이디 또는 비밀번호가 일치하지 않습니다."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "로그인 처리 중 오류가 발생했습니다: " . $e->getMessage()]);
}
?>
