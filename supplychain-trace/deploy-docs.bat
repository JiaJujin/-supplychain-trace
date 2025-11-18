@echo off
setlocal
cd /d "%~dp0\my_project"
call npm run build
cd /d "%~dp0"
if exist docs (
  rd /s /q docs
)
mkdir docs
xcopy /e /i /y "my_project\build\*" "docs\"
echo Done. Commit and push, then enable GitHub Pages (main/docs).
endlocal