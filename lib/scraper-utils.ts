import * as cheerio from "cheerio" // Necesitaremos cheerio para parsear HTML

const BNA_URL = "https://www.bna.com.ar/"
const DEFAULT_DOLAR_VALUE = 1155.0 // Valor por defecto si falla la obtención

interface CarDataRow {
  titulo: string
  link: string
  vendedor: string
  bruto: number
  es_usd: boolean
  modelo: string // Este es el año del vehículo
  km: number
  ubic: string
  precio_ars?: number // Se calculará después
}

export async function obtenerDolarOficial(): Promise<number> {
  try {
    const response = await fetch(BNA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cachear por 1 hora
    })
    if (!response.ok) {
      console.error(`Error fetching BNA: ${response.status}`)
      return DEFAULT_DOLAR_VALUE
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    const tag = $("span.value.sell") // Ajusta el selector si es necesario

    if (tag.length > 0) {
      const textValue = tag.first().text().trim().replace(/\./g, "").replace(",", ".")
      const floatValue = Number.parseFloat(textValue)
      return isNaN(floatValue) ? DEFAULT_DOLAR_VALUE : floatValue
    }
    return DEFAULT_DOLAR_VALUE
  } catch (error) {
    console.error("Error en obtenerDolarOficial:", error)
    return DEFAULT_DOLAR_VALUE
  }
}

// Aquí irá la función principal de scraping
export async function scrapearMercadoLibre(
  version: string,
  year: string,
): Promise<{
  datos: CarDataRow[]
  promedio: number
  price_min: number
  price_max: number
  km_min: number
  km_max: number
}> {
  const query = `${version} ${year}`
  const urlBase = "https://autos.mercadolibre.com.ar/" + query.replace(/\s+/g, "-").toLowerCase()
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  }

  const allRows: CarDataRow[] = []
  let offset = 0
  let page = 1
  const MAX_PAGES = 5 // Limitar el número de páginas para evitar baneos/timeout

  console.log(`Iniciando scraping para: ${query} en ${urlBase}`)

  for (let p = 0; p < MAX_PAGES; p++) {
    const url = page === 1 ? urlBase : `${urlBase}_Desde_${offset + 1}`
    console.log(`Scrapeando página ${page}: ${url}`)

    try {
      const resp = await fetch(url, { headers })
      if (!resp.ok) {
        console.error(`Error fetching page ${page}: ${resp.status} ${resp.statusText}`)
        break
      }
      const html = await resp.text()
      const $ = cheerio.load(html)

      const items = $("li.ui-search-layout__item")
      if (items.length === 0) {
        console.log("No se encontraron más items.")
        break
      }

      items.each((_i, el) => {
        const item = $(el)
        const cardContent = item.find("div.ui-search-result__content-wrapper") // Ajustar selector si es necesario
        if (!cardContent.length) return

        const titleAnchor = cardContent.find("a.ui-search-item__group__element.ui-search-link__title-card")
        const titulo = titleAnchor.find("h2.ui-search-item__title").text().trim() || "N/D"
        const link = titleAnchor.attr("href") || "#"

        // Vendedor (puede no estar siempre presente o ser difícil de obtener consistentemente)
        // const vendedor = cardContent.find("span.poly-component__seller").text().trim() || ""; // Ejemplo, ajustar
        const vendedor = "N/A" // Simplificado por ahora

        const priceRaw = cardContent.find("span.andes-money-amount__fraction").first().text().trim()
        const priceSymbol = cardContent.find("span.andes-money-amount__currency-symbol").first().text().trim()

        const bruto = Number.parseInt(priceRaw.replace(/\./g, ""), 10) || 0
        const es_usd = priceSymbol === "U$S"

        const attributes = cardContent.find("ul.ui-search-card-attributes li")
        const modeloAttr = attributes.eq(0).text().trim() // Año del vehículo
        const kmAttr = attributes.eq(1).text().trim()

        const km = Number.parseInt(kmAttr.replace(/[^\d]/g, ""), 10) || 0

        const ubic =
          cardContent.find("span.ui-search-item__group__element.ui-search-item__location").text().trim() || ""

        allRows.push({
          titulo,
          link,
          vendedor,
          bruto,
          es_usd,
          modelo: modeloAttr, // Este es el año del vehículo
          km,
          ubic,
        })
      })

      offset += items.length
      page += 1

      // Pequeña pausa para no saturar el servidor de MercadoLibre
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error procesando página ${page}:`, error)
      break
    }
  }

  console.log(`Scraping finalizado. Total de items crudos: ${allRows.length}`)

  if (allRows.length === 0) {
    return { datos: [], promedio: 0, price_min: 0, price_max: 0, km_min: 0, km_max: 0 }
  }

  const dolar = await obtenerDolarOficial()
  const processedRows = allRows.map((r) => ({
    ...r,
    precio_ars: r.es_usd ? r.bruto * dolar : r.bruto,
  }))

  const preciosArs = processedRows.map((r) => r.precio_ars as number).filter((p) => p > 0)
  const kms = processedRows.map((r) => r.km).filter((k) => k >= 0)

  const promedio = preciosArs.length > 0 ? Math.round(preciosArs.reduce((a, b) => a + b, 0) / preciosArs.length) : 0
  const price_min = preciosArs.length > 0 ? Math.min(...preciosArs) : 0
  const price_max = preciosArs.length > 0 ? Math.max(...preciosArs) : 0
  const km_min = kms.length > 0 ? Math.min(...kms) : 0
  const km_max = kms.length > 0 ? Math.max(...kms) : 0

  console.log(`Dólar usado: ${dolar}, Promedio ARS: ${promedio}`)

  return {
    datos: processedRows,
    promedio,
    price_min,
    price_max,
    km_min,
    km_max,
  }
}
