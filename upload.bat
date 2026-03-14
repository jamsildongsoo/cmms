@echo off
chcp 65001
set KEY_PATH="C:\projects\cmms\docs\project-cmms-1.pem"
set SERVER="ubuntu@175.45.200.235"

echo 🔨 프론트엔드 빌드 중...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ 프론트엔드 빌드 실패! 에러를 확인하세요.
    cd ..
    pause
    exit /b 1
)
echo 📦 프론트엔드 압축 중...
tar -cvf ../dist.tar dist
cd ..

echo 🚚 프론트엔드 전송 중...
scp -i %KEY_PATH% ./dist.tar %SERVER%:/home/ubuntu/cmms/frontend/
if %ERRORLEVEL% neq 0 (
    echo ❌ 프론트엔드 전송 실패! 네트워크를 확인하세요.
    pause
    exit /b 1
)

echo 🔨 백엔드 빌드 중...
cd backend
call gradlew build -x test
if %ERRORLEVEL% neq 0 (
    echo ❌ 백엔드 빌드 실패! 에러를 확인하세요.
    cd ..
    pause
    exit /b 1
)
cd ..

echo 🚚 백엔드 전송 중...
scp -i %KEY_PATH% ./backend/build/libs/cmms-backend-0.0.1-SNAPSHOT.jar %SERVER%:/home/ubuntu/cmms/backend/
if %ERRORLEVEL% neq 0 (
    echo ❌ 백엔드 전송 실패! 네트워크를 확인하세요.
    pause
    exit /b 1
)

echo ✅ 전송 완료! 이제 서버에서 ./start-dev.sh를 실행하세요.
pause
