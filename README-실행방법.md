# 캠핑장 예약 시스템 - 실행 방법

## 🚀 완전 자동 설치 및 실행 (권장)

### Windows 사용자
```cmd
auto-install.bat
```
또는
```cmd
python quick-start.py
```

### Mac/Linux 사용자
```bash
chmod +x auto-install.sh
./auto-install.sh
```
또는
```bash
python3 quick-start.py
```

## ✨ 자동 설치 스크립트가 하는 일

1. **Node.js 자동 설치**
   - Windows: Chocolatey 또는 수동 다운로드
   - Mac: Homebrew
   - Linux: NodeSource 저장소

2. **pnpm 자동 설치**
   - npm 또는 공식 설치 스크립트 사용

3. **MySQL 설치 안내**
   - 설치 여부 확인 및 설치 가이드

4. **.env 파일 자동 생성**
   - 대화형으로 DATABASE_URL 입력
   - STRIPE_SECRET_KEY 설정 (선택사항)

5. **의존성 자동 설치**
   - pnpm install 실행

6. **데이터베이스 마이그레이션**
   - 테이블 자동 생성

7. **서버 자동 시작**
   - http://localhost:3000 에서 실행

## 📋 사전 준비사항 (선택사항)

자동 설치 스크립트를 사용하면 아래 항목들이 자동으로 설치됩니다.
수동으로 미리 설치하고 싶다면:

### 1. 필수 프로그램
- **Python** (3.6 이상) - 자동 설치 스크립트 실행용
- **Node.js** (v18 이상) - 자동 설치됨
- **pnpm** - 자동 설치됨
- **MySQL** - 설치 안내 제공

### 2. 환경 변수 (자동 생성됨)

`.env` 파일이 없으면 스크립트가 자동으로 생성합니다.
미리 만들고 싶다면:

```env
DATABASE_URL=mysql://사용자명:비밀번호@localhost:3306/데이터베이스명
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
NODE_ENV=development
```

**예시:**
```env
DATABASE_URL=mysql://root:password123@localhost:3306/camping_db
STRIPE_SECRET_KEY=sk_test_51abc123...
NODE_ENV=development
```

## 🔧 수동 실행 (단계별)

자동 설치 스크립트가 작동하지 않을 경우에만 사용:

### 1단계: Node.js 설치
- Windows: https://nodejs.org
- Mac: `brew install node`
- Linux: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

### 2단계: pnpm 설치
```bash
npm install -g pnpm
```

### 3단계: MySQL 설치
- Windows: https://dev.mysql.com/downloads/installer/
- Mac: `brew install mysql && brew services start mysql`
- Linux: `sudo apt-get install mysql-server`

### 4단계: .env 파일 생성
```bash
# .env 파일을 만들고 DATABASE_URL 등을 설정
```

### 5단계: 의존성 설치
```bash
pnpm install
```

### 6단계: 데이터베이스 마이그레이션
```bash
pnpm db:push
```

### 7단계: 개발 서버 실행
```bash
pnpm dev
```

서버가 시작되면 브라우저에서 `http://localhost:3000` 접속

## 📦 프로덕션 배포

### 빌드
```bash
pnpm build
```

### 실행
```bash
pnpm start
```

## 🎯 주요 기능

### 관리자 기능
- 캠핑장 사이트 관리 (추가/수정/삭제)
- 예약 승인/거부
- 계좌이체 확인 및 승인
- 결제 게이트웨이 설정 (네이버페이, 카카오페이, 토스)
- 은행 계좌 관리
- 사이트 설정 관리 (문구, 이미지 등)
- 문의 관리

### 사용자 기능
- 캠핑장 예약
- 예약 조회
- 다양한 결제 방법 (카드, 네이버페이, 카카오페이, 토스, 계좌이체)
- 문의하기

## 🔑 API 엔드포인트

### 결제 게이트웨이 설정 (관리자)
```typescript
// 네이버페이 설정
POST /api/trpc/paymentGateways.upsert
{
  "provider": "naver_pay",
  "isEnabled": true,
  "merchantId": "...",
  "apiKey": "...",
  "testMode": true
}
```

### 은행 계좌 관리 (관리자)
```typescript
// 계좌 추가
POST /api/trpc/bankAccounts.create
{
  "bankName": "국민은행",
  "accountNumber": "123-456-789012",
  "accountHolder": "캠핑장",
  "displayOrder": 0
}

// 계좌 목록 조회
GET /api/trpc/bankAccounts.list
```

### 계좌이체 처리
```typescript
// 사용자: 계좌이체 증빙 제출
POST /api/trpc/paymentMethods.submitBankTransfer
{
  "reservationId": 1,
  "amount": "50000",
  "proofUrl": "https://..."
}

// 관리자: 계좌이체 승인
POST /api/trpc/paymentMethods.approveBankTransfer
{
  "reservationId": 1,
  "paymentStatus": "fully_paid"
}

// 관리자: 계좌이체 거부
POST /api/trpc/paymentMethods.rejectBankTransfer
{
  "reservationId": 1,
  "adminNote": "금액이 일치하지 않습니다"
}
```

### 캠핑장 정보 수정 (관리자)
```typescript
POST /api/trpc/sites.update
{
  "id": 1,
  "name": "새로운 이름",
  "description": "설명",
  "pricePerNight": "80000",
  "imageUrl": "https://...",
  "isActive": true
}
```

### 사이트 설정 관리 (관리자)
```typescript
// 설정 업데이트
POST /api/trpc/settings.update
{
  "key": "site_title",
  "value": "우리 캠핑장"
}

// 설정 조회
GET /api/trpc/settings.get?key=site_title

// 모든 설정 조회
GET /api/trpc/settings.getAll
```

## 🐛 문제 해결

### 데이터베이스 연결 오류
- `.env` 파일의 `DATABASE_URL`이 올바른지 확인
- MySQL 서버가 실행 중인지 확인
- 데이터베이스가 생성되어 있는지 확인

### 포트 충돌
- 3000번 포트가 이미 사용 중이면 다른 포트로 변경
- `.env`에 `PORT=3001` 추가

### pnpm 명령어를 찾을 수 없음
```bash
npm install -g pnpm
```

## 📞 지원

문제가 발생하면 이슈를 등록해주세요.
