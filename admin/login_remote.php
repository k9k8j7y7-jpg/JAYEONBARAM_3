<?php
session_start();
if (isset($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // jayeonbaram DB 설정 직접 사용
    $host = 'localhost';
    $db   = 'jayeonbaram';
    $user = 'root';
    $pass = 'Xi!R:yFGC4N6';
    $charset = 'utf8mb4';

    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        // 관리자 로그인 체크
        if ($username === 'admin' && $password === 'jayeon1234!') {
            $_SESSION['admin_logged_in'] = true;
            header('Location: index.php');
            exit;
        } else {
            $error = '아이디 또는 비밀번호가 틀렸습니다.';
        }
    } catch (PDOException $e) {
        $error = '로그인 서버 오류: ' . $e.getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Admin Login</title>
    <style>
        body { background: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
        .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 350px; }
        h2 { color: #0A3D2E; text-align: center; margin-bottom: 30px; }
        input { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
        button { width: 100%; padding: 15px; background: #0A3D2E; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .error { color: #ef4444; font-size: 14px; margin-bottom: 15px; text-align: center; }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>Admin Login</h2>
        <?php if (isset($error)): ?><div class="error"><?php echo $error; ?></div><?php endif; ?>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">로그인</button>
        </form>
    </div>
</body>
</html>
