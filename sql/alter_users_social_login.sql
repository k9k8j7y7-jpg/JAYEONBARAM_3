ALTER TABLE users
  ADD COLUMN provider VARCHAR(20) DEFAULT 'local' AFTER email,
  ADD COLUMN provider_id VARCHAR(255) NULL AFTER provider,
  ADD COLUMN profile_image VARCHAR(500) NULL AFTER provider_id;

-- 소셜 로그인 사용자는 비밀번호가 없을 수 있으므로 NULL 허용으로 변경
ALTER TABLE users MODIFY password VARCHAR(255) NULL;
