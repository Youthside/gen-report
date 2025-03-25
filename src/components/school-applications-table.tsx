"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryDataTable } from "@/components/summary-data-table"
import { Badge } from "@/components/ui/badge"

// Define the data type for school applications
import { SummaryData } from "@/components/summary-data-table"

export interface SchoolApplicationData extends SummaryData {
  okul: string
  basvuru: number
}

interface SchoolApplicationsTableProps {
  data: SchoolApplicationData[]
}

export function SchoolApplicationsTable({ data }: SchoolApplicationsTableProps) {
  // Define columns
  const columns = useMemo<ColumnDef<SchoolApplicationData>[]>(
    () => [
      {
        id: "okul",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            <School className="mr-2 h-4 w-4 text-primary" />
            Universite
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "okul",
        cell: ({ row }) => <div className="font-medium">{row.getValue("okul")}</div>,
      },
      {
        id: "basvuru",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Başvuru Sayısı
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "basvuru",
        cell: ({ row }) => {
          const value = row.getValue("basvuru") as number

          // Determine badge color based on value range
          let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline"

          if (value > 5000) badgeVariant = "destructive"
          else if (value > 2500) badgeVariant = "secondary"
          else if (value > 1000) badgeVariant = "default"

          return (
            <Badge variant={badgeVariant} className="font-medium">
              {value.toLocaleString("tr-TR")}
            </Badge>
          )
        },
      },
    ],
    [],
  )

  return (
    <SummaryDataTable
      data={data}
      columns={columns}
      title="Universite"
      searchPlaceholder="Universite ara..."
      exportFileName="universite-basvurulari"
      valueLabel="üniversite"
    />
  )
}

