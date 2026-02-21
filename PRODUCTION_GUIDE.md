# 캠핑장 예약 시스템 - 프로덕션 운영 가이드

## 📋 목차
1. [빠른 배포](#빠른-배포)
2. [데이터베이스 선택 가이드](#데이터베이스-선택-가이드)
3. [배포 후 체크리스트](#배포-후-체크리스트)
4. [모니터링 및 유지보수](#모니터링-및-유지보수)
5. [성능 최적화](#성능-최적화)
6. [보안 설정](#보안-설정)

---

## 빠른 배포

### 1단계: 데이터베이스 준비 (5분)

**PlanetScale 사용 (권장):**
```bash
# 1. planetscale.com 가입 및 로그인
# 2. 새 데이터베이스 생성 (이름: camping)
# 3. 비밀번호 생성 및 연결 문자열 복사
# 형식: mysql://[user]:[password]@[host]/camping
```

**또는 TiDB Cloud 사용:**
```bash
# 1. tidbcloud.com 가입 및 로그인
# 2. 새 클러스터 생성
# 3. 연결 문자열 복사
```

### 2단계: Vercel 배포 (3분)

**웹 대시보드 방법:**
1. https://vercel.com 접속 → 로그인
2. **Add New** → **Project**
3. GitHub 레포지토리 선택 (`rootdonguk/camping`)
4. 환경 변수 설정:
   ```
   DATABASE_URL=mysql://[user]:[password]@[host]/camping
   JWT_SECRET=[생성된 임의 문자열]
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://manus.im
   VITE_APP_ID=camping-app
   NODE_ENV=production
   ```
5. **Deploy** 클릭

**CLI 방법:**
```bash
npm i -g vercel
cd /home/ubuntu/camping
vercel --prod
# 대화형으로 환경 변수 설정
```

### 3단계: 도메인 설정 (10분)

Vercel 프로젝트 설정 → **Domains** → 도메인 추가 → DNS 레코드 설정

---

## 데이터베이스 선택 가이드

| 서비스 | 가격 | 특징 | 추천 대상 |
|--------|------|------|----------|
| **PlanetScale** | 무료~$99/월 | MySQL 호환, 자동 스케일링 | 중소 프로젝트 |
| **TiDB Cloud** | 무료~$200/월 | 분산 SQL, 고성능 | 고트래픽 프로젝트 |
| **AWS RDS** | $15~100/월 | 완전 관리형, 신뢰성 높음 | 엔터프라이즈 |
| **DigitalOcean DB** | $15~100/월 | 간단한 관리, 합리적 가격 | 중규모 프로젝트 |

**PlanetScale 추천 이유:**
- ✅ 무료 플랜 제공 (월 50GB 스토리지)
- ✅ Vercel과 완벽 통합
- ✅ 자동 백업 및 복제
- ✅ 간단한 설정

---

## 배포 후 체크리스트

배포 완료 후 다음 항목들을 확인하세요:

### 기능 테스트
- [ ] 홈페이지 정상 로드
- [ ] 캠핑장 소개 페이지 접근 가능
- [ ] 예약 기능 작동 (예약 생성, 조회)
- [ ] 관리자 로그인 가능
- [ ] 관리자 대시보드 통계 표시
- [ ] 문의 기능 작동

### 성능 확인
- [ ] 페이지 로드 시간 < 3초
- [ ] 이미지 최적화 확인
- [ ] 모바일 반응형 확인

### 보안 확인
- [ ] HTTPS 적용 확인
- [ ] 환경 변수 보호 확인
- [ ] 데이터베이스 백업 설정 확인

---

## 모니터링 및 유지보수

### 로그 모니터링

**Vercel 대시보드:**
```
프로젝트 → Deployments → 배포 버전 → Logs
```

**실시간 로그 확인:**
```bash
vercel logs [project-url] --follow
```

### 에러 추적

1. **Vercel Analytics 활용**
   - 프로젝트 → Analytics 탭
   - 성능 지표 및 에러 추적

2. **데이터베이스 모니터링**
   - PlanetScale: 대시보드 → Insights
   - 쿼리 성능 및 연결 상태 확인

### 정기 유지보수

| 주기 | 작업 | 명령어 |
|------|------|--------|
| **주 1회** | 데이터베이스 백업 확인 | PlanetScale 대시보드 확인 |
| **월 1회** | 의존성 업데이트 | `pnpm update` |
| **월 1회** | 보안 패치 | `pnpm audit` |
| **분기 1회** | 성능 최적화 검토 | Vercel Analytics 검토 |

---

## 성능 최적화

### 1. 이미지 최적화

현재 상태: 캠핑장 이미지들이 최적화됨

```bash
# 추가 이미지 최적화 (선택사항)
pnpm add sharp
```

### 2. 번들 크기 최적화

현재 상태:
- 클라이언트 번들: ~276KB (gzip)
- 서버 번들: ~60KB

**개선 방안:**
```javascript
// vite.config.ts에서 코드 스플리팅 설정
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-*'],
        }
      }
    }
  }
}
```

### 3. 데이터베이스 쿼리 최적화

```typescript
// 인덱스 추가 (필요시)
// drizzle/schema.ts에서 설정
index('idx_reservation_status').on(reservations.status),
index('idx_inquiry_status').on(inquiries.status),
```

### 4. 캐싱 전략

```typescript
// API 응답 캐싱 (선택사항)
// server/routers.ts에서 설정
export const appRouter = router({
  dashboard: {
    stats: adminProcedure.query(async () => {
      // 캐싱: 5분마다 갱신
      return getCachedStats();
    })
  }
});
```

---

## 보안 설정

### 1. 환경 변수 보호

✅ **이미 적용됨:**
- 환경 변수는 Vercel에서 암호화되어 저장
- `.env` 파일은 `.gitignore`에 포함

### 2. 데이터베이스 보안

**PlanetScale:**
```bash
# 1. 비밀번호 정기적 변경 (월 1회)
# PlanetScale 대시보드 → Passwords → Rotate

# 2. 접근 제한 설정
# PlanetScale 대시보드 → Settings → Allowed Hosts
# Vercel 배포 호스트만 허용
```

### 3. API 보안

**CORS 설정:**
```typescript
// server/_core/index.ts에서 설정
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

**Rate Limiting:**
```typescript
// 선택사항: express-rate-limit 추가
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 100 요청 제한
});

app.use('/api/', limiter);
```

### 4. HTTPS 강제

✅ **자동 적용됨** (Vercel에서 자동 제공)

---

## 트러블슈팅

### 배포 실패

**원인: 빌드 오류**
```bash
# 로컬에서 빌드 테스트
pnpm build

# 타입 체크
pnpm check

# 의존성 확인
pnpm install
```

**원인: 환경 변수 누락**
- Vercel 대시보드에서 모든 환경 변수 확인
- 변수명 대소문자 확인

### 데이터베이스 연결 오류

```bash
# 연결 문자열 형식 확인
# mysql://[user]:[password]@[host]/[database]

# 로컬에서 테스트
DATABASE_URL="..." pnpm db:push
```

### 느린 성능

1. **Vercel Analytics 확인**
   - 느린 API 엔드포인트 식별
   - 데이터베이스 쿼리 최적화

2. **데이터베이스 성능**
   ```bash
   # PlanetScale 대시보드 → Insights
   # 느린 쿼리 확인 및 최적화
   ```

---

## 배포 후 다음 단계

### 1. 도메인 설정
- [ ] 커스텀 도메인 구매 (GoDaddy, Namecheap 등)
- [ ] Vercel에서 도메인 연결
- [ ] DNS 레코드 설정

### 2. 이메일 알림 설정
- [ ] 새 예약 알림 설정
- [ ] 문의 알림 설정
- [ ] 관리자 이메일 설정

### 3. 분석 도구 통합
- [ ] Google Analytics 추가
- [ ] Sentry (에러 추적) 추가

### 4. 백업 및 복구 계획
- [ ] 정기 백업 설정
- [ ] 복구 테스트 수행

---

## 연락처 및 지원

- **GitHub 레포지토리**: https://github.com/rootdonguk/camping
- **Vercel 문서**: https://vercel.com/docs
- **PlanetScale 문서**: https://planetscale.com/docs

---

**배포 완료 후 이 가이드를 북마크하고 필요할 때마다 참고하세요!**
