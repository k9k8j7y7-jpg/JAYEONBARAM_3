<?php
$config = require '/opt/bitnami/apache2/htdocs/api/db_config.php';
$dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
try {
    $pdo = new PDO($dsn, $config['user'], $config['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = file_get_contents('/tmp/merge_products.sql');
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($queries as $query) {
        if (!empty($query)) {
            $pdo->exec($query);
        }
    }
    
    echo "SQL Applied Successfully (Both existing and test products merged)\n";
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
