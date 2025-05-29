import { NextResponse } from "next/server"
// Comentamos la importación real para no ejecutarla
// import { scrapearMercadoLibre } from "@/lib/scraper-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { version, year } = body

    console.log(`API MOCK: Recibida búsqueda para ${version} ${year}`)

    // Datos mockeados
    const mockData = {
      datos: [
        {
          titulo: `Vehículo Mock 1 ${version} ${year}`,
          link: "#",
          vendedor: "Concesionaria Mock",
          bruto: 5000000,
          es_usd: false,
          modelo: year,
          km: 15000,
          ubic: "Buenos Aires",
          precio_ars: 5000000,
        },
        {
          titulo: `Vehículo Mock 2 ${version} ${year} (USD)`,
          link: "#",
          vendedor: "Particular Mock",
          bruto: 20000,
          es_usd: true,
          modelo: year,
          km: 5000,
          ubic: "Córdoba",
          precio_ars: 20000 * 1155, // Asumiendo un dólar mock
        },
      ],
      promedio: 12875000, // Promedio mock
      price_min: 5000000,
      price_max: 23100000,
      km_min: 5000,
      km_max: 15000,
    }

    // Simular un pequeño retraso
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error en /api/search (MOCK):", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido en el servidor"
    return NextResponse.json({ error: "Error al procesar la búsqueda (MOCK).", details: errorMessage }, { status: 500 })
  }
}
