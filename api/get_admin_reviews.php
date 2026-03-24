<?php
/**
 * 관리자용 후기 API
 * 프론트엔드(Antigravity 등)에서 AJAX로 호출
 *
 * GET  ?action=get_reviews                 → 전체 후기 목록 (페이징)
 * GET  ?action=get_reviews&product_id=N    → 특정 상품 후기
 * GET  ?action=get_reviews&best_only=1     → 베스트 후기만
 * POST ?action=toggle_best  {id: N}        → 베스트 토글
 * POST ?action=delete_review {id: N}       → 후기 삭제
 */

header('Content-Type: application/json; charset=utf-8');

// 관리자 세션 체크
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '관리자 로그인이 필요합니다.']);
    exit;
}

// DB 연결
$config = require __DIR__ . '/db_config.php';
try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB 연결 실패']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {

    // ─── 후기 목록 조회 ───
    case 'get_reviews':
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $perPage  = max(1, min(100, (int)($_GET['per_page'] ?? 20)));
        $offset   = ($page - 1) * $perPage;

        $where  = [];
        $params = [];

        // 특정 상품 필터
        if (!empty($_GET['product_id'])) {
            $where[]  = 'r.product_id = :product_id';
            $params[':product_id'] = (int)$_GET['product_id'];
        }

        // 베스트만
        if (!empty($_GET['best_only'])) {
            $where[] = 'r.is_best = 1';
        }

        $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        // 총 건수
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM product_reviews r $whereSQL");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // 데이터
        $sql = "SELECT r.*, p.name AS product_name
                FROM product_reviews r
                LEFT JOIN products p ON r.product_id = p.id
                $whereSQL
                ORDER BY r.created_at DESC
                LIMIT :lim OFFSET :off";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        }
        $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'success'  => true,
            'data'     => $stmt->fetchAll(),
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ]);
        break;

    // ─── 베스트 토글 ───
    case 'toggle_best':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST 요청만 허용됩니다.']);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = (int)($input['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '유효한 후기 ID가 필요합니다.']);
            break;
        }

        $pdo->prepare("UPDATE product_reviews SET is_best = IF(is_best = 1, 0, 1) WHERE id = ?")
            ->execute([$id]);

        // 변경 후 상태 반환
        $stmt = $pdo->prepare("SELECT id, is_best FROM product_reviews WHERE id = ?");
        $stmt->execute([$id]);
        $review = $stmt->fetch();

        echo json_encode([
            'success' => true,
            'message' => $review['is_best'] ? '베스트로 지정되었습니다.' : '베스트가 해제되었습니다.',
            'data'    => $review,
        ]);
        break;

    // ─── 후기 삭제 ───
    case 'delete_review':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST 요청만 허용됩니다.']);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = (int)($input['id'] ?? 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '유효한 후기 ID가 필요합니다.']);
            break;
        }

        $stmt = $pdo->prepare("DELETE FROM product_reviews WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => '후기가 삭제되었습니다.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => '해당 후기를 찾을 수 없습니다.']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '유효하지 않은 action입니다.']);
        break;
}
