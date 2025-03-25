"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table"
import { utils, writeFile } from "xlsx"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Search, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Generic interface for summary data
export interface SummaryData {
  [key: string]: string | number
}

interface SummaryDataTableProps<T extends SummaryData> {
  data: T[]
  columns: ColumnDef<T>[]
  title: string
  searchPlaceholder?: string
  exportFileName?: string
  valueLabel?: string
}

export function SummaryDataTable<T extends SummaryData>({
  data,
  columns,
  title,
  searchPlaceholder = "Ara...",
  exportFileName = "veriler",
  valueLabel = "Kayıt",
}: SummaryDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Set up the table
  const table = useReactTable<T>({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Calculate total count
  // const totalCount = useMemo(() => {
  //   // Find the column that has numeric values (assuming it's the count/basvuru column)
  //   const countKey = Object.keys(data[0] || {}).find((key) => typeof data[0][key] === "number") || ""

  //   return data.reduce((sum, item) => {
  //     const value = item[countKey]
  //     return sum + (typeof value === "number" ? value : 0)
  //   }, 0)
  // }, [data])

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setIsExporting(true)

      // Simulate a delay for the export process
      await new Promise((resolve) => setTimeout(resolve, 800))

      const ws = utils.json_to_sheet(data)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, title)
      writeFile(wb, `${exportFileName}-${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {/* <p className="text-sm text-gray-500 mt-1">Toplam {totalCount.toLocaleString("tr-TR")} başvuru</p> */}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 w-full sm:w-[250px] h-9 bg-white"
              />
            </div>

            <Button
              onClick={exportToExcel}
              disabled={isExporting}
              className="h-9 bg-primary hover:bg-primary-600 text-white"
            >
              {isExporting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Aktarılıyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Excel'e Aktar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left p-3 font-medium text-gray-600">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className={`
                      border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                    {globalFilter ? "Arama sonucu bulunamadı" : "Veri bulunamadı"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Toplam {table.getFilteredRowModel().rows.length} {valueLabel}
              {table.getFilteredRowModel().rows.length !== data.length && (
                <span className="text-gray-500"> (Filtrelenmiş: {data.length} kayıttan)</span>
              )}
            </p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">kayıt/sayfa</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600 mx-2">
              Sayfa{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
              </strong>
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

