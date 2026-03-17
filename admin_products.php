<?php
$config = require 'db_config.php';
$host = $config['host'];
$db   = $config['db'];
$user = $config['user'];
$pass = $config['pass'];
$charset = $config['charset'];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
try {
     $pdo = new PDO($dsn, $user, $pass, [
         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
     ]);
} catch (\PDOException $e) {
     die("DB Connection Failed");
}

// 업로드 디렉토리 설정 (Next.js public 폴더 연동)
$upload_dir = 'public/uploads/products/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// 파일 업로드 함수
function handleFileUpload($file_key) {
    global $upload_dir;
    if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
        $tmp_name = $_FILES[$file_key]['tmp_name'];
        $name = basename($_FILES[$file_key]['name']);
        $filename = time() . '_' . $name;
        $target_path = $upload_dir . $filename;
        
        if (move_uploaded_file($tmp_name, $target_path)) {
            return '/uploads/products/' . $filename;
        }
    }
    return '';
}

// 카테고리 목록
$categories = $pdo->query("SELECT * FROM categories")->fetchAll();

// 상품 목록 가져오기
$products = $pdo->query("
    SELECT p.*, c.name as category_name 
    FROM products p 
    JOIN categories c ON p.category_id = c.id 
    ORDER BY p.id DESC
")->fetchAll();

// 상품 정보 가져오기 (수정용)
$edit_product = null;
if (isset($_GET['edit_id'])) {
    $stmt = $pdo->prepare("
        SELECT p.*, d.full_description, d.usage_guide, d.ingredients, d.main_features, d.detail_image_url, d.usage_image_url 
        FROM products p 
        LEFT JOIN product_details d ON p.id = d.product_id 
        WHERE p.id = ?
    ");
    $stmt->execute([$_GET['edit_id']]);
    $edit_product = $stmt->fetch();
}

$message = "";
// 상품 등록/수정 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add_product' || $_POST['action'] === 'edit_product') {
        try {
            $pdo->beginTransaction();
            
            $is_edit = ($_POST['action'] === 'edit_product');
            $product_id = $is_edit ? $_POST['product_id'] : null;

            // 이미지 파일 업로드 처리 (새로 업로드하지 않으면 기존 경로 유지)
            $main_image_url = handleFileUpload('main_image');
            if (!$main_image_url && $is_edit) $main_image_url = $_POST['prev_main_image'];

            $detail_image_url = handleFileUpload('detail_image');
            if (!$detail_image_url && $is_edit) $detail_image_url = $_POST['prev_detail_image'];

            $usage_image_url = handleFileUpload('usage_image');
            if (!$usage_image_url && $is_edit) $usage_image_url = $_POST['prev_usage_image'];

            if ($is_edit) {
                // 수정 처리
                $stmt = $pdo->prepare("UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ? WHERE id = ?");
                $stmt->execute([$_POST['category_id'], $_POST['name'], $_POST['description'], $_POST['price'], $main_image_url, $product_id]);

                $stmt = $pdo->prepare("UPDATE product_details SET full_description = ?, detail_image_url = ?, usage_guide = ?, usage_image_url = ?, ingredients = ?, main_features = ? WHERE product_id = ?");
                $stmt->execute([$_POST['full_description'], $detail_image_url, $_POST['usage_guide'], $usage_image_url, $_POST['ingredients'], $_POST['main_features'], $product_id]);
                
                $pdo->commit();
                header("Location: admin_products.php?success=edit");
            } else {
                // 신규 등록
                $stmt = $pdo->prepare("INSERT INTO products (category_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$_POST['category_id'], $_POST['name'], $_POST['description'], $_POST['price'], $main_image_url]);
                $product_id = $pdo->lastInsertId();

                $stmt = $pdo->prepare("INSERT INTO product_details (product_id, full_description, detail_image_url, usage_guide, usage_image_url, ingredients, main_features) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$product_id, $_POST['full_description'], $detail_image_url, $_POST['usage_guide'], $usage_image_url, $_POST['ingredients'], $_POST['main_features']]);
                
                $pdo->commit();
                header("Location: admin_products.php?success=add");
            }
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            $message = "처리 실패: " . $e->getMessage();
        }
    } elseif ($_POST['action'] === 'delete_product') {
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$_POST['product_id']]);
            header("Location: admin_products.php?deleted=1");
            exit;
        } catch (Exception $e) { $message = "삭제 실패: " . $e->getMessage(); }
    }
}

if (isset($_GET['success'])) {
    if ($_GET['success'] === 'add') $message = "상품이 성공적으로 등록되었습니다!";
    if ($_GET['success'] === 'edit') $message = "상품 정보가 수정되었습니다!";
}
if (isset($_GET['deleted'])) $message = "상품이 성공적으로 삭제되었습니다!";
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JAYEONBARAM Admin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --side-bg: #1e293b;
            --side-hover: #334155;
            --brand: #0A3D2E;
            --brand-light: #166534;
            --bg: #f8fafc;
        }
        body { margin: 0; font-family: 'Pretendard', sans-serif; display: flex; height: 100vh; background: var(--bg); overflow: hidden; }

        /* Sidebar */
        .sidebar { width: 260px; background: var(--side-bg); color: white; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-header { padding: 30px 20px; font-size: 20px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; color: #4ade80; }
        .menu-list { flex: 1; padding: 20px 0; overflow-y: auto; }
        .menu-item { padding: 15px 25px; cursor: pointer; display: flex; items-center: center; gap: 15px; transition: 0.2s; color: #cbd5e1; font-weight: 500; }
        .menu-item:hover { background: var(--side-hover); color: white; }
        .menu-item.active { background: var(--brand); color: white; border-right: 4px solid #4ade80; }
        .menu-item i { width: 20px; text-align: center; }

        /* Main Content */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .navbar { height: 70px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; px: 30px; justify-content: space-between; padding: 0 30px; }
        .content-area { flex: 1; padding: 40px; overflow-y: auto; }

        /* Dashboard/Card Styles */
        .card { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 25px; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 15px; border-left: 5px solid var(--brand); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stat-label { color: #94a3b8; font-size: 14px; margin-bottom: 10px; }
        .stat-value { font-size: 28px; font-weight: 800; color: #1e293b; }

        /* Form Styles */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #64748b; font-size: 14px; }
        input[type="text"], input[type="number"], select, textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 15px; box-sizing: border-box; }
        input[type="file"] { padding: 8px; font-size: 14px; border: 2px dashed #e2e8f0; border-radius: 10px; width: 100%; cursor: pointer; }
        .btn-submit { padding: 15px 30px; background: var(--brand); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; width: 100%; margin-top: 20px; }
        .btn-submit:hover { background: var(--brand-light); transform: translateY(-2px); }

        /* Table Styles */
        .admin-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .admin-table th { background: #f1f5f9; color: #64748b; font-weight: 600; text-align: left; padding: 15px; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
        .admin-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; vertical-align: middle; }
        .prod-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #eee; }
        .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-brand { background: #dcfce7; color: #166534; }

        /* Animation */
        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body onload="<?php echo $edit_product ? "showTab('add-product')" : ""; ?>">
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">JAYEONBARAM</div>
        <div class="menu-list">
            <div class="menu-item <?php echo !$edit_product ? 'active' : ''; ?>" onclick="showTab('dashboard')">
                <i class="fas fa-home"></i> 대시보드
            </div>
            <div class="menu-item <?php echo $edit_product ? 'active' : ''; ?>" onclick="showTab('add-product')">
                <i class="fas fa-plus-circle"></i> 상품 <?php echo $edit_product ? '수정' : '등록'; ?>
            </div>
            <div class="menu-item" onclick="showTab('manage-product')">
                <i class="fas fa-box"></i> 상품 관리
            </div>
        </div>
    </div>

    <!-- Main -->
    <div class="main">
        <div class="navbar"><div style="font-weight: 600; color: #64748b;">관리자 모드 v1.2</div></div>
        <div class="content-area">
            <?php if ($message): ?>
                <div style="padding: 20px; background: #def7ec; color: #03543f; border-radius: 12px; margin-bottom: 30px; font-weight: 600;">
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>

            <!-- Dashboard -->
            <div id="dashboard" class="tab-content <?php echo !$edit_product ? 'active' : ''; ?>">
                <div class="section-title">오늘의 현황</div>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-label">등록 상품 수</div><div class="stat-value"><?php echo count($products); ?>개</div></div>
                    <div class="stat-card"><div class="stat-label">결제 대기</div><div class="stat-value">5건</div></div>
                    <div class="stat-card"><div class="stat-label">배송 준비</div><div class="stat-value">8건</div></div>
                    <div class="stat-card" style="border-color: #f59e0b;"><div class="stat-label">방문자 수</div><div class="stat-value">1,248명</div></div>
                </div>
                <div class="card">
                    <h3 style="margin-top: 0">알림 사항</h3>
                    <p style="color: #64748b;">현재 총 <b><?php echo count($products); ?>개</b>의 상품이 시스템에 등록되어 있습니다.</p>
                </div>
            </div>

            <!-- Add/Edit Product -->
            <div id="add-product" class="tab-content <?php echo $edit_product ? 'active' : ''; ?>">
                <div class="section-title">상품 <?php echo $edit_product ? '수정' : '등록'; ?></div>
                <div class="card">
                    <form method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="<?php echo $edit_product ? 'edit_product' : 'add_product'; ?>">
                        <?php if ($edit_product): ?>
                            <input type="hidden" name="product_id" value="<?php echo $edit_product['id']; ?>">
                            <input type="hidden" name="prev_main_image" value="<?php echo $edit_product['image_url']; ?>">
                            <input type="hidden" name="prev_detail_image" value="<?php echo $edit_product['detail_image_url']; ?>">
                            <input type="hidden" name="prev_usage_image" value="<?php echo $edit_product['usage_image_url']; ?>">
                        <?php endif; ?>

                        <div style="font-weight: 700; color: var(--brand); margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">기본 정보</div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>카테고리</label>
                                <select name="category_id" required>
                                    <?php foreach ($categories as $cat): ?>
                                        <option value="<?php echo $cat['id']; ?>" <?php echo ($edit_product && $edit_product['category_id'] == $cat['id']) ? 'selected' : ''; ?>><?php echo $cat['name']; ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>상품명</label>
                                <input type="text" name="name" required value="<?php echo $edit_product ? $edit_product['name'] : ''; ?>">
                            </div>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>가격 (₩)</label>
                                <input type="number" name="price" required value="<?php echo $edit_product ? $edit_product['price'] : ''; ?>">
                            </div>
                            <div class="form-group">
                                <label>대표 이미지 <?php echo $edit_product ? '(변경 시 선택)' : '(필수)'; ?></label>
                                <input type="file" name="main_image" accept="image/*" <?php echo $edit_product ? '' : 'required'; ?>>
                                <?php if ($edit_product): ?><div style="font-size: 11px; margin-top: 5px; color: #888;">현재 이미지: <?php echo $edit_product['image_url']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>간략 설명</label>
                            <textarea name="description" rows="2" required><?php echo $edit_product ? $edit_product['description'] : ''; ?></textarea>
                        </div>

                        <div style="font-weight: 700; color: var(--brand); margin: 30px 0 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">상세 정보 이미지 업로드</div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>제품 상세 이미지 (파일 선택)</label>
                                <input type="file" name="detail_image" accept="image/*">
                                <?php if ($edit_product && $edit_product['detail_image_url']): ?><div style="font-size: 11px; margin-top: 5px; color: #888;">현재 이미지: <?php echo $edit_product['detail_image_url']; ?></div><?php endif; ?>
                            </div>
                            <div class="form-group">
                                <label>사용 방법 이미지 (파일 선택)</label>
                                <input type="file" name="usage_image" accept="image/*">
                                <?php if ($edit_product && $edit_product['usage_image_url']): ?><div style="font-size: 11px; margin-top: 5px; color: #888;">현재 이미지: <?php echo $edit_product['usage_image_url']; ?></div><?php endif; ?>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>상세 설명 (Text)</label>
                            <textarea name="full_description" rows="4"><?php echo $edit_product ? $edit_product['full_description'] : ''; ?></textarea>
                        </div>
                        <div class="form-group">
                            <label>사용 가이드</label>
                            <textarea name="usage_guide" rows="3"><?php echo $edit_product ? $edit_product['usage_guide'] : ''; ?></textarea>
                        </div>
                        <div class="form-group">
                            <label>전성분</label>
                            <textarea name="ingredients" rows="3"><?php echo $edit_product ? $edit_product['ingredients'] : ''; ?></textarea>
                        </div>
                        <div class="form-group">
                            <label>주요 특징</label>
                            <input type="text" name="main_features" value="<?php echo $edit_product ? $edit_product['main_features'] : ''; ?>">
                        </div>

                        <button type="submit" class="btn-submit"><?php echo $edit_product ? '정보 수정 완료' : '새 상품 등록 완료'; ?></button>
                        <?php if ($edit_product): ?>
                            <button type="button" onclick="location.href='admin_products.php'" style="background: #94a3b8; margin-top: 10px; box-shadow: none;" class="btn-submit">수정 취소</button>
                        <?php endif; ?>
                    </form>
                </div>
            </div>

            <!-- Manage Product -->
            <div id="manage-product" class="tab-content">
                <div class="section-title">상품 목록 관리</div>
                <div class="card" style="padding:0; overflow:hidden;">
                    <table class="admin-table">
                        <thead><tr><th>이미지</th><th>카테고리</th><th>상품명</th><th>가격</th><th>관리</th></tr></thead>
                        <tbody>
                            <?php foreach ($products as $prod): ?>
                            <tr>
                                <td><img src="http://localhost:3000<?php echo $prod['image_url']; ?>" class="prod-img"></td>
                                <td><span class="badge badge-brand"><?php echo $prod['category_name']; ?></span></td>
                                <td style="font-weight:700;"><?php echo $prod['name']; ?></td>
                                <td>₩<?php echo number_format($prod['price']); ?></td>
                                <td>
                                    <div style="display: flex; gap: 5px;">
                                        <button onclick="location.href='admin_products.php?edit_id=<?php echo $prod['id']; ?>'" style="padding: 6px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 12px;">수정</button>
                                        <form method="POST" onsubmit="return confirm('정말 삭제하시겠습니까?');" style="display:inline;">
                                            <input type="hidden" name="action" value="delete_product">
                                            <input type="hidden" name="product_id" value="<?php echo $prod['id']; ?>">
                                            <button type="submit" style="background:#fee2e2; border:1px solid #fecaca; color:#b91c1c; padding:6px 12px; border-radius:6px; cursor:pointer; font-size: 12px;">삭제</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script>
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
            
            const target = document.getElementById(tabId);
            if(target) target.classList.add('active');

            // 해당하는 메뉴 아이템 활성화
            const menuIdx = { 'dashboard': 0, 'add-product': 1, 'manage-product': 2 };
            const menuItems = document.querySelectorAll('.menu-item');
            if(menuIdx[tabId] !== undefined) menuItems[menuIdx[tabId]].classList.add('active');
        }
    </script>
</body>
</html>
