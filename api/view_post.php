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

    // 4. 현재 게시글 상세 정보 조회 (상품 정보 조인)
    $stmt = $pdo->prepare("
        SELECT 
            b.id, b.category, b.title, b.author, b.content, b.views as hit, 
            DATE_FORMAT(b.created_at, '%Y-%m-%d') as date,
            b.rating, b.image_url as review_image,
            p.id as product_id, p.name as product_name, p.image_url as product_image, p.price as product_price
        FROM boards b
        LEFT JOIN products p ON b.product_id = p.id
        WHERE b.id = ?
    ");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();

    if (!$post) {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        exit;
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
