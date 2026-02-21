@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================================
echo   캠핑장 예약 시스템 - 완전 자동 설치 및 실행
echo ============================================================
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [경고] 관리자 권한이 필요할 수 있습니다.
    echo 일부 설치가 실패하면 관리자 권한으로 다시 실행해주세요.
    echo.
    timeout /t 3 >nul
)

set STEP=0
set TOTAL=7

REM 1. Node.js 확인
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] Node.js 확인 중...
echo ------------------------------------------------------------
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Node.js가 이미 설치되어 있습니다.
    node --version
) else (
    echo ✗ Node.js가 설치되어 있지 않습니다.
    echo.
    echo Node.js를 설치합니다...
    echo 1. Chocolatey로 자동 설치 (권장)
    echo 2. 수동 설치 (브라우저에서 다운로드)
    echo.
    set /p choice="선택하세요 (1/2): "
    
    if "!choice!"=="1" (
        REM Chocolatey 확인
        where choco >nul 2>&1
        if !errorLevel! neq 0 (
            echo Chocolatey를 먼저 설치합니다...
            powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
            
            if !errorLevel! neq 0 (
                echo [오류] Chocolatey 설치 실패
                goto manual_nodejs
            )
            
            REM PATH 새로고침
            call refreshenv
        )
        
        echo Chocolatey로 Node.js를 설치합니다...
        choco install nodejs-lts -y
        
        if !errorLevel! neq 0 (
            echo [오류] Node.js 설치 실패
            goto manual_nodejs
        )
        
        REM PATH 새로고침
        call refreshenv
        echo ✓ Node.js 설치 완료
    ) else (
        :manual_nodejs
        echo.
        echo 브라우저에서 Node.js 다운로드 페이지를 엽니다...
        start https://nodejs.org/
        echo.
        echo 1. LTS 버전을 다운로드하세요
        echo 2. 설치 프로그램을 실행하세요
        echo 3. 설치 완료 후 Enter를 누르세요
        pause >nul
        
        where node >nul 2>&1
        if !errorLevel! neq 0 (
            echo [오류] Node.js가 여전히 설치되어 있지 않습니다.
            echo 설치 후 명령 프롬프트를 다시 열고 이 스크립트를 실행하세요.
            pause
            exit /b 1
        )
    )
)

REM 2. pnpm 확인 및 설치
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] pnpm 확인 중...
echo ------------------------------------------------------------
where pnpm >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ pnpm이 이미 설치되어 있습니다.
    pnpm --version
) else (
    echo ✗ pnpm이 설치되어 있지 않습니다.
    echo pnpm을 설치합니다...
    call npm install -g pnpm
    if !errorLevel! neq 0 (
        echo [오류] pnpm 설치 실패
        pause
        exit /b 1
    )
    echo ✓ pnpm 설치 완료
)

REM 3. MySQL 확인
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] MySQL 확인 중...
echo ------------------------------------------------------------
where mysql >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ MySQL이 설치되어 있습니다.
) else (
    sc query MySQL 2>nul | find "RUNNING" >nul
    if !errorLevel! equ 0 (
        echo ✓ MySQL 서비스가 실행 중입니다.
    ) else (
        echo ⚠ MySQL이 설치되어 있지 않거나 실행 중이 아닙니다.
        echo.
        echo MySQL 설치 방법:
        echo 1. https://dev.mysql.com/downloads/installer/
        echo 2. MySQL Installer 다운로드 및 실행
        echo.
        set /p install_mysql="지금 MySQL 다운로드 페이지를 여시겠습니까? (y/n): "
        if /i "!install_mysql!"=="y" (
            start https://dev.mysql.com/downloads/installer/
            echo 설치 후 계속하려면 Enter를 누르세요...
            pause >nul
        ) else (
            echo ⚠ MySQL 없이 계속 진행합니다.
            echo 나중에 DATABASE_URL을 설정해야 합니다.
        )
    )
)

REM 4. 환경 변수 설정
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] 환경 변수 설정 중...
echo ------------------------------------------------------------
if exist .env (
    echo ✓ .env 파일이 이미 존재합니다.
) else (
    echo ✗ .env 파일이 없습니다.
    echo.
    echo .env 파일을 생성합니다...
    echo.
    set /p db_url="DATABASE_URL을 입력하세요 (예: mysql://root:password@localhost:3306/camping): "
    set /p stripe_key="STRIPE_SECRET_KEY를 입력하세요 (선택사항, Enter로 건너뛰기): "
    
    (
        echo DATABASE_URL=!db_url!
        if not "!stripe_key!"=="" echo STRIPE_SECRET_KEY=!stripe_key!
        echo NODE_ENV=development
    ) > .env
    
    echo ✓ .env 파일이 생성되었습니다.
)

REM 5. 의존성 설치
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] 프로젝트 의존성 설치 중...
echo ------------------------------------------------------------
echo (이 작업은 몇 분 정도 걸릴 수 있습니다...)
call pnpm install
if %errorLevel% neq 0 (
    echo [오류] 의존성 설치 실패
    pause
    exit /b 1
)
echo ✓ 의존성 설치 완료

REM 6. 데이터베이스 마이그레이션
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] 데이터베이스 마이그레이션 실행 중...
echo ------------------------------------------------------------
call pnpm db:push
if %errorLevel% neq 0 (
    echo [오류] 데이터베이스 마이그레이션 실패
    echo ⚠ DATABASE_URL이 올바른지 확인해주세요.
    echo.
    set /p continue="마이그레이션 없이 계속 진행하시겠습니까? (y/n): "
    if /i not "!continue!"=="y" (
        pause
        exit /b 1
    )
) else (
    echo ✓ 데이터베이스 마이그레이션 완료
)

REM 7. 서버 시작
set /a STEP+=1
echo.
echo [%STEP%/%TOTAL%] 개발 서버 시작 중...
echo ------------------------------------------------------------
echo.
echo ============================================================
echo   🚀 서버가 시작되었습니다!
echo.
echo      http://localhost:3000 에서 확인하세요
echo.
echo      종료하려면 Ctrl+C를 누르세요
echo ============================================================
echo.
call pnpm dev
