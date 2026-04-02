@echo off
set PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%
cd /d "%~dp0"
docker compose -p maypm -f compose.yaml up -d --build
pause