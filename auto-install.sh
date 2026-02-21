#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
    echo ""
}

print_step() {
    echo ""
    echo "[$1/$2] $3"
    echo "------------------------------------------------------------"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

print_header "캠핑장 예약 시스템 - 완전 자동 설치 및 실행"

SYSTEM=$(uname -s)
STEP=0
TOTAL=7

# 1. Node.js 확인 및 설치
STEP=$((STEP + 1))
print_step $STEP $TOTAL "Node.js 확인 중..."

if check_command node; then
    print_success "Node.js가 이미 설치되어 있습니다: $(node --version)"
else
    print_error "Node.js가 설치되어 있지 않습니다."
    
    if [[ "$SYSTEM" == "Darwin" ]]; then
        # macOS
        if check_command brew; then
            echo "Homebrew로 Node.js를 설치합니다..."
            brew install node
        else
            print_warning "Homebrew가 설치되어 있지 않습니다."
            echo "Homebrew를 먼저 설치합니다..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            if [ $? -eq 0 ]; then
                echo "Homebrew로 Node.js를 설치합니다..."
                brew install node
            else
                print_error "Homebrew 설치 실패"
                exit 1
            fi
        fi
    elif [[ "$SYSTEM" == "Linux" ]]; then
        # Linux
        if check_command apt-get; then
            # Ubuntu/Debian
            echo "NodeSource 저장소를 추가합니다..."
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            echo "Node.js를 설치합니다..."
            sudo apt-get install -y nodejs
        elif check_command dnf; then
            # Fedora/RHEL
            echo "NodeSource 저장소를 추가합니다..."
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            echo "Node.js를 설치합니다..."
            sudo dnf install -y nodejs
        elif check_command yum; then
            # CentOS
            echo "NodeSource 저장소를 추가합니다..."
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            echo "Node.js를 설치합니다..."
            sudo yum install -y nodejs
        else
            print_error "지원하지 않는 Linux 배포판입니다."
            echo "https://nodejs.org 에서 수동으로 설치해주세요."
            exit 1
        fi
    fi
    
    if check_command node; then
        print_success "Node.js 설치 완료: $(node --version)"
    else
        print_error "Node.js 설치 실패"
        exit 1
    fi
fi

# 2. pnpm 확인 및 설치
STEP=$((STEP + 1))
print_step $STEP $TOTAL "pnpm 확인 중..."

if check_command pnpm; then
    print_success "pnpm이 이미 설치되어 있습니다: $(pnpm --version)"
else
    print_error "pnpm이 설치되어 있지 않습니다."
    echo "pnpm을 설치합니다..."
    
    # curl로 설치 시도
    if curl -fsSL https://get.pnpm.io/install.sh | sh -; then
        # PATH 업데이트
        export PNPM_HOME="$HOME/.local/share/pnpm"
        export PATH="$PNPM_HOME:$PATH"
        
        # 쉘 설정 파일 업데이트
        if [ -f "$HOME/.bashrc" ]; then
            echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> "$HOME/.bashrc"
            echo 'export PATH="$PNPM_HOME:$PATH"' >> "$HOME/.bashrc"
        fi
        if [ -f "$HOME/.zshrc" ]; then
            echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> "$HOME/.zshrc"
            echo 'export PATH="$PNPM_HOME:$PATH"' >> "$HOME/.zshrc"
        fi
        
        print_success "pnpm 설치 완료"
    else
        # npm으로 설치 시도
        echo "npm으로 pnpm을 설치합니다..."
        npm install -g pnpm
        
        if [ $? -eq 0 ]; then
            print_success "pnpm 설치 완료"
        else
            print_error "pnpm 설치 실패"
            exit 1
        fi
    fi
fi

# 3. MySQL 확인
STEP=$((STEP + 1))
print_step $STEP $TOTAL "MySQL 확인 중..."

if check_command mysql; then
    print_success "MySQL이 설치되어 있습니다."
else
    print_warning "MySQL이 설치되어 있지 않습니다."
    echo ""
    read -p "MySQL을 설치하시겠습니까? (y/n): " install_mysql
    
    if [[ "$install_mysql" =~ ^[Yy]$ ]]; then
        if [[ "$SYSTEM" == "Darwin" ]]; then
            echo "Homebrew로 MySQL을 설치합니다..."
            brew install mysql
            brew services start mysql
        elif [[ "$SYSTEM" == "Linux" ]]; then
            if check_command apt-get; then
                sudo apt-get update
                sudo apt-get install -y mysql-server
                sudo systemctl start mysql
            elif check_command dnf; then
                sudo dnf install -y mysql-server
                sudo systemctl start mysqld
            elif check_command yum; then
                sudo yum install -y mysql-server
                sudo systemctl start mysqld
            fi
        fi
        
        if check_command mysql; then
            print_success "MySQL 설치 완료"
        else
            print_warning "MySQL 설치 실패. 나중에 수동으로 설치해주세요."
        fi
    else
        print_warning "MySQL 없이 계속 진행합니다."
        print_warning "나중에 DATABASE_URL을 설정해야 합니다."
    fi
fi

# 4. 환경 변수 설정
STEP=$((STEP + 1))
print_step $STEP $TOTAL "환경 변수 설정 중..."

if [ -f .env ]; then
    print_success ".env 파일이 이미 존재합니다."
else
    print_error ".env 파일이 없습니다."
    echo ""
    echo ".env 파일을 생성합니다..."
    echo ""
    read -p "DATABASE_URL을 입력하세요 (예: mysql://root:password@localhost:3306/camping): " db_url
    read -p "STRIPE_SECRET_KEY를 입력하세요 (선택사항, Enter로 건너뛰기): " stripe_key
    
    cat > .env << EOF
DATABASE_URL=$db_url
EOF
    
    if [ -n "$stripe_key" ]; then
        echo "STRIPE_SECRET_KEY=$stripe_key" >> .env
    fi
    
    echo "NODE_ENV=development" >> .env
    
    print_success ".env 파일이 생성되었습니다."
fi

# 5. 의존성 설치
STEP=$((STEP + 1))
print_step $STEP $TOTAL "프로젝트 의존성 설치 중..."
echo "(이 작업은 몇 분 정도 걸릴 수 있습니다...)"

pnpm install
if [ $? -ne 0 ]; then
    print_error "의존성 설치 실패"
    exit 1
fi
print_success "의존성 설치 완료"

# 6. 데이터베이스 마이그레이션
STEP=$((STEP + 1))
print_step $STEP $TOTAL "데이터베이스 마이그레이션 실행 중..."

pnpm db:push
if [ $? -ne 0 ]; then
    print_error "데이터베이스 마이그레이션 실패"
    print_warning "DATABASE_URL이 올바른지 확인해주세요."
    echo ""
    read -p "마이그레이션 없이 계속 진행하시겠습니까? (y/n): " continue
    if [[ ! "$continue" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "데이터베이스 마이그레이션 완료"
fi

# 7. 서버 시작
STEP=$((STEP + 1))
print_step $STEP $TOTAL "개발 서버 시작 중..."

print_header "🚀 서버가 시작되었습니다!\n\n   http://localhost:3000 에서 확인하세요\n\n   종료하려면 Ctrl+C를 누르세요"

pnpm dev
