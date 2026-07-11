@echo off
REM ============================================
REM  Pelu Adventures - lanzador para Celeste
REM  Inicia un mini servidor y abre el juego.
REM ============================================
cd /d "%~dp0"
echo Iniciando Pelu Adventures...
start "" http://localhost:8753/
python -m http.server 8753
