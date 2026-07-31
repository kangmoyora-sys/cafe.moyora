# 모여라 카페 콘텐츠센터 (Moyora Cafe Studio)

모여라 내부 직원이 네이버 카페 게시글 초안을 준비하기 위한 웹서비스입니다.

## 로컬 실행

Node.js 20 이상과 npm을 준비한 뒤 아래 명령을 실행합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경변수 설정

`.env.example`을 `.env.local`로 복사하고 Supabase 프로젝트에서 발급한 URL과 Publishable Key를 입력합니다. 서버 전용 값(`SUPABASE_SERVICE_ROLE_KEY`, 네이버 Client Secret, 토큰 암호화 키)은 브라우저에 노출되지 않도록 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 비밀값은 저장소에 커밋하지 않습니다.

현재 기본값으로 안내되는 대상은 네이버 카페 ID `31752861`, 게시판 Menu ID `58`입니다.

## Vercel 배포 흐름

1. GitHub 원격 저장소에 변경 사항을 푸시합니다.
2. Vercel에서 저장소를 Import하고 Next.js 프레임워크를 선택합니다.
3. Vercel Project Settings의 Environment Variables에 `.env.local`과 같은 키를 등록합니다. Production과 Preview에는 각각 별도 Supabase 프로젝트의 URL, Publishable Key, Service Role Key를 설정합니다. Preview에 Production Supabase 자격 증명을 재사용하지 않습니다.
4. 배포 전 `npm run lint`, `npm run build`를 확인한 뒤 Production 배포합니다.

운영 URL: https://moyora-cafe-studio.vercel.app

## Milestone 1 범위

- Supabase 이메일 로그인과 보호 라우트
- 역할 기반 관리자 화면(`profiles.role = admin`)
- 대시보드, 새 콘텐츠 작성, 네이버 연결 설정의 기반 UI

## 콘텐츠 초안 Migration 실행

`content_drafts` 테이블과 RLS 정책은 실제 Supabase 프로젝트에 아직 적용되지 않았습니다. 대표자가 아래 순서로 직접 검토·실행합니다.

1. [supabase/migrations/20260727_create_content_drafts.sql](supabase/migrations/20260727_create_content_drafts.sql) 파일 전체를 검토합니다.
2. Supabase Dashboard에서 대상 프로젝트의 SQL Editor를 엽니다.
3. 파일의 SQL 전체를 붙여 넣고 실행합니다.
4. Table Editor에서 `content_drafts` 테이블과 RLS 활성화 여부를 확인합니다.
5. admin과 editor 계정으로 각각 로그인해 초안 작성·목록 권한을 확인합니다.

이 저장소는 SQL 파일만 제공합니다. 애플리케이션이 Supabase Dashboard나 데이터베이스에 자동으로 변경을 적용하지 않습니다.

## 아직 미구현인 기능

- 네이버 카페 글쓰기
- Naver Search API 호출
- OpenAI 기반 글 생성
- 예약 발행 및 이미지 업로드

## Deployment

This project is deployed through Vercel from the `main` branch.
