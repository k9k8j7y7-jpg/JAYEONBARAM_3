<?php
session_start();

// 간단한 ID/PW 설정 (개발 단계용)
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'jayeon1234!'); 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';

    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: ../admin_products.php');
        exit;
    } else {
        $error = "아이디 또는 비밀번호가 올바르지 않습니다.";
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>관리자 로그인 - 자연바람</title>
    <style>
        body { background: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
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
