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
$oauth_config = require_once 'oauth_config.php';
$db_config = require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);
$code = $data['code'] ?? null;

if (!$code) {
    echo json_encode(["success" => false, "message" => "인가 코드가 없습니다."]);
    exit();
}

// 1. Kakao Token API 호출
$token_url = "https://kauth.kakao.com/oauth/token";
$post_fields = [
    'grant_type' => 'authorization_code',
    'client_id' => $oauth_config['kakao']['client_id'],
    'client_secret' => $oauth_config['kakao']['client_secret'],
    'redirect_uri' => $oauth_config['kakao']['redirect_uri'],
    'code' => $code
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_fields));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$token_data = json_decode($response, true);
$access_token = $token_data['access_token'] ?? null;

if (!$access_token) {
    echo json_encode(["success" => false, "message" => "카카오 토큰 발급에 실패했습니다.", "details" => $token_data]);
    exit();
}

// 2. Kakao User Info 호출
$user_info_url = "https://kapi.kakao.com/v2/user/me";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $user_info_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$user_info_response = curl_exec($ch);
curl_close($ch);

$user_info = json_decode($user_info_response, true);
$kakao_id = $user_info['id'];
$kakao_account = $user_info['kakao_account'] ?? [];
$properties = $user_info['properties'] ?? [];

$email = $kakao_account['email'] ?? null;
$name = $properties['nickname'] ?? "카카오사용자";
$picture = $properties['profile_image'] ?? null;

// 3. DB 조회 및 가입/로그인 처리
try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['db']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['user'], $db_config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare("SELECT id, username, name, email FROM users WHERE provider = 'kakao' AND provider_id = ?");
    $stmt->execute([$kakao_id]);
    $user = $stmt->fetch();

    if (!$user) {
        $username = "kakao_" . $kakao_id;
        $stmt = $pdo->prepare("INSERT INTO users (username, name, email, provider, provider_id, profile_image) VALUES (?, ?, ?, 'kakao', ?, ?)");
        $stmt->execute([$username, $name, $email, $kakao_id, $picture]);
        
        $userId = $pdo->lastInsertId();
        $user = ["id" => $userId, "username" => $username, "name" => $name, "email" => $email];
    }

    $exp = time() + (24 * 60 * 60);
    $payload = [
        "id" => $user['id'],
        "username" => $user['username'],
        "name" => $user['name'],
        "email" => $user['email'],
        "exp" => $exp
    ];
    $token = JWTHelper::encode($payload);

    echo json_encode([
        "success" => true,
        "token" => $token,
        "user" => $user
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "카카오 로그인 처리 중 오류가 발생했습니다: " . $e->getMessage()]);
}
?>
