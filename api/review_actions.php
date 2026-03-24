<?php
$config = require 'db_config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $pdo->exec("SET NAMES utf8");

    $action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : null);

    if (!$action) {
        echo json_encode(['success' => false, 'message' => 'No action specified']);
        exit;
    }

    // A. 후기 리스트 호출
    if ($action === 'get_reviews') {
        $category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
        $search_query = isset($_GET['search_query']) ? $_GET['search_query'] : '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;

        $where = ["1=1"];
        $params = [];

        if ($category_id > 0) {
            $where[] = "p.category_id = ?";
            $params[] = $category_id;
        }
        if ($search_query) {
            $where[] = "(r.title LIKE ? OR r.author_name LIKE ?)";
            $params[] = "%$search_query%";
            $params[] = "%$search_query%";
        }

        $where_sql = implode(" AND ", $where);
        
        $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM product_reviews r LEFT JOIN products p ON r.product_id = p.id WHERE $where_sql");
        $count_stmt->execute($params);
        $total_items = $count_stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT r.*, p.name as product_name, p.image_url as product_image 
            FROM product_reviews r 
            LEFT JOIN products p ON r.product_id = p.id 
            WHERE $where_sql 
            ORDER BY r.is_best DESC, r.created_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        $p_idx = 1;
        foreach($params as $p) $stmt->bindValue($p_idx++, $p);
        $stmt->bindValue($p_idx++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($p_idx++, $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'data' => $stmt->fetchAll(),
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total_items / $limit),
                'total_items' => $total_items
            ]
        ]);
    }

    // B. 후기 상세 조회
    elseif ($action === 'view_review' && isset($_GET['id'])) {
        $review_id = (int)$_GET['id'];
        $pdo->prepare("UPDATE product_reviews SET hit_count = hit_count + 1 WHERE id = ?")->execute([$review_id]);

        $stmt = $pdo->prepare("
            SELECT r.*, p.name AS product_name, p.image_url AS product_image, p.price as product_price
            FROM product_reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.id = ?
        ");
        $stmt->execute([$review_id]);
        $review = $stmt->fetch();

        if ($review) {
            $prev = $pdo->prepare("SELECT id, title FROM product_reviews WHERE id < ? ORDER BY id DESC LIMIT 1");
            $prev->execute([$review_id]);
            $next = $pdo->prepare("SELECT id, title FROM product_reviews WHERE id > ? ORDER BY id ASC LIMIT 1");
            $next->execute([$review_id]);

            echo json_encode([
                'success' => true,
                'data' => [
                    'post' => $review,
                    'navigation' => [
                        'prev' => $prev->fetch() ?: null,
                        'next' => $next->fetch() ?: null
                    ]
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Review not found']);
        }
    }

    // C. 후기 등록
    elseif ($action === 'add_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $product_id = (int)$_POST['product_id'];
        $rating = (int)$_POST['rating'];
        $title = $_POST['title'];
        $content = $_POST['content'];
        $author_name = $_POST['author_name'];
        
        // 이미지 업로드 로직 (간소화)
        $thumbnail_url = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../uploads/products/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0775, true);
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = uniqid('rev_') . '.' . $ext;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $filename)) {
                $thumbnail_url = '/uploads/products/' . $filename;
            }
        }

        $stmt = $pdo->prepare("INSERT INTO product_reviews (product_id, title, content, author_name, rating, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$product_id, $title, $content, $author_name, $rating, $thumbnail_url]);

        echo json_encode(['success' => true, 'message' => 'Review registered successfully']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
