@echo off
setlocal
cd /d "%~dp0\my_project"
start "" http://localhost:3000
if exist node_modules\.bin\react-scripts.cmd (
  call node_modules\.bin\react-scripts.cmd start
) else (
  node node_modules\react-scripts\scripts\start.js
)
endlocal