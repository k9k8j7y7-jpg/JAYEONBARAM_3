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

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? null;

if (!$token) {
    echo json_encode(["success" => false, "message" => "토큰이 필요합니다."]);
    exit();
}

$decoded = JWTHelper::decode($token);

if ($decoded) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $decoded['id'],
            "username" => $decoded['username'],
            "name" => $decoded['name'],
            "email" => $decoded['email']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "유효하지 않거나 만료된 토큰입니다."]);
}
?>
