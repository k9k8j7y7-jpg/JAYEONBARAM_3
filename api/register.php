<?php
header('Content-Type: application/json; charset=utf-8');

$config = require_once 'db_config.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // POST 데이터 가져오기 (JSON)
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => '잘못된 요청 데이터입니다.']);
        exit;
    }

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';
    $zipcode = $data['zipcode'] ?? '';
    $address = $data['address'] ?? '';
    $detail_address = $data['detailAddress'] ?? '';
    $phone = ($data['phone1'] ?? '') . '-' . ($data['phone2'] ?? '') . '-' . ($data['phone3'] ?? '');
    $email = $data['email'] ?? '';

    // 아이디 중복 체크
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => '이미 존재하는 아이디입니다.']);
        exit;
    }

    // 비밀번호 해싱
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 저장
    $stmt = $pdo->prepare("INSERT INTO users (username, password, name, zipcode, address, detail_address, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$username, $hashed_password, $name, $zipcode, $address, $detail_address, $phone, $email]);

    echo json_encode(['success' => true, 'message' => '회원가입이 완료되었습니다.']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => '서버 오류: ' . $e->getMessage()]);
}
?>
