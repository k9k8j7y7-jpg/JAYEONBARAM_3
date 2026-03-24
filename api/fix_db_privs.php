<?php
/**
 * DB 접속 권한 긴급 복구 스크립트
 */
$config = [
    'user' => 'root',
    'pass' => 'Xi!R:yFGC4N6',
    'db'   => 'jayeonbaram'
];

try {
    $pdo = new PDO("mysql:host=localhost", $config['user'], $config['pass']);
    
    // bitnami 계정 권한 재설정 (127.0.0.1 및 localhost 모두)
    $queries = [
        "GRANT ALL PRIVILEGES ON jayeonbaram.* TO 'bitnami'@'127.0.0.1' IDENTIFIED BY 'Xi!R:yFGC4N6'",
        "GRANT ALL PRIVILEGES ON jayeonbaram.* TO 'bitnami'@'localhost' IDENTIFIED BY 'Xi!R:yFGC4N6'",
        "FLUSH PRIVILEGES"
    ];

    foreach ($queries as $q) {
        $pdo->exec($q);
        echo "Executed: $q\n";
    }
    
    echo "\n[SUCCESS] Privileges updated successfully.";
} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage();
}
?>
