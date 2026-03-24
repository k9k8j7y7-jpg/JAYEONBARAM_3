<?php
/* g:\vibecoding\JAYEONBARAM\api\board_list.php */
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

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

    $category = isset($_GET['category']) ? $_GET['category'] : 'notice';
    $search_type = isset($_GET['search_type']) ? $_GET['search_type'] : '';
    $search_query = isset($_GET['search_query']) ? $_GET['search_query'] : '';
    $limit = 10;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $limit;

    // 카테고리 화이트리스트 검증
    $allowed_categories = ['notice', 'review', 'qna', 'event'];
    if (!in_array($category, $allowed_categories)) {
        echo json_encode(['success' => false, 'message' => 'Invalid category']);
        exit;
    }

    // 조건절 구성
    $where_clauses = ["category = ?"];
    $params = [$category];

    if ($search_type && $search_query) {
        $column = '';
        if ($search_type === 'title') $column = 'title';
        elseif ($search_type === 'content') $column = 'content';
        elseif ($search_type === 'author') $column = 'author';

        if ($column) {
            $where_clauses[] = "$column LIKE ?";
            $params[] = "%$search_query%";
        }
    }

    $where_sql = "WHERE " . implode(" AND ", $where_clauses);

    // 전체 아이템 수 조회
    $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM boards $where_sql");
    $count_stmt->execute($params);
    $total_items = $count_stmt->fetchColumn();

    // 리스트 조회 (NO, TITLE, NAME, DATE, HIT)
    $list_sql = "SELECT id, title, author as name, DATE_FORMAT(created_at, '%Y-%m-%d') as date, views as hit 
                 FROM boards 
                 $where_sql
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?";
    
    $stmt = $pdo->prepare($list_sql);
    $param_index = 1;
    foreach ($params as $p) {
        $stmt->bindValue($param_index++, $p);
    }
    $stmt->bindValue($param_index++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($param_index++, $offset, PDO::PARAM_INT);
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
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
