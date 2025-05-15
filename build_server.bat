@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  PyInstaller packing server.py
echo ========================================
pyinstaller --clean --noconfirm server.spec

echo ========================================
echo Packing is complete, start organizing folders
echo ========================================

REM 定義目標資料夾
set DIST_DIR=dist\server
set OUTPUT_DIR=release_server

REM 如果 release_server 已存在就刪掉
if exist %OUTPUT_DIR% (
    echo remove old %OUTPUT_DIR%
    rmdir /s /q %OUTPUT_DIR%
)

REM 創建新資料夾
mkdir %OUTPUT_DIR%

REM 複製打包好的 EXE 和資源
xcopy %DIST_DIR%\* %OUTPUT_DIR%\ /s /e /y

echo ========================================
echo Finished! File moved to %OUTPUT_DIR%
echo ========================================
echo List :
dir %OUTPUT_DIR% /s

pause
