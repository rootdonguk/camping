# 캠핑장 예약 시스템 - 배포 가이드

이 문서는 캠핑장 예약 시스템을 Vercel에 배포하는 방법을 설명합니다.

## 사전 요구사항

- **GitHub 계정**: 레포지토리가 GitHub에 푸시되어 있어야 함
- **Vercel 계정**: [vercel.com](https://vercel.com)에서 무료 계정 생성
- **외부 데이터베이스**: PlanetScale, TiDB Cloud, 또는 다른 MySQL 호스팅 서비스

## 1단계: 데이터베이스 설정 (PlanetScale 예시)

### PlanetScale에서 MySQL 데이터베이스 생성

1. [PlanetScale](https://planetscale.com)에 접속하여 계정 생성
2. 새 데이터베이스 생성 (이름: `camping`)
3. **Passwords** 탭에서 새 비밀번호 생성
4. 연결 문자열 복사:
   ```
   mysql://[username]:[password]@[host]/camping
   ```

### 로컬 환경에서 테스트 (선택사항)

```bash
# 데이터베이스 마이그레이션 실행
DATABASE_URL="mysql://[username]:[password]@[host]/camping" pnpm db:push
```

## 2단계: Vercel에 배포

### 옵션 A: Vercel 웹 대시보드 사용 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. **Add New** → **Project** 클릭
3. GitHub 레포지토리 선택 (`rootdonguk/camping`)
4. **Environment Variables** 설정:
   - `DATABASE_URL`: PlanetScale 연결 문자열
   - `JWT_SECRET`: 안전한 임의 문자열 (예: `openssl rand -base64 32`)
   - `OAUTH_SERVER_URL`: `https://api.manus.im`
   - `VITE_OAUTH_PORTAL_URL`: `https://manus.im`
   - `VITE_APP_ID`: `camping-app`
   - `NODE_ENV`: `production`

5. **Deploy** 클릭

### 옵션 B: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포
cd /home/ubuntu/camping
vercel --prod

# 환경 변수 설정 (대화형)
# 또는 vercel.json에 미리 설정된 환경 변수 사용
```

## 3단계: 배포 후 확인

배포가 완료되면 Vercel에서 제공하는 URL로 접속하여 다음을 확인하세요:

- ✅ 홈페이지 정상 로드
- ✅ 캠핑장 소개 페이지 접근 가능
- ✅ 예약 기능 작동
- ✅ 관리자 대시보드 접근 (로그인 후)

## 환경 변수 설명

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | MySQL 데이터베이스 연결 문자열 | `mysql://user:pass@host/camping` |
| `JWT_SECRET` | JWT 토큰 서명용 비밀키 | `your-secret-key-here` |
| `OAUTH_SERVER_URL` | OAuth 인증 서버 주소 | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth 포털 주소 | `https://manus.im` |
| `VITE_APP_ID` | 애플리케이션 ID | `camping-app` |
| `NODE_ENV` | 실행 환경 | `production` |

## 커스텀 도메인 설정

1. Vercel 프로젝트 설정에서 **Domains** 탭 선택
2. 도메인 추가 (예: `camping.example.com`)
3. DNS 레코드 설정 (Vercel에서 제공하는 지침 따르기)

## 문제 해결

### 데이터베이스 연결 오류
- PlanetScale 연결 문자열이 정확한지 확인
- 데이터베이스 마이그레이션이 완료되었는지 확인
- Vercel 로그에서 오류 메시지 확인

### 빌드 실패
- `pnpm install` 및 `pnpm build`가 로컬에서 성공하는지 확인
- Node.js 버전 호환성 확인 (18.x 이상 권장)
- TypeScript 타입 오류 확인: `pnpm check`

### 환경 변수 오류
- Vercel 프로젝트 설정에서 모든 환경 변수가 설정되었는지 확인
- 변수명이 정확한지 확인 (대소문자 구분)

## 배포 후 관리

### 로그 확인
```bash
vercel logs [project-url]
```

### 배포 롤백
Vercel 대시보드에서 이전 배포 버전으로 간단히 롤백 가능

### 자동 배포
GitHub에 푸시할 때마다 자동으로 배포됨 (기본 설정)

## 보안 권장사항

1. **환경 변수 보호**: 민감한 정보(JWT_SECRET, DATABASE_URL)는 Vercel의 환경 변수로만 관리
2. **HTTPS 강제**: Vercel에서 자동으로 HTTPS 제공
3. **정기적 백업**: 데이터베이스 정기 백업 설정
4. **모니터링**: Vercel의 Analytics 및 로그 모니터링

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [PlanetScale 문서](https://planetscale.com/docs)
- [Node.js 배포 가이드](https://nodejs.org/en/docs/guides/nodejs-web-app/)

---

**배포 완료 후 문제가 발생하면 Vercel 대시보드의 Logs 탭에서 오류 메시지를 확인하세요.**
