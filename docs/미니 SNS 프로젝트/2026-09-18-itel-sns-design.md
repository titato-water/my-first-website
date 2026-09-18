# I'tel SNS (itel-sns) 구현 설계 문서

**작성일**: 2026-09-18
**기반 문서**: `기획서.md`, `DB구조기획서.md`
**범위**: 1차(MVP) + 2차 + 3차 전체 구현

## 1. 개요

IT기기 관련 정보 공유 SNS `I'tel`을 `lecture1/itel-sns` 프로젝트로 신규 생성한다. 기존 lecture1 표준 스택(React + Vite + MUI)과 `new_project.md`의 템플릿 복사 방식을 따르고, DB/인증은 Supabase(기존 `titato-water's Project`, ref: `lkawzjpbaldaknozvjut`)를 재사용한다.

## 2. 기술 아키텍처

- **프론트엔드**: React + Vite + MUI (템플릿 `_template_settings` 복사)
- **라우팅**: react-router-dom
- **상태 관리**: 별도 라이브러리 없이 React Context(로그인 세션) + 커스텀 훅(`hooks/`)으로 Supabase 데이터 패칭. 규모 대비 Redux/Zustand는 과함(YAGNI)
- **백엔드/DB**: Supabase (Auth + Postgres + Realtime), `@supabase/supabase-js` 클라이언트
- **이미지**: Picsum Photos(`https://picsum.photos/seed/{seed}/{w}/{h}`)로 랜덤 이미지 선택 UI 구현. Unsplash API 키가 없으므로 대체하되, `src/utils/randomImage.js` 한 곳에서만 이미지 소스를 다루도록 분리해 추후 Unsplash/Supabase Storage로 교체가 쉽도록 한다.
- **배포**: GitHub Pages + GitHub Actions (`vite.config.js`에 `base: '/itel-sns/'` 설정)

## 3. 인증

- Supabase Auth 사용 (`supabase.auth.signUp`, `signInWithPassword`). 비밀번호는 Supabase가 안전하게 해시 저장하므로 커스텀 테이블에 저장하지 않는다.
- 이메일 인증(컨펌 메일)은 Supabase 프로젝트 설정에서 비활성화한다(기획서: "이메일 인증 X").
- 회원가입 폼에서 생년월일을 입력받아 **클라이언트 단에서 만 14세 이상 여부를 검증**한 뒤 가입을 진행한다(만 14세 미만이면 가입 차단 메시지).
- 세션 자동 저장/복원은 Supabase 클라이언트 기본 동작(localStorage)을 그대로 사용 → "자동 로그인" 요구사항 충족.
- 회원가입 성공 시 `it_users`에 프로필 행을 함께 생성한다(가입 트랜잭션에서 `auth.uid()`를 FK로 사용).

## 4. DB 스키마 (Supabase, `it_` 접두사)

### 1차
- `it_users(id uuid PK references auth.users, username text unique, display_name text, bio text, avatar_url text, birth_date date, created_at timestamptz)`
- `it_posts(id bigserial PK, user_id uuid FK it_users, caption text, image_url text, video_url text null, device_rating smallint null, location text null, likes_count int default 0, comments_count int default 0, shares_count int default 0, recommend_count int default 0, not_recommend_count int default 0, is_story boolean default false, created_at timestamptz)`
- `it_comments(id bigserial PK, post_id bigint FK it_posts, user_id uuid FK it_users, content text, created_at timestamptz)`
- `it_post_likes(user_id uuid FK, post_id bigint FK, created_at timestamptz, PK(user_id, post_id))`
- `it_follows(follower_id uuid FK it_users, following_id uuid FK it_users, created_at timestamptz, PK(follower_id, following_id))`

### 2차
- `it_post_reactions(user_id uuid FK, post_id bigint FK, reaction text check in ('recommend','not_recommend'), created_at timestamptz, PK(user_id, post_id))`
- `it_stories(id bigserial PK, user_id uuid FK, media_url text, created_at timestamptz, expires_at timestamptz)` — 조회 시 `expires_at > now()` 조건으로 필터링(완전 삭제 아님)
- `it_reports(id bigserial PK, reporter_id uuid FK, target_type text check in ('post','comment','user'), target_id bigint, reason text, status text default 'pending', created_at timestamptz)`
- `it_blocks(blocker_id uuid FK, blocked_id uuid FK, created_at timestamptz, PK(blocker_id, blocked_id))`

### 3차
- `it_chat_rooms(id bigserial PK, name text, created_at timestamptz)`
- `it_chat_room_members(room_id bigint FK, user_id uuid FK, joined_at timestamptz, PK(room_id, user_id))`
- `it_messages(id bigserial PK, room_id bigint FK, sender_id uuid FK, content text, message_type text check in ('text','image','location'), created_at timestamptz)`
- `it_notifications(id bigserial PK, recipient_id uuid FK, actor_id uuid FK, type text, target_id bigint, is_read boolean default false, created_at timestamptz)`
- 채팅 제재: `it_reports`에 채팅 신고 누적 시(경고 3회 → 1주 → 1개월 → 영구정지) 상태를 관리하는 `it_chat_bans(user_id uuid FK, level text, banned_until timestamptz null)` 테이블을 추가하고, 신고 접수 시 Postgres 함수/트리거로 자동 판정한다. 성적 콘텐츠 신고는 사유 코드로 구분해 즉시 영구정지 처리한다.

모든 테이블 RLS 활성화. 기본 정책: 본인 행만 INSERT/UPDATE/DELETE 가능, SELECT는 공개 데이터(게시물/댓글/프로필)는 전체 허용, 채팅 관련은 방 멤버만 허용.

## 5. 페이지 / 라우팅

| 경로 | 페이지 | 개발 단계 |
|---|---|---|
| `/login` | 로그인/회원가입 | 1차 |
| `/` | 메인 피드(무한스크롤, 좋아요/댓글/공유, 더블탭 좋아요, 하루 꿀팁 스토리 바) | 1차(피드)+2차(스토리) |
| `/explore` | 그리드 목록, 그리드 개수 전환, 검색(닉네임/아이디/게시물), 추천 탭 | 2차 |
| `/posts/:id` | 게시물 상세(댓글, 작성자 정보, 신고/차단) | 1차(상세)+2차(신고/차단) |
| `/write` | 게시물 작성(Picsum 이미지 선택, 캡션, 별점, 추천/비추천 대상 여부, 장소 텍스트) | 1차(기본)+2차(별점/장소) |
| `/profile/:username` | 마이페이지/타인 프로필(게시글 수, 팔로워/팔로잉, 추천/비추천 수, 팔로우 버튼) | 1차 |
| `/chat` | 채팅방 목록 | 3차 |
| `/chat/:roomId` | 채팅방(텍스트/사진/위치 공유, 프로필 이동) | 3차 |

하단 탭바(홈/탐색/글쓰기/알림/마이페이지)는 스크롤 방향에 따라 숨김 처리.

## 6. 폴더 구조

`code-convention.md` 규칙을 따른다.

```
src/
├── components/{common,ui,feed,chat}/
├── pages/ (Login, Feed, Explore, PostDetail, Write, Profile, ChatList, ChatRoom)
├── hooks/ (useSession, usePosts, useComments, useFollow, useStories, useChatMessages ...)
├── lib/supabase.js
├── utils/ (randomImage.js, ageValidation.js 등)
```

## 7. 배포 파이프라인

- `vite.config.js`: `base: '/itel-sns/'`
- `.github/workflows/deploy.yml`: 기존 표준 워크플로우 그대로 사용
- 배포 전 `npm run build`로 로컬 검증 후 GitHub 백업 → Pages workflow 설정

## 8. 구현 순서(마일스톤)

1. 프로젝트 세팅(템플릿 복사, 패키지 설치: react-router-dom, @supabase/supabase-js)
2. Supabase DB 스키마 전체 생성(1~3차 테이블 + RLS)
3. 인증(로그인/회원가입, 세션 Context)
4. 1차: 피드, 게시물 작성/상세, 마이페이지
5. 2차: 탐색(그리드/검색), 추천/비추천, 하루 꿀팁, 신고/차단
6. 3차: 채팅(Realtime), 알림, 채팅 제재 자동화
7. 빌드 검증
8. GitHub 백업 (gh CLI)
9. GitHub Pages 배포 (Actions) 및 URL 안내

## 9. 명시적으로 제외/단순화한 범위

- PWA(서비스워커/매니페스트)는 3차 "부가 기능"으로 이번 구현에 포함하되, 오프라인 캐싱 등 고급 기능은 최소 매니페스트+설치 가능 수준으로 단순화한다.
- 게시물 위치는 실제 지도 검색 API 키가 없어 자유 텍스트 입력으로 구현한다.
- 채팅 위치 공유는 브라우저 Geolocation API 좌표를 그대로 전달한다(별도 지도 렌더링 없이 좌표 텍스트/링크로 표시).
- 실제 이미지/영상 업로드(Supabase Storage)는 하지 않는다(기획서 확정사항). `image_url`/`video_url` 필드 구조만 유지.
