# 커뮤니티 사이트 DB 구조 기획서 (최종본)

> `나만의 커뮤니티 기획서_최종.md`의 페이지별 기능을 기준으로 설계했습니다. 모든 테이블명은 서비스명(Devision)에 맞춰 **`DV_`** 접두사를 붙였습니다.

## 1. 테이블 목록 개요

| 테이블명 | 설명 |
|---|---|
| `DV_USERS` | 사용자 정보 |
| `DV_POSTS` | 게시물 정보 |
| `DV_TAGS` | 태그 마스터 |
| `DV_POST_TAGS` | 게시물-태그 매핑 (N:M) |
| `DV_COMMENTS` | 댓글 / 대댓글 |
| `DV_POST_LIKES` | 게시물 좋아요 (N:M) |
| `DV_COMMENT_LIKES` | 댓글 좋아요 (N:M) |
| `DV_FOLLOWS` | 팔로우 관계 (N:M, self) |
| `DV_NOTIFICATIONS` | 알림 |

---

## 2. 테이블 상세

### 2-1. DV_USERS (사용자)
회원가입 화면 기준. 기획 확정에 따라 **전화번호 컬럼은 제외**하고, 이메일은 가입 시 중복 검사만 수행합니다(별도 인증 컬럼 없음).

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `user_id` | BIGSERIAL | PK, AUTO INCREMENT | 사용자 번호 |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 계정 (중복검사 대상) |
| `password` | VARCHAR(255) | NOT NULL | 비밀번호 (해시 저장) |
| `nickname` | VARCHAR(50) | UNIQUE, NOT NULL | 닉네임(이름) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 가입일 |

### 2-2. DV_POSTS (게시물)
게시물 목록/상세, 작성·수정 화면 기준. 정렬(인기순)에 쓰이는 카운트 컬럼은 조회 성능을 위해 비정규화하여 보관합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `post_id` | BIGSERIAL | PK, AUTO INCREMENT | 게시물 번호 |
| `user_id` | BIGINT | FK → `DV_USERS.user_id`, NOT NULL | 작성자 |
| `title` | VARCHAR(200) | NOT NULL | 제목 |
| `content` | TEXT | NOT NULL | 본문 (마크다운 + 코드블록 원문 저장) |
| `category` | VARCHAR(30) | NOT NULL | 대분류 (예: 코드리뷰 / 문제풀이 / 잡담) |
| `like_count` | INT | NOT NULL, DEFAULT 0 | 좋아요 수 (비정규화 캐시) |
| `comment_count` | INT | NOT NULL, DEFAULT 0 | 댓글 수 (비정규화 캐시) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 작성일 |
| `updated_at` | TIMESTAMP | NULL | 수정일 |

### 2-3. DV_TAGS (태그 마스터)
언어/기술 태그(JS, React, CSS 등) 관리용 마스터 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `tag_id` | BIGSERIAL | PK, AUTO INCREMENT | 태그 번호 |
| `name` | VARCHAR(30) | UNIQUE, NOT NULL | 태그명 |

### 2-4. DV_POST_TAGS (게시물-태그 매핑)
게시물 하나에 여러 태그를 붙일 수 있도록 하는 N:M 연결 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `post_id` | BIGINT | PK(복합), FK → `DV_POSTS.post_id` | 게시물 번호 |
| `tag_id` | BIGINT | PK(복합), FK → `DV_TAGS.tag_id` | 태그 번호 |

### 2-5. DV_COMMENTS (댓글 / 대댓글)
`parent_comment_id`로 자기 자신을 참조해 대댓글을 표현합니다(값이 NULL이면 최상위 댓글).

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `comment_id` | BIGSERIAL | PK, AUTO INCREMENT | 댓글 번호 |
| `post_id` | BIGINT | FK → `DV_POSTS.post_id`, NOT NULL | 어떤 게시물의 댓글인지 |
| `user_id` | BIGINT | FK → `DV_USERS.user_id`, NOT NULL | 작성자 |
| `parent_comment_id` | BIGINT | FK → `DV_COMMENTS.comment_id`, NULL 허용 | 대댓글인 경우 부모 댓글 |
| `content` | TEXT | NOT NULL | 댓글 내용 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 작성일 |

### 2-6. DV_POST_LIKES (게시물 좋아요)
한 사용자가 같은 게시물에 중복으로 좋아요를 누를 수 없도록 복합 PK로 막습니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `user_id` | BIGINT | PK(복합), FK → `DV_USERS.user_id` | 좋아요 누른 사용자 |
| `post_id` | BIGINT | PK(복합), FK → `DV_POSTS.post_id` | 좋아요 대상 게시물 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 좋아요 누른 시각 |

### 2-7. DV_COMMENT_LIKES (댓글 좋아요)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `user_id` | BIGINT | PK(복합), FK → `DV_USERS.user_id` | 좋아요 누른 사용자 |
| `comment_id` | BIGINT | PK(복합), FK → `DV_COMMENTS.comment_id` | 좋아요 대상 댓글 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 좋아요 누른 시각 |

### 2-8. DV_FOLLOWS (팔로우 관계)
`DV_USERS`를 자기 자신과 N:M으로 연결하는 팔로우 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `follower_id` | BIGINT | PK(복합), FK → `DV_USERS.user_id` | 팔로우 하는 사람 |
| `following_id` | BIGINT | PK(복합), FK → `DV_USERS.user_id` | 팔로우 받는 사람 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 팔로우 시작 시각 |

### 2-9. DV_NOTIFICATIONS (알림)
좋아요·댓글·대댓글·팔로우 발생 시 생성되는 알림입니다. `target_id`가 가리키는 대상은 `type`에 따라 게시물 또는 댓글로 달라집니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|---|---|---|---|
| `notification_id` | BIGSERIAL | PK, AUTO INCREMENT | 알림 번호 |
| `receiver_id` | BIGINT | FK → `DV_USERS.user_id`, NOT NULL | 알림 받는 사용자 |
| `sender_id` | BIGINT | FK → `DV_USERS.user_id`, NOT NULL | 알림을 발생시킨 사용자 |
| `type` | VARCHAR(20) | NOT NULL | `LIKE_POST` / `LIKE_COMMENT` / `COMMENT` / `REPLY` / `FOLLOW` |
| `target_id` | BIGINT | NOT NULL | 대상 게시물/댓글 번호 |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | 읽음 여부 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | 알림 발생 시각 |

---

## 3. 테이블 연결 관계 (ERD 요약)

- `DV_USERS` 1 : N `DV_POSTS` — 한 사용자가 여러 게시물 작성
- `DV_USERS` 1 : N `DV_COMMENTS` — 한 사용자가 여러 댓글 작성
- `DV_POSTS` 1 : N `DV_COMMENTS` — 한 게시물에 여러 댓글
- `DV_COMMENTS` 1 : N `DV_COMMENTS` (self) — 댓글 하나에 여러 대댓글
- `DV_POSTS` N : M `DV_TAGS` (`DV_POST_TAGS` 경유) — 게시물 하나에 여러 태그, 태그 하나가 여러 게시물에 사용
- `DV_USERS` N : M `DV_POSTS` (`DV_POST_LIKES` 경유) — 좋아요
- `DV_USERS` N : M `DV_COMMENTS` (`DV_COMMENT_LIKES` 경유) — 댓글 좋아요
- `DV_USERS` N : M `DV_USERS` (`DV_FOLLOWS` 경유, self) — 팔로우/팔로워
- `DV_USERS` → `DV_NOTIFICATIONS` — 한 사용자가 여러 알림을 받음 (receiver_id, sender_id 모두 `DV_USERS` 참조)

## 4. 향후 확장 예정 테이블 (3차 기능)

기획서의 3차(확장) 기능인 신고/차단, 관리자 기능을 위해 아래 테이블을 추후 추가할 수 있습니다. 현재 단계에서는 상세 설계를 보류합니다.

| 테이블명(예정) | 설명 |
|---|---|
| `DV_REPORTS` | 게시물/댓글 신고 내역 (신고자, 대상, 사유, 처리상태) |
| `DV_BLOCKS` | 사용자 간 차단 관계 (`DV_FOLLOWS`와 유사한 N:M 구조) |

---
*기준 문서: `나만의 커뮤니티 기획서_최종.md`, `기획서_보완점.md`*
