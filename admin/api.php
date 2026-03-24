<?php
/**
 * Admin API for E-Brochure (MySQL Version)
 */

header('Content-Type: application/json');

// Database configuration
$host = '127.0.0.1';
$db   = 'jayeonbaram';
$user = 'root';
$pass = 'Xi!R:yFGC4N6';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES    => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_products':
        try {
            $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
            $products = $stmt->fetchAll();
            
            // Convert JSON column back to array
            foreach ($products as &$p) {
                if (isset($p['translations']) && is_string($p['translations'])) {
                    $p['translations'] = json_decode($p['translations'], true);
                }
            }
            echo json_encode(['products' => $products]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'save_products':
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data && isset($data['products'])) {
            try {
                // Clear and re-insert
                $pdo->exec('DELETE FROM products');
                
                $stmt = $pdo->prepare('INSERT INTO products (id, code, image, themeColor, videoUrl, translations) VALUES (?, ?, ?, ?, ?, ?)');
                foreach ($data['products'] as $p) {
                    $stmt->execute([
                        $p['id'],
                        $p['code'],
                        $p['image'],
                        $p['themeColor'] ?? '#303030',
                        $p['videoUrl'] ?? '',
                        json_encode($p['translations'], JSON_UNESCAPED_UNICODE)
                    ]);
                }

                // Sync with JSON file
                $json_data = json_encode(['products' => $data['products']], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                if (file_put_contents('../data/products.json', $json_data) === false) {
                    $error = error_get_last();
                    throw new Exception("JSON sync failed: " . ($error['message'] ?? 'Unknown error'));
                }

                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Save failed: ' . $e->getMessage()]);
            }
        }
        break;

    case 'upload_image':
        if (isset($_FILES['image'])) {
            $file = $_FILES['image'];
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'prod_' . time() . '.' . $ext;
            $upload_dir = '../assets/uploads/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0775, true);
            $target = $upload_dir . $filename;

            if (move_uploaded_file($file['tmp_name'], $target)) {
                echo json_encode(['success' => true, 'url' => 'assets/uploads/' . $filename]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to move uploaded file']);
            }
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}
