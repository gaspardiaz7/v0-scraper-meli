import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MeLi - Opencars",
  description: "Referencia de precios MercadoLibre para Opencars",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="https://oa.opencars.com.ar/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
