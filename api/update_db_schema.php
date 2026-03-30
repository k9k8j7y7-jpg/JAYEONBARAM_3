<?php
$config = require_once 'db_config.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // 1. users 테이블 컬럼 추가 및 속성 변경
    $sql = "ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'local',
            ADD COLUMN IF NOT EXISTS provider_id VARCHAR(100) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) DEFAULT NULL,
            MODIFY COLUMN password VARCHAR(255) DEFAULT NULL";
    
    $pdo->exec($sql);
    echo "SUCCESS: Users table updated successfully.\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
