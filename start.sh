#!/bin/bash
echo "🚀 Instalando dependencias de Python..."
pip install -r requirements.txt

echo "📦 Instalando dependencias de Node.js..."
npm install

echo "🎯 Iniciando aplicación completa..."
npm run dev
