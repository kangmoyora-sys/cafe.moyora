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

`.env.example`을 `.env.local`로 복사하고 Supabase 프로젝트에서 발급한 URL과 Publishable Key를 입력합니다. 서버 전용 값(`SUPABASE_SECRET_KEY`, 네이버 Client Secret)은 브라우저에 노출되지 않도록 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 비밀값은 저장소에 커밋하지 않습니다.

현재 기본값으로 안내되는 대상은 네이버 카페 ID `31752861`, 게시판 Menu ID `58`입니다.

## Vercel 배포 흐름

1. GitHub 원격 저장소에 변경 사항을 푸시합니다.
2. Vercel에서 저장소를 Import하고 Next.js 프레임워크를 선택합니다.
3. Vercel Project Settings의 Environment Variables에 `.env.local`과 같은 키를 등록합니다.
4. 배포 전 `npm run lint`, `npm run build`를 확인한 뒤 Production 배포합니다.

운영 URL: https://moyora-cafe-studio.vercel.app

## Milestone 1 범위

- Supabase 이메일 로그인과 보호 라우트
- 역할 기반 관리자 화면(`profiles.role = admin`)
- 대시보드, 새 콘텐츠 작성, 네이버 연결 설정의 기반 UI

## 아직 미구현인 기능

- 실제 네이버 OAuth 및 네이버 카페 글쓰기
- Naver Search API 호출
- OpenAI 기반 글 생성
- 콘텐츠 저장·목록·게시 이력 데이터 연동
- 예약 발행 및 이미지 업로드
