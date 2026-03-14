#!/bin/bash

# 경로 설정 (실제 경로와 다를 경우 수정하세요)
PROJECT_ROOT="/home/ubuntu/cmms"
BACKEND_DIR="$PROJECT_ROOT/backend"
JAR_NAME="cmms-backend-0.0.1-SNAPSHOT.jar"

echo "=========================================="
echo "🛑 CMMS 통합 개발 환경(dev) 중지"
echo "=========================================="

# 1. 백엔드 프로세스 종료
echo "☕ 1. 백엔드 종료 중..."
pkill -f "$JAR_NAME"
if [ $? -eq 0 ]; then
    echo "   ✅ 백엔드 프로세스 종료 완료"
else
    echo "   ⚠️ 실행 중인 백엔드 프로세스가 없습니다."
fi

# 2. Nginx 중지
echo "⚙️ 2. Nginx 중지 중..."
sudo systemctl stop nginx
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx 서비스 중지 완료"
else
    echo "   ⚠️ Nginx 중지 실패"
fi

echo "=========================================="
echo "✨ CMMS 서비스가 중지되었습니다."
echo "🚀 재시작: $PROJECT_ROOT/start-dev.sh"
echo "=========================================="
