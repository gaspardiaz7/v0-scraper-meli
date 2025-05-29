# Referencia MercadoLibre Opencars

Aplicación moderna para scraping y análisis de vehículos en MercadoLibre Argentina.

## 🚀 Inicio Rápido

### Opción 1: Script automático (Recomendado)

**Windows:**
\`\`\`bash
start.bat
\`\`\`

**Linux/Mac:**
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

### Opción 2: Manual

1. **Instalar dependencias de Python:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. **Instalar dependencias de Node.js:**
\`\`\`bash
npm install
\`\`\`

3. **Ejecutar la aplicación:**
\`\`\`bash
npm run dev
\`\`\`

## 📋 Requisitos

- Python 3.8+
- Node.js 18+
- npm o yarn

## 🔧 Comandos Disponibles

- `npm run dev` - Ejecuta frontend y backend simultáneamente
- `npm run dev:next` - Solo frontend (puerto 3000)
- `npm run dev:python` - Solo backend (puerto 5000)
- `npm run build` - Build de producción
- `npm run install:python` - Instala solo dependencias Python

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 📁 Estructura del Proyecto

\`\`\`
├── api/
│   └── scraper.py          # Backend Python (Flask)
├── app/
│   └── page.tsx           # Frontend React (Next.js)
├── components/
│   └── ui/                # Componentes UI
├── requirements.txt       # Dependencias Python
├── package.json          # Dependencias Node.js
├── start.sh              # Script de inicio (Linux/Mac)
└── start.bat             # Script de inicio (Windows)
\`\`\`

## 🔍 Funcionalidades

- ✅ Scraping en tiempo real de MercadoLibre
- ✅ Filtros dinámicos por precio y kilómetros
- ✅ Cálculo automático de promedios
- ✅ Exportación a Excel
- ✅ Interfaz moderna y responsive
- ✅ Manejo de errores y estados de carga

## 🛠️ Tecnologías

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Python 3.8+
- Flask
- BeautifulSoup4
- Pandas
- OpenPyXL
