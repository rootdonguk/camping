# 캠핑장 예약 시스템 - 설치 가이드

## 🎯 목표
이 프로젝트를 **단 하나의 명령어**로 실행할 수 있도록 완전 자동화된 설치 스크립트를 제공합니다.

---

## 📦 생성된 파일 목록

### 자동 설치 스크립트 (권장)
| 파일 | 설명 | 사용 대상 |
|------|------|----------|
| `auto-install.bat` | Windows 완전 자동 설치 | Windows |
| `auto-install.sh` | Mac/Linux 완전 자동 설치 | Mac/Linux |
| `quick-start.py` | Python 기반 자동 설치 | 모든 OS |

### 간단 실행 스크립트
| 파일 | 설명 | 사용 대상 |
|------|------|----------|
| `setup-and-run.bat` | Windows 간단 실행 | Windows (도구 설치 완료 시) |
| `setup-and-run.sh` | Mac/Linux 간단 실행 | Mac/Linux (도구 설치 완료 시) |

### 문서
| 파일 | 설명 |
|------|------|
| `🚀-여기서-시작하세요.txt` | 가장 먼저 읽을 파일 |
| `실행하세요.md` | 상세 실행 가이드 |
| `README-실행방법.md` | API 문서 포함 전체 가이드 |
| `START-HERE.txt` | 간단 시작 가이드 |
| `INSTALL-GUIDE.md` | 이 파일 |

---

## 🚀 실행 방법 (우선순위 순)

### 1️⃣ 완전 자동 설치 (가장 권장)

#### Windows
```cmd
auto-install.bat
```
또는
```cmd
python quick-start.py
```

#### Mac/Linux
```bash
chmod +x auto-install.sh
./auto-install.sh
```
또는
```bash
python3 quick-start.py
```

**자동으로 설치되는 것:**
- Node.js (Chocolatey/Homebrew/apt)
- pnpm
- MySQL 설치 안내
- 프로젝트 의존성
- 데이터베이스 마이그레이션
- 서버 자동 시작

---

### 2️⃣ 간단 실행 (도구가 이미 설치된 경우)

#### Windows
```cmd
setup-and-run.bat
```

#### Mac/Linux
```bash
chmod +x setup-and-run.sh
./setup-and-run.sh
```

**필요한 것:**
- Node.js 설치 완료
- pnpm 설치 완료
- MySQL 설치 완료
- .env 파일 존재

---

### 3️⃣ 수동 실행 (문제 발생 시)

```bash
# 1. 의존성 설치
pnpm install

# 2. 데이터베이스 마이그레이션
pnpm db:push

# 3. 서버 시작
pnpm dev
```

---

## 📋 자동 설치 스크립트 상세 동작

### 1단계: Node.js 확인 및 설치
- **Windows**: Chocolatey 자동 설치 → Node.js 설치
- **Mac**: Homebrew 확인 → Node.js 설치
- **Linux**: NodeSource 저장소 추가 → Node.js 설치

### 2단계: pnpm 설치
- npm 또는 공식 설치 스크립트 사용

### 3단계: MySQL 확인
- 설치 여부 확인
- 미설치 시 설치 안내 또는 자동 설치

### 4단계: 환경 변수 설정
- .env 파일 존재 확인
- 없으면 대화형으로 생성
  - DATABASE_URL 입력
  - STRIPE_SECRET_KEY 입력 (선택)

### 5단계: 의존성 설치
```bash
pnpm install
```

### 6단계: 데이터베이스 마이그레이션
```bash
pnpm db:push
```

### 7단계: 서버 시작
```bash
pnpm dev
```

---

## 🔧 필요한 정보

### DATABASE_URL (필수)
MySQL 연결 문자열:
```
mysql://사용자명:비밀번호@호스트:포트/데이터베이스명
```

**예시:**
```
mysql://root:mypassword@localhost:3306/camping_db
```

### STRIPE_SECRET_KEY (선택)
Stripe 결제 테스트 키:
```
sk_test_51abc123def456...
```

---

## 🎯 실행 후 확인

### 1. 브라우저 접속
```
http://localhost:3000
```

### 2. 관리자 로그인
첫 로그인 시 자동으로 관리자 권한 부여

### 3. 기본 설정
- 은행 계좌 추가
- 결제 게이트웨이 설정
- 캠핑장 사이트 추가

---

## 🐛 문제 해결

### Node.js 설치 실패
**Windows:**
1. https://nodejs.org 방문
2. LTS 버전 다운로드
3. 설치 후 스크립트 재실행

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### pnpm 설치 실패
```bash
npm install -g pnpm
```

### MySQL 연결 오류
1. MySQL 서비스 실행 확인
2. DATABASE_URL 확인
3. 데이터베이스 생성 확인

```sql
CREATE DATABASE camping_db;
```

### 포트 충돌
`.env` 파일에 추가:
```env
PORT=3001
```

### 권한 오류 (Linux/Mac)
```bash
chmod +x auto-install.sh
chmod +x setup-and-run.sh
```

---

## 📊 시스템 요구사항

### 최소 요구사항
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 4GB
- **디스크**: 1GB 여유 공간
- **Python**: 3.6+ (자동 설치 스크립트용)

### 권장 요구사항
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 8GB
- **디스크**: 2GB 여유 공간
- **Node.js**: 18.x LTS
- **MySQL**: 8.0+

---

## 🎉 성공 메시지

스크립트가 성공적으로 완료되면:

```
============================================================
  🚀 서버가 시작되었습니다!

     http://localhost:3000 에서 확인하세요

     종료하려면 Ctrl+C를 누르세요
============================================================
```

---

## 📞 추가 지원

### 문서
- `실행하세요.md` - 상세 가이드
- `README-실행방법.md` - API 문서

### 명령어
```bash
# 타입 체크
pnpm check

# 코드 포맷팅
pnpm format

# 테스트
pnpm test

# 프로덕션 빌드
pnpm build
pnpm start
```

---

## 🔄 업데이트

프로젝트 업데이트 시:

```bash
# 1. 코드 업데이트
git pull

# 2. 의존성 업데이트
pnpm install

# 3. 데이터베이스 마이그레이션
pnpm db:push

# 4. 서버 재시작
pnpm dev
```

---

**이제 시작하세요!** 🚀

Windows: `auto-install.bat` 더블클릭
Mac/Linux: `./auto-install.sh` 실행
