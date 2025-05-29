"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Search, Download, ArrowUpDown, Loader2, AlertCircle } from "lucide-react"
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

export default function ScrapingPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [data, setData] = useState<CarData[]>([])
  const [loading, setLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 15000000])
  const [kmRange, setKmRange] = useState([0, 200000])
  const [sortConfig, setSortConfig] = useState<{ key: keyof CarData; direction: "asc" | "desc" }>({
    key: "precio_ars",
    direction: "asc",
  })
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiData, setApiData] = useState<ApiResponse | null>(null)

  // Calculate min/max values from data
  const priceMin = useMemo(() => apiData?.price_min || 0, [apiData])
  const priceMax = useMemo(() => apiData?.price_max || 15000000, [apiData])
  const kmMin = useMemo(() => apiData?.km_min || 0, [apiData])
  const kmMax = useMemo(() => apiData?.km_max || 200000, [apiData])

  // Initialize ranges when data changes
  useEffect(() => {
    if (apiData && apiData.datos.length > 0) {
      const priceRange30 = Math.round(priceMin + (priceMax - priceMin) * 0.3)
      const priceRange70 = Math.round(priceMin + (priceMax - priceMin) * 0.7)
      setPriceRange([priceRange30, priceRange70])
      setKmRange([kmMin, kmMax])
    }
  }, [apiData, priceMin, priceMax, kmMin, kmMax])

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filtered = data.filter(
      (item) =>
        item.precio_ars >= priceRange[0] &&
        item.precio_ars <= priceRange[1] &&
        item.km >= kmRange[0] &&
        item.km <= kmRange[1] &&
        item.modelo === selectedYear,
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
  }, [data, priceRange, kmRange, selectedYear, sortConfig])

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
      // Usar ruta relativa para aprovechar el proxy
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: searchTerm,
          year: selectedYear,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result: ApiResponse = await response.json()
      setApiData(result)
      setData(result.datos)
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
    if (!searchTerm.trim()) {
      setError("Realiza una búsqueda antes de exportar")
      return
    }

    try {
      // Usar ruta relativa para aprovechar el proxy
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: searchTerm,
          year: selectedYear,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al exportar")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${searchTerm}-${selectedYear}-${new Date().toLocaleDateString()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Error al exportar el archivo")
    }
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
    <div className="min-h-screen bg-gray-800 p-4 relative" style={{ isolation: "isolate" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">MeLi - Opencars</CardTitle>
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
                className="flex-1 border-gray-600 bg-gray-600 text-white placeholder:text-gray-300"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-32 border-gray-600 bg-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white focus:bg-gray-600">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
              {data.length > 0 && (
                <Button onClick={handleExport} className="bg-gray-600 text-white hover:bg-gray-500">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {data.length > 0 && (
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-white">Filtros</CardTitle>
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
                    step={(priceMax - priceMin) / 10}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{Math.round(((priceRange[0] - priceMin) / (priceMax - priceMin)) * 10) * 10}%</span>
                  <span>{Math.round(((priceRange[1] - priceMin) / (priceMax - priceMin)) * 10) * 10}%</span>
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
                    step={10000}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {data.length > 0 && (
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">Resultados ({filteredData.length} vehículos)</CardTitle>
                <Badge className="text-lg px-3 py-1 bg-blue-600 text-white border-blue-500">
                  Promedio: {formatPrice(averagePrice)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-600 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-600 border-gray-500 hover:bg-gray-500">
                      {[
                        { key: "titulo", label: "Título" },
                        { key: "precio_ars", label: "Precio (ARS)" },
                        { key: "vendedor", label: "Vendedor" },
                        { key: "modelo", label: "Modelo" },
                        { key: "km", label: "Kilómetros" },
                        { key: "ubic", label: "Ubicación" },
                        { key: "link", label: "Enlace" },
                      ].map(({ key, label }) => (
                        <TableHead
                          key={key}
                          className="cursor-pointer hover:bg-gray-500 transition-colors text-gray-200"
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
                      <TableRow key={index} className="hover:bg-gray-600 border-gray-600">
                        <TableCell className="font-medium max-w-xs truncate text-white">{item.titulo}</TableCell>
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
                            className="bg-gray-600 text-white border-gray-600 hover:bg-gray-500 hover:border-gray-500"
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
        {data.length === 0 && !loading && hasSearched && !error && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="bg-gray-700 border-gray-600">
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
