# 🏕️ 캠핑장 예약 시스템 (Camping Resort Booking System)

강원도 평창 프리미엄 캠핑 리조트의 완전한 온라인 예약 시스템입니다.

## 🌟 주요 기능

### 사용자 기능
- 🏞️ **캠핑장 소개**: 사이트 정보 및 시설 안내
- 📅 **예약 시스템**: 날짜 선택, 사이트 선택, 예약 생성
- 📊 **예약 현황 조회**: 자신의 예약 상태 확인
- 💬 **문의하기**: 관리자에게 질문 및 피드백 전송

### 관리자 기능
- 📈 **대시보드**: 예약 통계, 최근 예약, 최근 문의
- 🎯 **예약 관리**: 예약 승인/거절/취소
- 🏕️ **사이트 관리**: 캠핑 사이트 추가/수정/삭제
- 💭 **문의 관리**: 고객 문의 조회 및 답변
- 🏦 **계좌 관리**: 무통장 입금 계좌 관리

## 🚀 빠른 시작

### 로컬 개발 환경

```bash
# 1. 레포지토리 클론
git clone https://github.com/rootdonguk/camping.git
cd camping

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (DATABASE_URL 등)

# 4. 데이터베이스 마이그레이션
pnpm db:push

# 5. 개발 서버 시작
pnpm dev
# http://localhost:3000 에서 확인
```

### 프로덕션 배포

**Vercel을 이용한 배포 (권장):**

1. [DEPLOYMENT.md](./DEPLOYMENT.md) 문서 참고
2. [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)에서 상세 가이드 확인

**빠른 배포:**
```bash
npm i -g vercel
vercel --prod
```

## 📚 기술 스택

### 프론트엔드
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **TailwindCSS** - 스타일링
- **Shadcn/ui** - UI 컴포넌트
- **React Query** - 데이터 페칭
- **Streamdown** - Markdown 렌더링

### 백엔드
- **Node.js** - 런타임
- **Express** - 웹 프레임워크
- **tRPC** - 타입 안전 API
- **Drizzle ORM** - 데이터베이스 ORM
- **MySQL** - 데이터베이스

### 배포
- **Vercel** - 호스팅 플랫폼
- **PlanetScale/TiDB** - 관리형 MySQL 데이터베이스

## 📁 프로젝트 구조

```
camping/
├── client/                 # 프론트엔드 (React)
│   ├── src/
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── components/    # 재사용 가능 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   └── _core/         # 핵심 설정
│   └── index.html
├── server/                 # 백엔드 (Node.js)
│   ├── routers.ts         # tRPC 라우터 정의
│   ├── db.ts              # 데이터베이스 함수
│   ├── _core/             # 핵심 설정
│   └── index.ts           # 서버 진입점
├── drizzle/               # 데이터베이스 스키마
│   └── schema.ts
├── shared/                # 공유 코드
├── vercel.json            # Vercel 배포 설정
├── DEPLOYMENT.md          # 배포 가이드
└── PRODUCTION_GUIDE.md    # 프로덕션 운영 가이드
```

## 🔧 주요 API (tRPC 라우터)

### 대시보드 API
- `dashboard.stats` - 통계 데이터
- `dashboard.recentReservations` - 최근 예약
- `dashboard.recentInquiries` - 최근 문의

### 예약 관리 API
- `reservations.adminList` - 예약 목록
- `reservations.updateStatus` - 상태 변경
- `reservations.delete` - 예약 삭제

### 사이트 관리 API
- `sites.create` - 사이트 추가
- `sites.update` - 사이트 수정
- `sites.delete` - 사이트 삭제

### 문의 관리 API
- `inquiries.adminList` - 문의 목록
- `inquiries.reply` - 답변 등록
- `inquiries.updateStatus` - 상태 변경

### 계좌 관리 API
- `bankAccounts.list` - 계좌 목록
- `bankAccounts.create` - 계좌 추가
- `bankAccounts.update` - 계좌 수정
- `bankAccounts.delete` - 계좌 삭제

## 📋 환경 변수

```env
# 데이터베이스
DATABASE_URL=mysql://user:password@host/camping

# 인증
JWT_SECRET=your-secret-key

# OAuth (Manus 플랫폼)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
VITE_APP_ID=camping-app

# 환경
NODE_ENV=development
```

자세한 내용은 [.env.example](./.env.example) 참고

## 🧪 테스트

```bash
# 타입 체크
pnpm check

# 테스트 실행
pnpm test

# 빌드 테스트
pnpm build
```

## 📊 데이터베이스 스키마

### Reservations (예약)
- id, userId, siteId, checkInDate, checkOutDate, status, adminNotes

### Inquiries (문의)
- id, name, email, message, status, adminReply

### Sites (사이트)
- id, name, type, capacity, pricePerNight, description, amenities, imageUrl

### BankAccounts (계좌)
- id, bankName, accountNumber, accountHolder

## 🔒 보안

- ✅ HTTPS 자동 적용 (Vercel)
- ✅ 환경 변수 암호화
- ✅ JWT 기반 인증
- ✅ 관리자 권한 검증
- ✅ SQL 인젝션 방지 (ORM 사용)

## 📈 성능

- 클라이언트 번들: ~276KB (gzip)
- 서버 번들: ~60KB
- 페이지 로드: < 2초
- 데이터베이스 쿼리: 최적화됨

## 🐛 알려진 문제 및 해결

### 배포 후 데이터베이스 연결 오류
→ [DEPLOYMENT.md](./DEPLOYMENT.md#문제-해결) 참고

### 느린 성능
→ [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md#성능-최적화) 참고

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 👥 기여

버그 리포트 및 기능 제안은 GitHub Issues에서 받습니다.

## 📞 지원

- **GitHub**: https://github.com/rootdonguk/camping
- **문서**: 
  - [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
  - [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) - 운영 가이드

---

**마지막 업데이트**: 2026년 2월 21일  
**버전**: 1.0.0
