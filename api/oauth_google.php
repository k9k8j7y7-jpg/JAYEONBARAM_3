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

// 1. Google Token API 호출
$token_url = "https://oauth2.googleapis.com/token";
$post_fields = [
    'code' => $code,
    'client_id' => $oauth_config['google']['client_id'],
    'client_secret' => $oauth_config['google']['client_secret'],
    'redirect_uri' => $oauth_config['google']['redirect_uri'],
    'grant_type' => 'authorization_code'
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
    echo json_encode(["success" => false, "message" => "구글 토큰 발급에 실패했습니다.", "details" => $token_data]);
    exit();
}

// 2. Google User Info 호출
$user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $user_info_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $access_token"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$user_info_response = curl_exec($ch);
curl_close($ch);

$user_info = json_decode($user_info_response, true);
$google_id = $user_info['id'];
$email = $user_info['email'];
$name = $user_info['name'];
$picture = $user_info['picture'];

// 3. DB 조회 및 가입/로그인 처리
try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['db']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['user'], $db_config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 이미 가입된 소셜 계정인지 확인
    $stmt = $pdo->prepare("SELECT id, username, name, email FROM users WHERE provider = 'google' AND provider_id = ?");
    $stmt->execute([$google_id]);
    $user = $stmt->fetch();

    if (!$user) {
        // 회원가입 처리 (소셜 로그인은 비밀번호 NULL)
        // username은 중복 방지를 위해 google_ + id 조합
        $username = "google_" . $google_id;
        $stmt = $pdo->prepare("INSERT INTO users (username, name, email, provider, provider_id, profile_image) VALUES (?, ?, ?, 'google', ?, ?)");
        $stmt->execute([$username, $name, $email, $google_id, $picture]);
        
        $userId = $pdo->lastInsertId();
        $user = ["id" => $userId, "username" => $username, "name" => $name, "email" => $email];
    }

    // JWT 발급 (기본 24시간)
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
    echo json_encode(["success" => false, "message" => "구글 로그인 처리 중 오류가 발생했습니다: " . $e->getMessage()]);
}
?>
