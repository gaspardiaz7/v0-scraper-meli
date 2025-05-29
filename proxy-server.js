const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")

const app = express()
const PORT = 5000

console.log("🚀 Proxy Directo - Sin verificaciones")

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Health check del proxy
app.get("/health", (req, res) => {
  res.json({ status: "proxy ok", timestamp: new Date().toISOString() })
})

// Test endpoint
app.get("/test-api", async (req, res) => {
  try {
    const pythonHealth = await fetch("http://localhost:5001/health")
    const healthData = await pythonHealth.json()
    res.json({
      proxy_status: "ok",
      python_api: healthData,
      message: "Conexión exitosa",
    })
  } catch (error) {
    res.status(503).json({
      error: error.message,
      message: "No se puede conectar con Python",
    })
  }
})

// Proxy para API (Python) - SIN VERIFICACIONES
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    timeout: 60000,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 API: ${req.method} ${req.url} -> http://localhost:5001${req.url}`)
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`✅ API Response: ${proxyRes.statusCode} for ${req.url}`)
    },
    onError: (err, req, res) => {
      console.error(`❌ API Error: ${err.message} for ${req.url}`)
      if (!res.headersSent) {
        res.status(503).json({
          error: "Python API no disponible",
          details: err.message,
          url: req.url,
        })
      }
    },
  }),
)

// Proxy para Frontend (Next.js) - SIN VERIFICACIONES
app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    timeout: 30000,
    onProxyReq: (proxyReq, req, res) => {
      if (req.url !== "/favicon.ico") {
        console.log(`🔄 Frontend: ${req.method} ${req.url}`)
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      if (req.url !== "/favicon.ico") {
        console.log(`✅ Frontend Response: ${proxyRes.statusCode}`)
      }
    },
    onError: (err, req, res) => {
      console.error(`❌ Frontend Error: ${err.message}`)
      if (!res.headersSent) {
        res.status(503).send(`
          <html>
            <body style="font-family: Arial; padding: 50px; text-align: center; background: #1f2937; color: white;">
              <h1>🚧 Frontend no disponible</h1>
              <p>Error: ${err.message}</p>
              <button onclick="location.reload()">Recargar</button>
            </body>
          </html>
        `)
      }
    },
  }),
)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Proxy Directo corriendo en puerto ${PORT}`)
  console.log(`🌐 Aplicación: http://localhost:5000`)
  console.log(`🔍 Health: http://localhost:5000/health`)
  console.log(`🧪 Test API: http://localhost:5000/test-api`)
})
