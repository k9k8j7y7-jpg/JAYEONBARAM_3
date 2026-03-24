<?php
/**
 * product_reviews CRUD 함수 세트
 * admin_products.php와 동일한 PDO 설정 사용
 *
 * 사용법:
 *   require_once 'api/product_reviews.php';
 *   $reviewPDO = getReviewPDO();
 *   $reviews = getReviews($reviewPDO, $product_id);
 */

/**
 * PDO 연결 반환 (admin_products.php와 동일한 설정)
 */
function getReviewPDO(): PDO
{
    $config = require __DIR__ . '/db_config.php';
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    return new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

// ─── CREATE ───

/**
 * 후기 등록
 *
 * @param PDO   $pdo
 * @param array $data ['product_id', 'title', 'content', 'author_name', 'rating', 'is_best'(optional)]
 * @return int  생성된 후기 ID
 */
function createReview(PDO $pdo, array $data): int
{
    $sql = "INSERT INTO product_reviews (product_id, title, content, author_name, rating, is_best)
            VALUES (:product_id, :title, :content, :author_name, :rating, :is_best)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':product_id'  => (int) $data['product_id'],
        ':title'       => $data['title'],
        ':content'     => $data['content'],
        ':author_name' => $data['author_name'],
        ':rating'      => (int) ($data['rating'] ?? 5),
        ':is_best'     => (int) ($data['is_best'] ?? 0),
    ]);
    return (int) $pdo->lastInsertId();
}

// ─── READ ───

/**
 * 특정 상품의 후기 목록 조회
 *
 * @param PDO $pdo
 * @param int $productId
 * @return array
 */
function getReviewsByProduct(PDO $pdo, int $productId): array
{
    $stmt = $pdo->prepare(
        "SELECT * FROM product_reviews WHERE product_id = :product_id ORDER BY created_at DESC"
    );
    $stmt->execute([':product_id' => $productId]);
    return $stmt->fetchAll();
}

/**
 * 후기 단건 조회 (+ 조회수 증가)
 *
 * @param PDO  $pdo
 * @param int  $reviewId
 * @param bool $incrementHit 조회수 증가 여부 (기본 true)
 * @return array|false
 */
function getReviewById(PDO $pdo, int $reviewId, bool $incrementHit = true)
{
    if ($incrementHit) {
        $pdo->prepare("UPDATE product_reviews SET hit_count = hit_count + 1 WHERE id = :id")
            ->execute([':id' => $reviewId]);
    }

    $stmt = $pdo->prepare("SELECT * FROM product_reviews WHERE id = :id");
    $stmt->execute([':id' => $reviewId]);
    return $stmt->fetch();
}

/**
 * 베스트 후기 목록 조회
 *
 * @param PDO $pdo
 * @param int $limit
 * @return array
 */
function getBestReviews(PDO $pdo, int $limit = 10): array
{
    $stmt = $pdo->prepare(
        "SELECT r.*, p.name AS product_name
         FROM product_reviews r
         JOIN products p ON r.product_id = p.id
         WHERE r.is_best = 1
         ORDER BY r.created_at DESC
         LIMIT :lim"
    );
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * 전체 후기 목록 (페이징)
 *
 * @param PDO $pdo
 * @param int $page   현재 페이지 (1부터)
 * @param int $perPage 페이지당 건수
 * @return array ['data' => [...], 'total' => int, 'page' => int, 'per_page' => int]
 */
function getReviewsPaginated(PDO $pdo, int $page = 1, int $perPage = 20): array
{
    $offset = ($page - 1) * $perPage;

    $total = (int) $pdo->query("SELECT COUNT(*) FROM product_reviews")->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT r.*, p.name AS product_name
         FROM product_reviews r
         JOIN products p ON r.product_id = p.id
         ORDER BY r.created_at DESC
         LIMIT :lim OFFSET :off"
    );
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return [
        'data'     => $stmt->fetchAll(),
        'total'    => $total,
        'page'     => $page,
        'per_page' => $perPage,
    ];
}

// ─── UPDATE ───

/**
 * 후기 수정
 *
 * @param PDO   $pdo
 * @param int   $reviewId
 * @param array $data 수정할 필드 (title, content, author_name, rating, is_best)
 * @return bool
 */
function updateReview(PDO $pdo, int $reviewId, array $data): bool
{
    $allowed = ['title', 'content', 'author_name', 'rating', 'is_best'];
    $sets = [];
    $params = [':id' => $reviewId];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $data)) {
            $sets[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }

    if (empty($sets)) {
        return false;
    }

    $sql = "UPDATE product_reviews SET " . implode(', ', $sets) . " WHERE id = :id";
    return $pdo->prepare($sql)->execute($params);
}

// ─── DELETE ───

/**
 * 후기 삭제
 *
 * @param PDO $pdo
 * @param int $reviewId
 * @return bool
 */
function deleteReview(PDO $pdo, int $reviewId): bool
{
    return $pdo->prepare("DELETE FROM product_reviews WHERE id = :id")
               ->execute([':id' => $reviewId]);
}

/**
 * 특정 상품의 후기 전체 삭제
 *
 * @param PDO $pdo
 * @param int $productId
 * @return int 삭제된 행 수
 */
function deleteReviewsByProduct(PDO $pdo, int $productId): int
{
    $stmt = $pdo->prepare("DELETE FROM product_reviews WHERE product_id = :product_id");
    $stmt->execute([':product_id' => $productId]);
    return $stmt->rowCount();
}
