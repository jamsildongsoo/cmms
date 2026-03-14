#!/bin/bash

# 경로 설정 (실제 경로와 다를 경우 수정하세요)
PROJECT_ROOT="/home/ubuntu/cmms"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
JAR_NAME="cmms-backend-0.0.1-SNAPSHOT.jar"

echo "=========================================="
echo "🚀 CMMS 통합 개발 환경(dev) 배포 시작"
echo "=========================================="

# 1. 기존 백엔드 프로세스 종료 (있을 경우만)
echo "🛑 1. 기존 백엔드 종료 중..."
pkill -f "$JAR_NAME" || echo "   (기존 프로세스 없음)"

# 2. 프론트엔드 최신화 (dist.tar 압축 해제)
echo "🌐 2. 프론트엔드 배포 중..."
cd $FRONTEND_DIR
if [ -f "dist.tar" ]; then
    rm -rf dist
    tar -xvf dist.tar > /dev/null
    echo "   ✅ dist.tar 압축 해제 완료"
else
    echo "   ⚠️ dist.tar 파일이 없습니다. 기존 파일을 유지합니다."
fi

# 3. 권한 및 Nginx 재시작
echo "⚙️ 3. Nginx 및 권한 설정..."
sudo chmod 755 /home/ubuntu
sudo systemctl restart nginx
echo "   ✅ Nginx 서비스 재시작 완료"

# 4. 백엔드 실행 (작성하신 명령어 활용)
echo "☕ 4. 백엔드 실행 중 (Profile: dev)..."
cd $BACKEND_DIR
nohup java -Dspring.profiles.active=dev -jar $JAR_NAME > nohup.out 2>&1 &

echo "=========================================="
echo "✨ 배포가 완료되었습니다!"
echo "📄 로그 확인: tail -f $BACKEND_DIR/nohup.out"
echo "🌐 주소: http://175.45.200.235"
echo "=========================================="