"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Search, Download, ArrowUpDown, Loader2, AlertCircle, Car } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CarData {
  titulo: string
  precio_ars: number
  vendedor: string
  modelo: string
  km: number
  ubic: string
  link: string
  es_usd: boolean
}

interface ApiResponse {
  datos: CarData[]
  promedio: number
  price_min: number
  price_max: number
  km_min: number
  km_max: number
}

// Sample data for preview
const sampleData: CarData[] = [
  {
    titulo: "Peugeot 308 Feline 1.6 HDI 2020 - Excelente Estado",
    precio_ars: 8500000,
    vendedor: "Concesionaria Premium",
    modelo: "2020",
    km: 45000,
    ubic: "Capital Federal",
    link: "https://mercadolibre.com.ar",
    es_usd: false,
  },
  {
    titulo: "Peugeot 308 Feline 1.6 HDI 2019 - Único Dueño",
    precio_ars: 11550000, // 10000 USD * 1155
    vendedor: "Particular",
    modelo: "2019",
    km: 32000,
    ubic: "Zona Norte",
    link: "https://mercadolibre.com.ar",
    es_usd: true,
  },
  {
    titulo: "Peugeot 308 Feline 1.6 HDI 2021 - Full Equipo",
    precio_ars: 9200000,
    vendedor: "Automotora Central",
    modelo: "2021",
    km: 28000,
    ubic: "Córdoba Capital",
    link: "https://mercadolibre.com.ar",
    es_usd: false,
  },
  {
    titulo: "Peugeot 308 Feline 1.6 HDI 2018 - Impecable",
    precio_ars: 7800000,
    vendedor: "Concesionaria Sur",
    modelo: "2018",
    km: 65000,
    ubic: "La Plata",
    link: "https://mercadolibre.com.ar",
    es_usd: false,
  },
]

export default function ScrapingPanel() {
  const [searchTerm, setSearchTerm] = useState("Peugeot 308 Feline 1.6 HDI")
  const [selectedYear, setSelectedYear] = useState("2020")
  const [data, setData] = useState<CarData[]>(sampleData)
  const [loading, setLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([7500000, 12000000])
  const [kmRange, setKmRange] = useState([0, 70000])
  const [sortConfig, setSortConfig] = useState<{ key: keyof CarData; direction: "asc" | "desc" }>({
    key: "precio_ars",
    direction: "asc",
  })
  const [hasSearched, setHasSearched] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiResponse>({
    datos: sampleData,
    promedio: 9262500,
    price_min: 7800000,
    price_max: 11550000,
    km_min: 28000,
    km_max: 65000,
  })

  // Calculate min/max values from data
  const priceMin = useMemo(() => apiData?.price_min || 0, [apiData])
  const priceMax = useMemo(() => apiData?.price_max || 15000000, [apiData])
  const kmMin = useMemo(() => apiData?.km_min || 0, [apiData])
  const kmMax = useMemo(() => apiData?.km_max || 200000, [apiData])

  // Initialize ranges when data changes
  // useEffect(() => {
  //   if (apiData && apiData.datos.length > 0) {
  //     const priceRange30 = Math.round(priceMin + (priceMax - priceMin) * 0.3)
  //     const priceRange70 = Math.round(priceMin + (priceMax - priceMin) * 0.7)
  //     setPriceRange([priceRange30, priceRange70])
  //     setKmRange([kmMin, kmMax])
  //   }
  // }, [apiData, priceMin, priceMax, kmMin, kmMax])

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filtered = data.filter(
      (item) =>
        item.precio_ars >= priceRange[0] &&
        item.precio_ars <= priceRange[1] &&
        item.km >= kmRange[0] &&
        item.km <= kmRange[1],
    )

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, priceRange, kmRange, sortConfig])

  // Calculate average price
  const averagePrice = useMemo(() => {
    if (filteredData.length === 0) return 0
    return filteredData.reduce((sum, item) => sum + item.precio_ars, 0) / filteredData.length
  }, [filteredData])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Por favor ingresa la versión del vehículo")
      return
    }

    setLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      // Simular búsqueda
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En una implementación real, aquí iría la llamada a la API
      setData(sampleData)
      setApiData({
        datos: sampleData,
        promedio: 9262500,
        price_min: 7800000,
        price_max: 11550000,
        km_min: 28000,
        km_max: 65000,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al realizar la búsqueda")
      setData([])
      setApiData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: keyof CarData) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleExport = async () => {
    alert("Función de exportación disponible en la versión completa")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR").format(num)
  }

  const years = Array.from({ length: 11 }, (_, i) => 2015 + i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Car className="h-8 w-8 text-blue-400" />
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MeLi - Opencars
              </CardTitle>
            </div>
            <p className="text-gray-400 text-lg">Referencia de precios MercadoLibre para vehículos</p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-500 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Ej: Peugeot 308 Feline 1.6 HDI"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-32 border-gray-600 bg-gray-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white focus:bg-gray-700">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
              {data.length > 0 && (
                <Button onClick={handleExport} className="bg-green-600 text-white hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{filteredData.length}</div>
                <div className="text-sm text-gray-400">Vehículos encontrados</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatPrice(averagePrice)}</div>
                <div className="text-sm text-gray-400">Precio promedio</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatPrice(priceMin)} - {formatPrice(priceMax)}
                </div>
                <div className="text-sm text-gray-400">Rango de precios</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {formatNumber(kmMin)} - {formatNumber(kmMax)} km
                </div>
                <div className="text-sm text-gray-400">Rango kilómetros</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {data.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-gray-200">Precio (ARS)</label>
                  <div className="text-sm text-gray-300">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={priceMin}
                    max={priceMax}
                    step={100000}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Kilometers Filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-gray-200">Kilómetros</label>
                  <div className="text-sm text-gray-300">
                    {formatNumber(kmRange[0])} - {formatNumber(kmRange[1])} km
                  </div>
                </div>
                <div className="px-2">
                  <Slider
                    value={kmRange}
                    onValueChange={setKmRange}
                    min={kmMin}
                    max={kmMax}
                    step={5000}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {data.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">Resultados ({filteredData.length} vehículos)</CardTitle>
                <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                  Promedio: {formatPrice(averagePrice)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-600 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50">
                      {[
                        { key: "titulo", label: "Título" },
                        { key: "precio_ars", label: "Precio (ARS)" },
                        { key: "vendedor", label: "Vendedor" },
                        { key: "modelo", label: "Año" },
                        { key: "km", label: "Kilómetros" },
                        { key: "ubic", label: "Ubicación" },
                        { key: "link", label: "Enlace" },
                      ].map(({ key, label }) => (
                        <TableHead
                          key={key}
                          className="cursor-pointer hover:bg-gray-600/50 transition-colors text-gray-200"
                          onClick={() => handleSort(key as keyof CarData)}
                        >
                          <div className="flex items-center gap-1">
                            {label}
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-700/30 border-gray-600 transition-colors">
                        <TableCell className="font-medium max-w-xs text-white">{item.titulo}</TableCell>
                        <TableCell
                          className={`font-semibold text-white ${item.es_usd ? "bg-red-900/30 text-red-300" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            {formatPrice(item.precio_ars)}
                            {item.es_usd && (
                              <Badge variant="destructive" className="text-xs bg-red-800 text-red-200 border-red-700">
                                USD
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-200">{item.vendedor}</TableCell>
                        <TableCell className="text-gray-200">{item.modelo}</TableCell>
                        <TableCell className="text-gray-200">{formatNumber(item.km)} km</TableCell>
                        <TableCell className="text-gray-200">{item.ubic}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-blue-600/20 text-blue-300 border-blue-600 hover:bg-blue-600/30 hover:border-blue-500 transition-colors"
                          >
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ver en ML
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {/* {data.length === 0 && !loading && hasSearched && !error && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
            </CardContent>
          </Card>
        )} */}

        {/* Loading State */}
        {loading && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">Buscando vehículos...</h3>
              <p className="text-gray-400">Esto puede tomar unos momentos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
