#!/usr/bin/env python3
"""
캠핑장 예약 시스템 - 완전 자동 설치 및 실행 스크립트
이 스크립트는 필요한 모든 도구를 자동으로 설치하고 프로젝트를 실행합니다.
"""

import os
import sys
import subprocess
import platform
import urllib.request
import shutil
import tempfile
from pathlib import Path

SYSTEM = platform.system()
IS_WINDOWS = SYSTEM == "Windows"
IS_MAC = SYSTEM == "Darwin"
IS_LINUX = SYSTEM == "Linux"

def print_header(text):
    """헤더 출력"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")

def print_step(step, total, text):
    """단계 출력"""
    print(f"\n[{step}/{total}] {text}")
    print("-" * 60)

def print_success(text):
    """성공 메시지"""
    print(f"✓ {text}")

def print_error(text):
    """에러 메시지"""
    print(f"✗ {text}")

def print_warning(text):
    """경고 메시지"""
    print(f"⚠ {text}")

def check_command(command):
    """명령어 존재 확인"""
    try:
        subprocess.run([command, "--version"], 
                      capture_output=True, 
                      check=True,
                      timeout=5)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False

def run_command(command, shell=False, capture=False):
    """명령어 실행"""
    try:
        if capture:
            result = subprocess.run(
                command if shell else command.split(),
                check=True,
                shell=shell,
                capture_output=True,
                text=True,
                timeout=300
            )
            return result.stdout
        else:
            subprocess.run(
                command if shell else command.split(),
                check=True,
                shell=shell,
                timeout=300
            )
            return True
    except subprocess.CalledProcessError as e:
        print_error(f"명령어 실행 실패: {e}")
        return False
    except subprocess.TimeoutExpired:
        print_error("명령어 실행 시간 초과")
        return False

def install_nodejs():
    """Node.js 자동 설치"""
    print("Node.js를 설치합니다...")
    
    if IS_WINDOWS:
        print_warning("Windows에서는 수동 설치가 필요합니다.")
        print("1. https://nodejs.org 방문")
        print("2. LTS 버전 다운로드 및 설치")
        print("3. 설치 후 이 스크립트를 다시 실행하세요")
        input("\n설치 완료 후 Enter를 누르세요...")
        return check_command("node")
    
    elif IS_MAC:
        # Homebrew 확인
        if not check_command("brew"):
            print("Homebrew를 먼저 설치합니다...")
            install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
            if not run_command(install_cmd, shell=True):
                return False
        
        print("Homebrew로 Node.js를 설치합니다...")
        return run_command("brew install node", shell=True)
    
    elif IS_LINUX:
        # NodeSource 저장소 사용
        print("NodeSource 저장소를 추가합니다...")
        try:
            # Ubuntu/Debian
            if shutil.which("apt-get"):
                run_command("curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -", shell=True)
                return run_command("sudo apt-get install -y nodejs", shell=True)
            # Fedora/RHEL
            elif shutil.which("dnf"):
                run_command("curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -", shell=True)
                return run_command("sudo dnf install -y nodejs", shell=True)
            else:
                print_error("지원하지 않는 Linux 배포판입니다.")
                print("https://nodejs.org 에서 수동으로 설치해주세요.")
                return False
        except Exception as e:
            print_error(f"설치 중 오류: {e}")
            return False
    
    return False

def install_pnpm():
    """pnpm 자동 설치"""
    print("pnpm을 설치합니다...")
    
    if IS_WINDOWS:
        return run_command("npm install -g pnpm", shell=True)
    else:
        # Unix 계열은 curl 사용
        try:
            run_command("curl -fsSL https://get.pnpm.io/install.sh | sh -", shell=True)
            # PATH 업데이트
            home = Path.home()
            pnpm_path = home / ".local" / "share" / "pnpm"
            if pnpm_path.exists():
                os.environ["PATH"] = f"{pnpm_path}:{os.environ['PATH']}"
            return True
        except:
            # 실패 시 npm으로 설치
            return run_command("npm install -g pnpm", shell=True)

def check_mysql():
    """MySQL 설치 확인"""
    # MySQL 명령어 확인
    if check_command("mysql"):
        return True
    
    # Windows에서 MySQL 서비스 확인
    if IS_WINDOWS:
        try:
            result = subprocess.run(
                ["sc", "query", "MySQL"],
                capture_output=True,
                text=True
            )
            if "RUNNING" in result.stdout:
                return True
        except:
            pass
    
    return False

def install_mysql():
    """MySQL 설치 안내"""
    print_warning("MySQL이 설치되어 있지 않습니다.")
    print("\nMySQL 설치 방법:")
    
    if IS_WINDOWS:
        print("1. https://dev.mysql.com/downloads/installer/ 방문")
        print("2. MySQL Installer 다운로드 및 실행")
        print("3. MySQL Server 설치")
    elif IS_MAC:
        print("Homebrew로 설치:")
        print("  brew install mysql")
        print("  brew services start mysql")
    elif IS_LINUX:
        print("Ubuntu/Debian:")
        print("  sudo apt-get update")
        print("  sudo apt-get install mysql-server")
        print("\nFedora/RHEL:")
        print("  sudo dnf install mysql-server")
        print("  sudo systemctl start mysqld")
    
    choice = input("\n지금 MySQL을 설치하시겠습니까? (y/n): ")
    if choice.lower() != 'y':
        return False
    
    if IS_MAC:
        if run_command("brew install mysql", shell=True):
            run_command("brew services start mysql", shell=True)
            return True
    elif IS_LINUX:
        if shutil.which("apt-get"):
            if run_command("sudo apt-get update", shell=True):
                return run_command("sudo apt-get install -y mysql-server", shell=True)
        elif shutil.which("dnf"):
            if run_command("sudo dnf install -y mysql-server", shell=True):
                return run_command("sudo systemctl start mysqld", shell=True)
    
    return False

def check_env_file():
    """환경 변수 파일 확인"""
    env_file = Path(".env")
    if not env_file.exists():
        print("[경고] .env 파일이 없습니다.")
        print("\n.env 파일 예시:")
        print("-" * 50)
        print("DATABASE_URL=mysql://user:password@localhost:3306/camping")
        print("STRIPE_SECRET_KEY=sk_test_your_key_here")
        print("NODE_ENV=development")
        print("-" * 50)
        
        create = input("\n.env 파일을 생성하시겠습니까? (y/n): ")
        if create.lower() == 'y':
            db_url = input("DATABASE_URL을 입력하세요: ")
            stripe_key = input("STRIPE_SECRET_KEY를 입력하세요 (선택사항, Enter로 건너뛰기): ")
            
            with open(".env", "w") as f:
                f.write(f"DATABASE_URL={db_url}\n")
                if stripe_key:
                    f.write(f"STRIPE_SECRET_KEY={stripe_key}\n")
                f.write("NODE_ENV=development\n")
            
            print("[완료] .env 파일이 생성되었습니다.")
            return True
        else:
            print("[오류] .env 파일이 필요합니다.")
            return False
    return True

def main():
    """메인 함수"""
    print_header("캠핑장 예약 시스템 - 완전 자동 설치 및 실행")
    print(f"운영체제: {SYSTEM}")
    print(f"Python 버전: {sys.version.split()[0]}")
    
    total_steps = 7
    
    # 1. Node.js 확인 및 설치
    print_step(1, total_steps, "Node.js 확인 중...")
    if check_command("node"):
        version = run_command("node --version", capture=True)
        print_success(f"Node.js가 이미 설치되어 있습니다: {version.strip()}")
    else:
        print_warning("Node.js가 설치되어 있지 않습니다.")
        if not install_nodejs():
            print_error("Node.js 설치 실패")
            sys.exit(1)
        print_success("Node.js 설치 완료")
    
    # 2. pnpm 확인 및 설치
    print_step(2, total_steps, "pnpm 확인 중...")
    if check_command("pnpm"):
        version = run_command("pnpm --version", capture=True)
        print_success(f"pnpm이 이미 설치되어 있습니다: {version.strip()}")
    else:
        print_warning("pnpm이 설치되어 있지 않습니다.")
        if not install_pnpm():
            print_error("pnpm 설치 실패")
            sys.exit(1)
        print_success("pnpm 설치 완료")
    
    # 3. MySQL 확인
    print_step(3, total_steps, "MySQL 확인 중...")
    if check_mysql():
        print_success("MySQL이 설치되어 있습니다.")
    else:
        print_warning("MySQL이 설치되어 있지 않거나 실행 중이 아닙니다.")
        if not install_mysql():
            print_warning("MySQL 없이 계속 진행합니다.")
            print_warning("나중에 DATABASE_URL을 설정해야 합니다.")
    
    # 4. 환경 변수 확인
    print_step(4, total_steps, "환경 변수 설정 중...")
    if not check_env_file():
        print_error("환경 변수 설정 실패")
        sys.exit(1)
    print_success("환경 변수 설정 완료")
    
    # 5. 의존성 설치
    print_step(5, total_steps, "프로젝트 의존성 설치 중...")
    print("(이 작업은 몇 분 정도 걸릴 수 있습니다...)")
    if not run_command("pnpm install"):
        print_error("의존성 설치 실패")
        sys.exit(1)
    print_success("의존성 설치 완료")
    
    # 6. 데이터베이스 마이그레이션
    print_step(6, total_steps, "데이터베이스 마이그레이션 실행 중...")
    if not run_command("pnpm db:push"):
        print_error("데이터베이스 마이그레이션 실패")
        print_warning("DATABASE_URL이 올바른지 확인해주세요.")
        choice = input("\n마이그레이션 없이 계속 진행하시겠습니까? (y/n): ")
        if choice.lower() != 'y':
            sys.exit(1)
    else:
        print_success("데이터베이스 마이그레이션 완료")
    
    # 7. 서버 시작
    print_step(7, total_steps, "개발 서버 시작 중...")
    print_header("🚀 서버가 시작되었습니다!\n\n   http://localhost:3000 에서 확인하세요\n\n   종료하려면 Ctrl+C를 누르세요")
    
    try:
        if IS_WINDOWS:
            subprocess.run("pnpm dev", shell=True)
        else:
            subprocess.run(["pnpm", "dev"])
    except KeyboardInterrupt:
        print("\n\n서버를 종료합니다...")
        sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n프로그램을 종료합니다...")
        sys.exit(0)
    except Exception as e:
        print(f"\n[오류] 예상치 못한 오류 발생: {e}")
        sys.exit(1)
