import { useCallback } from 'react'

interface ExportHandlersProps {
  headers: string[]
  data: string[][]
}

export function useExportHandlers({ headers, data }: ExportHandlersProps) {
  const exportCSV = useCallback(() => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enriched-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [headers, data])

  const exportExcel = useCallback(() => {
    const csvContent = [
      headers.join("\t"),
      ...data.map((row) => row.join("\t")),
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enriched-data.xls"
    a.click()
    URL.revokeObjectURL(url)
  }, [headers, data])

  const exportJSON = useCallback(() => {
    const jsonData = data.map(row => 
      headers.reduce((obj, header, index) => {
        obj[header] = row[index]
        return obj
      }, {} as Record<string, string>)
    )
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "enriched-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [headers, data])

  const handleExport = useCallback((format: 'csv' | 'excel' | 'json') => {
    switch (format) {
      case 'csv':
        exportCSV()
        break
      case 'excel':
        exportExcel()
        break
      case 'json':
        exportJSON()
        break
    }
  }, [exportCSV, exportExcel, exportJSON])

  return {
    exportCSV,
    exportExcel,
    exportJSON,
    handleExport
  }
}