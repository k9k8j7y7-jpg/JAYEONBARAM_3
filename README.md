# JAYEONBARAM (자연바람) - 쇼핑몰 프로젝트

자연바람 쇼핑몰 프로젝트의 개발 및 운영을 위한 가이드라인입니다. 본 프로젝트는 Next.js 기반의 프론트엔드와 PHP 기반의 백엔드 API 시스템으로 구성되어 있습니다.

## 🚀 프로젝트 구조

- **Frontend:** Next.js (App Router), TypeScript, Vanilla CSS
- **Backend:** PHP (PDO), MySQL
- **Admin:** PHP 기반 통합 관리자 패널

## 🛠 필수 요구 사항

- Node.js 18.x 이상
- PHP 7.4 이상 (PDO MySQL 확장 필요)
- MySQL 5.7 이상 또는 MariaDB
- XAMPP 또는 유사한 로컬 서버 환경 (Apache/Nginx)

## 💻 로컬 개발 환경 설정

### 1. 프론트엔드 설정
```bash
# 종속성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev
```

### 2. 백엔드 설정
- PHP 서버를 실행합니다 (포트 **8000** 권장).
```bash
# PHP 내장 서버 실행 예시
php -S localhost:8000
```

### 3. 데이터베이스 및 보안 설정
- MySQL에 `jayeonbaram` 데이터베이스를 생성합니다.
- 프로젝트 루트에 `db_config.php` 파일을 생성하고 아래 내용을 입력합니다 (보안을 위해 `.gitignore`에 포함됨).

```php
<?php
return [
    'host' => 'localhost',
    'db'   => 'jayeonbaram',
    'user' => 'DB_사용자명',
    'pass' => 'DB_비밀번호',
    'charset' => 'utf8mb4',
];
```

## 🍱 주요 기능 주소

- **프론트엔드 메인:** [http://localhost:3000](http://localhost:3000)
- **관리자 패널:** [http://localhost:8000/admin_products.php](http://localhost:8000/admin_products.php)
- **상품 API:** [http://localhost:8000/get_products.php?category=slug](http://localhost:8000/get_products.php?category=slug)

## 🛡 관리자 페이지 기능 (v4.0)

- **대시보드:** 실시간 상품 등록 현황 및 판매 지표 확인
- **상품 등록:** 로컬 이미지 파일 업로드 지원 및 상세 정보 설정
- **상품 관리:** 등록된 상품 리스트 조회 및 수정/삭제 기능
- **이미지 업로드:** `public/uploads/products/` 경로에 자동 저장 및 Next.js 연동

## ⚠️ 주의 사항

- **파일 권한:** 서버 배포 시 `public/uploads/` 폴더에 쓰기 권한이 필요합니다.
- **CORS 설정:** 프론트엔드(3000)와 백엔드(8000) 포트가 다를 경우 PHP API 상단의 `Access-Control-Allow-Origin` 설정을 확인하세요.
- **보안:** `db_config.php` 및 기타 설정 파일은 절대 GitHub에 업로드하지 마세요.
