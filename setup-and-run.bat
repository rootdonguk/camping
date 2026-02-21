@echo off
echo ====================================
echo 캠핑장 예약 시스템 설치 및 실행
echo ====================================
echo.

REM 환경 변수 확인
if not defined DATABASE_URL (
    echo [오류] DATABASE_URL 환경 변수가 설정되지 않았습니다.
    echo .env 파일을 생성하거나 환경 변수를 설정해주세요.
    echo.
    echo 예시:
    echo DATABASE_URL=mysql://user:password@localhost:3306/camping
    pause
    exit /b 1
)

echo [1/4] 의존성 설치 중...
call pnpm install
if errorlevel 1 (
    echo [오류] 의존성 설치 실패
    pause
    exit /b 1
)

echo.
echo [2/4] 데이터베이스 마이그레이션 실행 중...
call pnpm db:push
if errorlevel 1 (
    echo [오류] 데이터베이스 마이그레이션 실패
    pause
    exit /b 1
)

echo.
echo [3/4] TypeScript 타입 체크 중...
call pnpm check
if errorlevel 1 (
    echo [경고] 타입 체크에서 오류가 발견되었습니다.
    echo 계속 진행하시겠습니까? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)

echo.
echo [4/4] 개발 서버 시작 중...
echo.
echo ====================================
echo 서버가 시작되었습니다!
echo http://localhost:3000 에서 확인하세요
echo ====================================
echo.
call pnpm dev
