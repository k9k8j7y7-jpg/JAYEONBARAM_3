<?php
session_start();

function in_all($needle, $haystack) {
    return $needle && in_array($needle, $haystack);
}

// 프론트엔드 공개 API 액션 목록
$public_actions = ['get_reviews', 'view_review', 'add_review', 'get_products', 'get_qna_list', 'check_qna_auth', 'save_qna', 'view_qna'];
$current_action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : null);

if (!isset($_SESSION['admin_logged_in']) && !in_all($current_action, $public_actions)) {
    header('Location: admin/login.php');
    exit;
}

$config = require 'api/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}

// 이미지 업로드 공통 함수
function uploadImage($file_key) {
    if (!isset($_FILES[$file_key]) || $_FILES[$file_key]['error'] !== UPLOAD_ERR_OK) return null;
    $upload_dir = 'uploads/products/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0775, true);
    
    $ext = pathinfo($_FILES[$file_key]['name'], PATHINFO_EXTENSION);
    $filename = uniqid('prod_') . '.' . $ext;
    $target_path = $upload_dir . $filename;
    
    if (move_uploaded_file($_FILES[$file_key]['tmp_name'], $target_path)) {
        return '/' . $target_path;
    }
    return null;
}

// 1. 상품 삭제 처리
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delete_id = (int)$_GET['id'];
    try {
        $pdo->beginTransaction();
        // 상세 데이터 삭제
        $pdo->prepare("DELETE FROM product_details WHERE product_id = ?")->execute([$delete_id]);
        // 메인 데이터 삭제
        $pdo->prepare("DELETE FROM products WHERE id = ?")->execute([$delete_id]);
        $pdo->commit();
        echo "<script>alert('상품이 삭제되었습니다.'); location.href='admin_products.php?tab=manage-product';</script>";
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "<script>alert('삭제 실패: " . $e->getMessage() . "');</script>";
    }
}

// 2. 상품 등록/수정 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $category_id = (int)$_POST['category_id'];
    $name = $_POST['name'];
    $price = (int)$_POST['price'];
    $description = $_POST['description'];
    $full_description = $_POST['full_description'];
    $usage_guide = $_POST['usage_guide'];
    $ingredients = $_POST['ingredients'];
    $main_features = $_POST['main_features'];

    if ($_POST['action'] === 'add_product') {
        $image_url = uploadImage('image_url');
        $detail_image_url = uploadImage('detail_image_url');
        $usage_image_url = uploadImage('usage_image_url');

        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$category_id, $name, $description, $price, $image_url]);
            $product_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("INSERT INTO product_details (product_id, full_description, usage_guide, ingredients, main_features, detail_image_url, usage_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$product_id, $full_description, $usage_guide, $ingredients, $main_features, $detail_image_url, $usage_image_url]);
            $pdo->commit();
            echo "<script>alert('성공적으로 등록되었습니다!'); location.href='admin_products.php?tab=manage-product';</script>";
        } catch (Exception $e) { $pdo->rollBack(); echo "<script>alert('등록 실패: " . $e->getMessage() . "');</script>"; }
    } 
    elseif ($_POST['action'] === 'edit_product') {
        $product_id = (int)$_POST['product_id'];
        
        // 새 이미지가 들어오면 업데이트, 아니면 기존 유지
        $image_url = uploadImage('image_url') ?: $_POST['old_image_url'];
        $detail_image_url = uploadImage('detail_image_url') ?: $_POST['old_detail_image_url'];
        $usage_image_url = uploadImage('usage_image_url') ?: $_POST['old_usage_image_url'];

        try {
            $pdo->beginTransaction();
            $pdo->prepare("UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ? WHERE id = ?")
                ->execute([$category_id, $name, $description, $price, $image_url, $product_id]);
            
            // 상세 정보 존재 여부 체크 후 UPDATE 또는 INSERT
            $chk = $pdo->prepare("SELECT id FROM product_details WHERE product_id = ?");
            $chk->execute([$product_id]);
            if ($chk->fetch()) {
                $pdo->prepare("UPDATE product_details SET full_description = ?, usage_guide = ?, ingredients = ?, main_features = ?, detail_image_url = ?, usage_image_url = ? WHERE product_id = ?")
                    ->execute([$full_description, $usage_guide, $ingredients, $main_features, $detail_image_url, $usage_image_url, $product_id]);
            } else {
                $pdo->prepare("INSERT INTO product_details (product_id, full_description, usage_guide, ingredients, main_features, detail_image_url, usage_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
                    ->execute([$product_id, $full_description, $usage_guide, $ingredients, $main_features, $detail_image_url, $usage_image_url]);
            }
            $pdo->commit();
            echo "<script>alert('정보가 수정되었습니다!'); location.href='admin_products.php?tab=manage-product';</script>";
        } catch (Exception $e) { $pdo->rollBack(); echo "<script>alert('수정 실패: " . $e->getMessage() . "');</script>"; }
    }
}

// 3. 공지사항 등록/수정/삭제 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['notice_action'])) {
    if ($_POST['notice_action'] === 'add_notice') {
        $notice_id = !empty($_POST['notice_id']) ? (int)$_POST['notice_id'] : null;
        $category = $_POST['category'];
        $title = $_POST['title'];
        $author = $_POST['author'];
        $content = $_POST['content'];

        try {
            if ($notice_id) {
                // 수정 로직
                $pdo->prepare("UPDATE boards SET category = ?, title = ?, author = ?, content = ? WHERE id = ?")
                    ->execute([$category, $title, $author, $content, $notice_id]);
                $msg = "공지사항이 수정되었습니다.";
            } else {
                // 등록 로직
                $pdo->prepare("INSERT INTO boards (category, title, author, content) VALUES (?, ?, ?, ?)")
                    ->execute([$category, $title, $author, $content]);
                $msg = "공지사항이 등록되었습니다.";
            }
            echo "<script>alert('$msg'); location.href='admin_products.php?tab=manage-notice';</script>";
        } catch (Exception $e) { echo "<script>alert('처리 실패: " . $e->getMessage() . "');</script>"; }
    }
}

if (isset($_GET['action']) && $_GET['action'] === 'delete_notice' && isset($_GET['id'])) {
    $delete_id = (int)$_GET['id'];
    try {
        $pdo->prepare("DELETE FROM boards WHERE id = ?")->execute([$delete_id]);
        echo "<script>alert('공지사항이 삭제되었습니다.'); location.href='admin_products.php?tab=manage-notice';</script>";
    } catch (Exception $e) { echo "<script>alert('삭제 실패: " . $e->getMessage() . "');</script>"; }
}

if (isset($_GET['action']) && $_GET['action'] === 'delete_bulk' && isset($_GET['id'])) {
    $delete_id = (int)$_GET['id'];
    try {
        $pdo->prepare("DELETE FROM bulk_purchase_inquiry WHERE id = ?")->execute([$delete_id]);
        echo "<script>alert('대량구매 문의가 삭제되었습니다.'); location.href='admin_products.php?tab=manage-bulk';</script>";
    } catch (Exception $e) { echo "<script>alert('삭제 실패: " . $e->getMessage() . "');</script>"; }
}

// 4. 후기 관리 API (JSON)
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    // A. 후기 리스트 호출 (action=get_reviews)
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
        
        // 전체 카운트
        $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM product_reviews r LEFT JOIN products p ON r.product_id = p.id WHERE $where_sql");
        $count_stmt->execute($params);
        $total_items = $count_stmt->fetchColumn();

        // 리스트 (베스트 우선)
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
        $list = $stmt->fetchAll();

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'data' => $list,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total_items / $limit),
                'total_items' => $total_items
            ]
        ]);
        exit;
    }

    // B. 후기 상세 조회 (action=view_review)
    if ($action === 'view_review' && isset($_GET['id'])) {
        $review_id = (int)$_GET['id'];
        try {
            // 조회수 증가
            $pdo->prepare("UPDATE product_reviews SET hit_count = hit_count + 1 WHERE id = ?")->execute([$review_id]);

            // 상세 정보
            $stmt = $pdo->prepare("
                SELECT r.*, p.name AS product_name, p.image_url AS product_image, p.price as product_price
                FROM product_reviews r
                LEFT JOIN products p ON r.product_id = p.id
                WHERE r.id = ?
            ");
            $stmt->execute([$review_id]);
            $review = $stmt->fetch();

            if (!$review) {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['success' => false, 'message' => 'Review not found']);
                exit;
            }

            // 이전글/다음글
            $prev = $pdo->prepare("SELECT id, title FROM product_reviews WHERE id < ? ORDER BY id DESC LIMIT 1");
            $prev->execute([$review_id]);
            $next = $pdo->prepare("SELECT id, title FROM product_reviews WHERE id > ? ORDER BY id ASC LIMIT 1");
            $next->execute([$review_id]);

            header('Content-Type: application/json; charset=utf-8');
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
        } catch (Exception $e) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // C. 관리자 전용 상태 업데이트 (action=update_status)
    if ($action === 'update_status' && isset($_GET['id']) && isset($_GET['type'])) {
        $review_id = (int)$_GET['id'];
        $type = $_GET['type']; // 'toggle_best' or 'delete'

        try {
            if ($type === 'toggle_best') {
                $pdo->prepare("UPDATE product_reviews SET is_best = IF(is_best = 1, 0, 1) WHERE id = ?")->execute([$review_id]);
                $msg = "상태가 변경되었습니다.";
            } elseif ($type === 'delete') {
                $pdo->prepare("DELETE FROM product_reviews WHERE id = ?")->execute([$review_id]);
                $msg = "후기가 삭제되었습니다.";
            }

            if (isset($_GET['mode']) && $_GET['mode'] === 'json') {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['success' => true, 'message' => $msg]);
            } else {
                echo "<script>alert('$msg'); location.href='admin_products.php?tab=manage-review';</script>";
            }
        } catch (Exception $e) {
            if (isset($_GET['mode']) && $_GET['mode'] === 'json') {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            } else {
                echo "<script>alert('처리 실패: " . $e->getMessage() . "'); history.back();</script>";
            }
        }
        exit;
    }

    // D. 후기 등록 (action=add_review)
    if ($action === 'add_review' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $product_id = (int)$_POST['product_id'];
        $rating = (int)$_POST['rating'];
        $title = $_POST['title'];
        $content = $_POST['content'];
        $author_name = $_POST['author_name'];
        $thumbnail_url = uploadImage('image'); // 첨부 이미지

        try {
            $stmt = $pdo->prepare("INSERT INTO product_reviews (product_id, title, content, author_name, rating, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$product_id, $title, $content, $author_name, $rating, $thumbnail_url]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => true, 'message' => 'Review registered successfully']);
        } catch (Exception $e) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // E. QnA 리스트 조회
    if ($action === 'get_qna_list') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? $_GET['search'] : '';

        $where = "1=1";
        $params = [];
        if ($search) {
            $where .= " AND (title LIKE ? OR content LIKE ? OR author LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM product_qna WHERE parent_id IS NULL AND $where");
        $count_stmt->execute($params);
        $total = $count_stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, product_id, title, author, is_private, status, views, created_at 
            FROM product_qna 
            WHERE parent_id IS NULL AND $where 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        $p_idx = 1;
        foreach($params as $p) $stmt->bindValue($p_idx++, $p);
        $stmt->bindValue($p_idx++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($p_idx++, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $list = $stmt->fetchAll();

        // Fetch answers for the current page items
        $qna_ids = array_column($list, 'id');
        $answers = [];
        if (!empty($qna_ids)) {
            $in = str_repeat('?,', count($qna_ids) - 1) . '?';
            $ans_stmt = $pdo->prepare("SELECT id, parent_id, content, created_at FROM product_qna WHERE parent_id IN ($in)");
            $ans_stmt->execute($qna_ids);
            foreach ($ans_stmt->fetchAll() as $ans) {
                $answers[$ans['parent_id']][] = $ans;
            }
        }

        foreach ($list as &$item) {
            $item['answers'] = $answers[$item['id']] ?? [];
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'data' => $list,
            'pagination' => ['current_page' => $page, 'total_pages' => ceil($total / $limit), 'total_items' => $total]
        ]);
        exit;
    }

    // F. QnA 권한 체크 (비밀글)
    if ($action === 'check_qna_auth' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        $stmt = $pdo->prepare("SELECT id, password, content, phone, email, product_id FROM product_qna WHERE id = ?");
        $stmt->execute([$id]);
        $qna = $stmt->fetch();

        if ($qna && password_verify($password, $qna['password'])) {
            $ans_stmt = $pdo->prepare("SELECT content, created_at FROM product_qna WHERE parent_id = ? ORDER BY created_at ASC");
            $ans_stmt->execute([$id]);
            $qna['answers'] = $ans_stmt->fetchAll();
            unset($qna['password']);
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => true, 'data' => $qna]);
        } else {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => '비밀번호가 일치하지 않습니다.']);
        }
        exit;
    }

    // G. QnA 등록
    if ($action === 'save_qna' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $product_id = isset($_POST['product_ids']) ? $_POST['product_ids'] : '';
        $title = isset($_POST['title']) ? $_POST['title'] : '';
        $content = isset($_POST['content']) ? $_POST['content'] : '';
        $author = isset($_POST['author']) ? $_POST['author'] : '';
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $phone = isset($_POST['phone']) ? $_POST['phone'] : '';
        $is_private = isset($_POST['is_private']) && $_POST['is_private'] === 'true' ? 1 : 0;
        $password = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : '';

        try {
            $stmt = $pdo->prepare("INSERT INTO product_qna (product_id, title, content, author, email, phone, password, is_private) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$product_id, $title, $content, $author, $email, $phone, $password, $is_private]);
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => true, 'message' => '문의가 등록되었습니다.']);
        } catch (Exception $e) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        exit;
    }

    // H. QnA 공개글 상세 조회
    if ($action === 'view_qna') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $stmt = $pdo->prepare("SELECT id, content, product_id, is_private FROM product_qna WHERE id = ?");
        $stmt->execute([$id]);
        $qna = $stmt->fetch();

        if ($qna && $qna['is_private'] == 0) {
            $pdo->prepare("UPDATE product_qna SET views = views + 1 WHERE id = ?")->execute([$id]);
            $ans_stmt = $pdo->prepare("SELECT content, created_at FROM product_qna WHERE parent_id = ? ORDER BY created_at ASC");
            $ans_stmt->execute([$id]);
            $qna['answers'] = $ans_stmt->fetchAll();
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => true, 'data' => $qna]);
        } else {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'message' => '비공개 글이거나 찾을 수 없습니다.']);
        }
        exit;
    }
}

$active_tab = $_GET['tab'] ?? 'dashboard';

// 데이터 로드
$products = $pdo->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC")->fetchAll();
$categories = $pdo->query("SELECT * FROM categories ORDER BY id ASC")->fetchAll();
$notices = $pdo->query("SELECT * FROM boards ORDER BY id DESC")->fetchAll();
$reviews = $pdo->query("SELECT r.*, p.name AS product_name FROM product_reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC")->fetchAll();
$product_count = count($products);
$notice_count = count($notices);
$review_count = count($reviews);
$bulk_inquiry_count = $pdo->query("SELECT COUNT(*) FROM bulk_purchase_inquiry")->fetchColumn();
$bulk_inquiries = $pdo->query("SELECT * FROM bulk_purchase_inquiry ORDER BY created_at DESC")->fetchAll();

// 수정용 데이터 로드
$edit_data = null;
if ($active_tab === 'edit-product' && isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT p.*, pd.* FROM products p LEFT JOIN product_details pd ON p.id = pd.product_id WHERE p.id = ?");
    $stmt->execute([(int)$_GET['id']]);
    $edit_data = $stmt->fetch();
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAYEONBARAM | 관리자 모드</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { --brand-primary: #0A3D2E; --brand-secondary: #f8fafc; --sidebar-width: 260px; --success: #10b981; }
        body { margin: 0; font-family: 'Pretendard', sans-serif; background: #f1f5f9; display: flex; color: #1e293b; }
        .sidebar { width: var(--sidebar-width); height: 100vh; background: #1e293b; color: white; position: fixed; left: 0; top: 0; }
        .sidebar-header { padding: 30px; font-size: 20px; font-weight: 800; color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .menu-item { padding: 15px 30px; display: flex; align-items: center; gap: 15px; cursor: pointer; color: #94a3b8; font-weight: 500; text-decoration: none; }
        .menu-item.active { background: var(--brand-primary); color: white; border-left: 4px solid var(--success); }
        .main-content { margin-left: var(--sidebar-width); flex: 1; padding: 40px; min-height: 100vh; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { background: white; padding: 25px; border-radius: 20px; border-left: 5px solid #e2e8f0; }
        .form-card { background: white; padding: 40px; border-radius: 20px; }
        .form-group-title { font-size: 14px; font-weight: 800; color: var(--brand-primary); margin: 30px 0 20px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
        .form-control { margin-bottom: 15px; }
        .form-control label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 5px; }
        .form-control input, .form-control select, .form-control textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .btn-submit { width: 100%; padding: 15px; background: var(--brand-primary); color: white; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; }
        .card { background: white; border-radius: 20px; overflow: hidden; }
        .table-header, .product-row { display: grid; grid-template-columns: 80px 120px 1fr 120px 150px; padding: 15px 30px; border-bottom: 1px solid #f1f5f9; align-items: center; text-align: center; }
        .product-img { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; margin: 0 auto; }
        .actions { display: flex; gap: 8px; justify-content: center; }
        .btn-action { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
        .btn-edit { background: #f1f5f9; color: #475569; }
        .btn-delete { background: #fee2e2; color: #ef4444; }
    </style>
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">JAYEONBARAM</div>
        <div class="menu">
            <a href="admin_products.php?tab=dashboard" class="menu-item <?= $active_tab=='dashboard'?'active':'' ?>"><i class="fas fa-home"></i> 대시보드</a>
            <a href="admin_products.php?tab=add-product" class="menu-item <?= $active_tab=='add-product'?'active':'' ?>"><i class="fas fa-plus-circle"></i> 상품 등록</a>
            <a href="admin_products.php?tab=manage-product" class="menu-item <?= ($active_tab=='manage-product'||$active_tab=='edit-product')?'active':'' ?>"><i class="fas fa-box"></i> 상품 관리</a>
            <a href="admin_products.php?tab=manage-review" class="menu-item <?= $active_tab=='manage-review'?'active':'' ?>"><i class="fas fa-star"></i> 후기 관리</a>
            <a href="admin_products.php?tab=manage-bulk" class="menu-item <?= $active_tab=='manage-bulk'?'active':'' ?>"><i class="fas fa-handshake"></i> 대량구매 문의</a>
            <a href="admin_products.php?tab=manage-notice" class="menu-item <?= $active_tab=='manage-notice'?'active':'' ?>"><i class="fas fa-bullhorn"></i> 공지사항 관리</a>
        </div>
    </nav>

    <main class="main-content">
        <!-- 대시보드 -->
        <div class="tab-content <?= $active_tab=='dashboard'?'active':'' ?>">
            <div class="header"><h1>오늘의 현황</h1><div class="version">관리자 모드 v1.2</div></div>
            <div class="stats-grid">
                <div class="stat-card" style="border-left-color: var(--brand-primary);"><span style="font-size:12px; font-weight:700; color:#64748b;">등록 상품 수</span><div style="font-size:28px; font-weight:800;"><?= $product_count ?>개</div></div>
                <div class="stat-card" style="border-left-color: #f59e0b;"><span style="font-size:12px; font-weight:700; color:#64748b;">공지사항 수</span><div style="font-size:28px; font-weight:800;"><?= $notice_count ?>개</div></div>
                <div class="stat-card" style="border-left-color: var(--success);"><span style="font-size:12px; font-weight:700; color:#64748b;">상품 후기</span><div style="font-size:28px; font-weight:800;"><?= $review_count ?>개</div></div>
                <div class="stat-card" style="border-left-color: #3b82f6;"><span style="font-size:12px; font-weight:700; color:#64748b;">대량구매 문의</span><div style="font-size:28px; font-weight:800;"><?= $bulk_inquiry_count ?>건</div></div>
            </div>
        </div>

        <!-- 상품 등록/수정 -->
        <div class="tab-content <?= ($active_tab=='add-product' || $active_tab=='edit-product') ?'active':'' ?>">
            <div class="header"><h1><?= $edit_data ? '상품 정보 수정' : '새 상품 등록' ?></h1><div class="version">관리자 모드 v1.2</div></div>
            <form action="admin_products.php" method="POST" enctype="multipart/form-data" class="form-card">
                <input type="hidden" name="action" value="<?= $edit_data ? 'edit_product' : 'add_product' ?>">
                <?php if($edit_data): ?>
                    <input type="hidden" name="product_id" value="<?= $edit_data['id'] ?>">
                    <input type="hidden" name="old_image_url" value="<?= $edit_data['image_url'] ?>">
                    <input type="hidden" name="old_detail_image_url" value="<?= $edit_data['detail_image_url'] ?>">
                    <input type="hidden" name="old_usage_image_url" value="<?= $edit_data['usage_image_url'] ?>">
                <?php endif; ?>

                <div class="form-group-title">기본 정보</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="form-control"><label>카테고리</label><select name="category_id">
                        <?php foreach($categories as $c): ?>
                            <option value="<?= $c['id'] ?>" <?= ($edit_data && $edit_data['category_id'] == $c['id']) ? 'selected' : '' ?>><?= $c['name'] ?></option>
                        <?php endforeach; ?>
                    </select></div>
                    <div class="form-control"><label>상품명</label><input type="text" name="name" value="<?= $edit_data['name'] ?? '' ?>" required></div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="form-control"><label>가격 (₩)</label><input type="number" name="price" value="<?= $edit_data['price'] ?? '' ?>" required></div>
                    <div class="form-control"><label>대표 이미지 <?= $edit_data ? '(변경 시 선택)' : '(필수)' ?></label><input type="file" name="image_url"></div>
                </div>
                <div class="form-control"><label>짧은 설명</label><textarea name="description"><?= $edit_data['description'] ?? '' ?></textarea></div>

                <div class="form-group-title">상세 정보</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <div class="form-control"><label>상세 이미지</label><input type="file" name="detail_image_url"></div>
                    <div class="form-control"><label>사용법 이미지</label><input type="file" name="usage_image_url"></div>
                </div>
                <div class="form-control"><label>상세 설명 (Text)</label><textarea name="full_description"><?= $edit_data['full_description'] ?? '' ?></textarea></div>
                <div class="form-control"><label>사용 가이드</label><textarea name="usage_guide"><?= $edit_data['usage_guide'] ?? '' ?></textarea></div>
                <div class="form-control"><label>전성분</label><textarea name="ingredients"><?= $edit_data['ingredients'] ?? '' ?></textarea></div>
                <div class="form-control"><label>주요 특성</label><input type="text" name="main_features" value="<?= $edit_data['main_features'] ?? '' ?>"></div>

                <button type="submit" class="btn-submit"><?= $edit_data ? '정보 수정 완료' : '새 상품 등록 완료' ?></button>
                <?php if($edit_data): ?>
                    <button type="button" onclick="location.href='admin_products.php?tab=manage-product'" style="width:100%; margin-top:10px; background:#94a3b8; border:none; color:white; padding:15px; border-radius:10px; font-weight:800; cursor:pointer;">취소</button>
                <?php endif; ?>
            </form>
        </div>

        <!-- 상품 관리 -->
        <div class="tab-content <?= $active_tab=='manage-product'?'active':'' ?>">
            <div class="header"><h1>상품 목록 관리</h1><div class="version">관리자 모드 v1.2</div></div>
            <div class="card">
                <div class="table-header"><div>이미지</div><div>카테고리</div><div>상품명</div><div>가격</div><div>관리</div></div>
                <div class="product-list">
                    <?php if(empty($products)): ?><div style="padding:50px; text-align:center; color:#94a3b8;">등록된 상품이 없습니다.</div><?php endif; ?>
                    <?php foreach($products as $p): ?>
                        <div class="product-row">
                            <img src="<?= htmlspecialchars($p['image_url']) ?>" class="product-img" onerror="this.src='/https://placehold.co/100x100?text=No+Img'">
                            <div><span style="padding:4px 10px; background:#ecfdf5; color:#059669; border-radius:20px; font-size:11px; font-weight:700;"><?= $p['category_name'] ?></span></div>
                            <div style="font-weight:600; text-align:left; padding:0 10px;"><?= htmlspecialchars($p['name']) ?></div>
                            <div style="font-weight:700;">₩<?= number_format($p['price']) ?></div>
                            <div class="actions">
                                <button class="btn-action btn-edit" onclick="location.href='admin_products.php?tab=edit-product&id=<?= $p['id'] ?>'">수정</button>
                                <button class="btn-action btn-delete" onclick="if(confirm('정말 삭제하시겠습니까?')) location.href='admin_products.php?action=delete&id=<?= $p['id'] ?>'">삭제</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- 후기 관리 -->
        <div class="tab-content <?= $active_tab=='manage-review'?'active':'' ?>">
            <div class="header"><h1>상품 후기 관리</h1><div class="version">관리자 모드 v1.2</div></div>

            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <div class="stat-card" style="flex:1; border-left-color: var(--brand-primary);">
                    <span style="font-size:12px; font-weight:700; color:#64748b;">전체 후기</span>
                    <div style="font-size:24px; font-weight:800;"><?= $review_count ?>개</div>
                </div>
                <div class="stat-card" style="flex:1; border-left-color: #f59e0b;">
                    <span style="font-size:12px; font-weight:700; color:#64748b;">베스트 후기</span>
                    <div style="font-size:24px; font-weight:800;"><?= count(array_filter($reviews, fn($r) => $r['is_best'])) ?>개</div>
                </div>
                <div class="stat-card" style="flex:1; border-left-color: var(--success);">
                    <span style="font-size:12px; font-weight:700; color:#64748b;">평균 평점</span>
                    <div style="font-size:24px; font-weight:800;"><?= $review_count > 0 ? number_format(array_sum(array_column($reviews, 'rating')) / $review_count, 1) : '-' ?></div>
                </div>
            </div>

            <div class="card">
                <style>
                    .review-row { display: grid; grid-template-columns: 60px 150px 1fr 100px 80px 80px 60px 140px; padding: 15px 20px; border-bottom: 1px solid #f1f5f9; align-items: center; text-align: center; font-size: 13px; }
                    .star-rating { color: #f59e0b; letter-spacing: -2px; }
                    .badge-best { padding: 3px 8px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 11px; font-weight: 700; }
                    .badge-normal { padding: 3px 8px; background: #f1f5f9; color: #94a3b8; border-radius: 12px; font-size: 11px; font-weight: 700; }
                    .btn-best { background: #fef3c7; color: #92400e; }
                    .btn-unbest { background: #ecfdf5; color: #059669; }
                </style>
                <div class="review-row" style="font-weight: 800; background: #f8fafc; font-size: 12px;">
                    <div>번호</div><div>상품명</div><div>제목 / 내용</div><div>작성자</div><div>평점</div><div>조회</div><div>상태</div><div>관리</div>
                </div>
                <?php if(empty($reviews)): ?>
                    <div style="padding:50px; text-align:center; color:#94a3b8;">등록된 후기가 없습니다.</div>
                <?php endif; ?>
                <?php foreach($reviews as $r): ?>
                    <div class="review-row">
                        <div><?= $r['id'] ?></div>
                        <div style="font-weight:600; font-size:12px; text-align:left;"><?= htmlspecialchars($r['product_name'] ?? '삭제된 상품') ?></div>
                        <div style="text-align:left;">
                            <div style="font-weight:600;"><?= htmlspecialchars($r['title']) ?></div>
                            <div style="color:#94a3b8; font-size:11px; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:300px;"><?= htmlspecialchars($r['content']) ?></div>
                        </div>
                        <div><?= htmlspecialchars($r['author_name']) ?></div>
                        <div class="star-rating"><?= str_repeat('★', (int)$r['rating']) . str_repeat('☆', 5 - (int)$r['rating']) ?></div>
                        <div><?= number_format($r['hit_count']) ?></div>
                        <div><?= $r['is_best'] ? '<span class="badge-best">BEST</span>' : '<span class="badge-normal">일반</span>' ?></div>
                        <div class="actions">
                            <button class="btn-action <?= $r['is_best'] ? 'btn-unbest' : 'btn-best' ?>" onclick="location.href='admin_products.php?action=toggle_best&id=<?= $r['id'] ?>'"><?= $r['is_best'] ? '해제' : '베스트' ?></button>
                            <button class="btn-action btn-delete" onclick="if(confirm('이 후기를 삭제하시겠습니까?')) location.href='admin_products.php?action=delete_review&id=<?= $r['id'] ?>'">삭제</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- 단체/대량구매 문의 관리 -->
        <div class="tab-content <?= $active_tab=='manage-bulk'?'active':'' ?>">
            <div class="header"><h1>단체/대량구매 문의 관리</h1><div class="version">관리자 모드 v1.2</div></div>
            
            <div class="card">
                <style>
                    .bulk-row { display: grid; grid-template-columns: 60px 180px 1fr 120px 120px 140px 100px; padding: 15px 20px; border-bottom: 1px solid #f1f5f9; align-items: center; text-align: center; font-size: 13px; }
                    .product-tag { display: inline-block; padding: 2px 8px; background: #f0fdf4; color: #166534; border-radius: 4px; font-size: 11px; margin-right: 4px; border: 1px solid #dcfce7; }
                </style>
                <div class="bulk-row" style="font-weight: 800; background: #f8fafc; font-size: 12px;">
                    <div>번호</div><div>상품정보 (ID)</div><div>제목 / 문의내용</div><div>작성자</div><div>연락처</div><div>날짜</div><div>관리</div>
                </div>
                <?php if(empty($bulk_inquiries)): ?>
                    <div style="padding:50px; text-align:center; color:#94a3b8;">등록된 대량구매 문의가 없습니다.</div>
                <?php endif; ?>
                <?php foreach($bulk_inquiries as $b): ?>
                    <div class="bulk-row">
                        <div><?= $b['id'] ?></div>
                        <div style="text-align:left; overflow:hidden; text-overflow:ellipsis;">
                            <?php 
                                $p_ids = json_decode($b['product_ids'], true);
                                if(is_array($p_ids)) {
                                    foreach($p_ids as $p) {
                                        if (is_array($p) && isset($p['id'])) {
                                            $qty = isset($p['quantity']) ? $p['quantity'] : 1;
                                            echo "<span class='product-tag'>#{$p['id']} <b style='color:#0ea5e9; font-weight:800; font-size:11px;'>({$qty}개)</b></span>";
                                        } else {
                                            echo "<span class='product-tag'>#{$p}</span>";
                                        }
                                    }
                                } else {
                                    echo "<span class='product-tag'>#{$b['product_ids']}</span>";
                                }
                            ?>
                            <div style="font-size:11px; color:#64748b; margin-top:4px;">수량: <b><?= number_format($b['quantity']) ?></b></div>
                        </div>
                        <div style="text-align:left;">
                            <div style="font-weight:600;"><?= htmlspecialchars($b['title']) ?></div>
                            <div style="color:#94a3b8; font-size:11px; margin-top:2px; height:1.4em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><?= htmlspecialchars($b['content']) ?></div>
                            <div style="color:#64748b; font-size:10px;"><?= htmlspecialchars($b['email']) ?></div>
                        </div>
                        <div><?= htmlspecialchars($b['author']) ?></div>
                        <div><?= htmlspecialchars($b['phone']) ?></div>
                        <div style="font-size:11px; color:#94a3b8;"><?= substr($b['created_at'], 0, 16) ?></div>
                        <div class="actions">
                            <button class="btn-action btn-delete" onclick="if(confirm('이 문의를 삭제하시겠습니까?')) location.href='admin_products.php?action=delete_bulk&id=<?= $b['id'] ?>'">삭제</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- 공지사항 관리 -->
        <div class="tab-content <?= $active_tab=='manage-notice'?'active':'' ?>">
            <div class="header"><h1>공지사항 관리</h1><div class="version">관리자 모드 v1.2</div></div>
            
            <div class="form-card mb-6" style="margin-bottom: 20px;">
                <div class="form-group-title" id="notice-form-title">공지사항 등록</div>
                <form action="admin_products.php" method="POST">
                    <input type="hidden" name="notice_action" value="add_notice">
                    <input type="hidden" name="notice_id" id="notice_id" value="">
                    <div style="display:grid; grid-template-columns: 150px 1fr 150px; gap:20px;">
                        <div class="form-control"><label>카테고리</label><select name="category" id="notice_category"><option value="notice">공지사항</option><option value="event">이벤트</option></select></div>
                        <div class="form-control"><label>제목</label><input type="text" name="title" id="notice_title" required></div>
                        <div class="form-control"><label>작성자</label><input type="text" name="author" id="notice_author" value="관리자" required></div>
                    </div>
                    <div class="form-control"><label>내용</label><textarea name="content" id="notice_content" rows="3"></textarea></div>
                    <div style="display:flex; gap:10px;">
                        <button type="submit" id="notice-submit-btn" class="btn-submit" style="width: auto; padding: 10px 30px;">등록</button>
                        <button type="button" onclick="resetNoticeForm()" class="btn-action btn-edit" style="display:none;" id="notice-cancel-btn">취소</button>
                    </div>
                </form>
            </div>

            <div class="card">
                <style>
                    .notice-row { display: grid; grid-template-columns: 80px 120px 1fr 120px 100px; padding: 15px 30px; border-bottom: 1px solid #f1f5f9; align-items: center; text-align: center; }
                </style>
                <div class="notice-row" style="font-weight: 800; background: #f8fafc;">
                    <div>번호</div><div>카테고리</div><div>제목</div><div>작성자</div><div>관리</div>
                </div>
                <?php foreach($notices as $n): ?>
                    <div class="notice-row">
                        <div><?= $n['id'] ?></div>
                        <div><span style="padding:4px 10px; background:#fef3c7; color:#92400e; border-radius:20px; font-size:11px; font-weight:700;"><?= $n['category'] ?></span></div>
                        <div style="text-align:left; font-weight:600;"><?= htmlspecialchars($n['title']) ?></div>
                        <div><?= htmlspecialchars($n['author']) ?></div>
                        <div class="actions">
                            <button class="btn-action btn-edit" onclick='editNotice(<?= json_encode($n) ?>)'>수정</button>
                            <button class="btn-action btn-delete" onclick="if(confirm('삭제하시겠습니까?')) location.href='admin_products.php?action=delete_notice&id=<?= $n['id'] ?>'">삭제</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </main>
    <script>
        function editNotice(notice) {
            document.getElementById('notice-form-title').innerText = '공지사항 수정 (ID: ' + notice.id + ')';
            document.getElementById('notice_id').value = notice.id;
            document.getElementById('notice_category').value = notice.category;
            document.getElementById('notice_title').value = notice.title;
            document.getElementById('notice_author').value = notice.author;
            document.getElementById('notice_content').value = notice.content;
            document.getElementById('notice-submit-btn').innerText = '수정 완료';
            document.getElementById('notice-cancel-btn').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function resetNoticeForm() {
            document.getElementById('notice-form-title').innerText = '공지사항 등록';
            document.getElementById('notice_id').value = '';
            document.getElementById('notice_category').value = 'notice';
            document.getElementById('notice_title').value = '';
            document.getElementById('notice_author').value = '관리자';
            document.getElementById('notice_content').value = '';
            document.getElementById('notice-submit-btn').innerText = '등록';
            document.getElementById('notice-cancel-btn').style.display = 'none';
        }

        // URL 파라미터에 따라 탭 활성화 처리
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab === 'manage-notice') {
            // 필요 시 추가적인 탭 전환 로직 작성 가능
        }
    </script>
</body>
</html>
