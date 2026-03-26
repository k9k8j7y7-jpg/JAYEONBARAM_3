<?php
/* g:\vibecoding\JAYEONBARAM\api\view_post.php */

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

// 1. DB 설정 불러오기
$config = require __DIR__ . '/db_config.php';
$host = $config['host'];
$db   = $config['db']; 
$user = $config['user']; 
$pass = $config['pass']; 
$charset = $config['charset'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // 2. 파라미터 유효성 검증 (보안: intval 사용)
    $post_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($post_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid Post ID']);
        exit;
    }

    // 3. 조회수(views/hit) 1 증가 (동시 실행)
    $update_hit = $pdo->prepare("UPDATE boards SET views = views + 1 WHERE id = ?");
    $update_hit->execute([$post_id]);

    // 4. 현재 게시글 상세 정보 조회
    $stmt = $pdo->prepare("SELECT * FROM boards WHERE id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();

    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit;
    }

    // 상품 정보 상세 로드
    $products = [];
    $pid_raw = $post['product_id'];
    if (!empty($pid_raw) && $pid_raw[0] === '[') {
        $p_list = json_decode($pid_raw, true);
        foreach ($p_list as $item) {
            $p_stmt = $pdo->prepare("SELECT id, name, image_url, price FROM products WHERE id = ?");
            $p_stmt->execute([$item['id']]);
            $p_info = $p_stmt->fetch();
            if ($p_info) {
                $p_info['quantity'] = $item['quantity'] ?? 1;
                $products[] = $p_info;
            }
        }
    } else if (!empty($pid_raw)) {
        $p_stmt = $pdo->prepare("SELECT id, name, image_url, price FROM products WHERE id = ?");
        $p_stmt->execute([(int)$pid_raw]);
        $p_info = $p_stmt->fetch();
        if ($p_info) {
            $p_info['quantity'] = 1;
            $products[] = $p_info;
        }
    }
    $post['products'] = $products;
    // 하위 호환성을 위해 첫 번째 상품 정보를 최상위에 유지
    if (!empty($products)) {
        $post['product_id'] = $products[0]['id'];
        $post['product_name'] = $products[0]['name'];
        $post['product_image'] = $products[0]['image_url'];
        $post['product_price'] = $products[0]['price'];
    }

    // 5. 이전글/다음글 정보 조회 (같은 카테고리 내에서)
    $category = $post['category'];
    
    // 이전글 (현재 ID보다 작으면서 가장 큰 ID)
    $prev_stmt = $pdo->prepare("SELECT id, title FROM boards WHERE category = ? AND id < ? ORDER BY id DESC LIMIT 1");
    $prev_stmt->execute([$category, $post_id]);
    $prev_post = $prev_stmt->fetch();

    // 다음글 (현재 ID보다 크면서 가장 작은 ID)
    $next_stmt = $pdo->prepare("SELECT id, title FROM boards WHERE category = ? AND id > ? ORDER BY id ASC LIMIT 1");
    $next_stmt->execute([$category, $post_id]);
    $next_post = $next_stmt->fetch();

    // 6. 최종 JSON 응답
    echo json_encode([
        'success' => true,
        'data' => [
            'post' => $post,
            'navigation' => [
                'prev' => $prev_post ? $prev_post : null,
                'next' => $next_post ? $next_post : null
            ]
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
