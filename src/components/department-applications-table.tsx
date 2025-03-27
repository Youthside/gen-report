"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryDataTable } from "@/components/summary-data-table"
import { Badge } from "@/components/ui/badge"

// Define the data type for department applications
import type { SummaryData } from "@/components/summary-data-table"

export interface DepartmentApplicationData extends SummaryData {
  bolum: string
  basvuru: number
  [key: string]: string | number // Add index signature to match SummaryData
}

interface DepartmentApplicationsTableProps {
  data: DepartmentApplicationData[]
}

export function DepartmentApplicationsTable({ data }: DepartmentApplicationsTableProps) {
  // Define columns
  const columns = useMemo<ColumnDef<DepartmentApplicationData>[]>(
    () => [
      {
        id: "bolum",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            <BookOpen className="mr-2 h-4 w-4 text-secondary" />
            Bolum
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "bolum",
        cell: ({ row }) => <div className="font-medium">{row.getValue("bolum")}</div>,
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
          let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "outline"

          if (value > 5000) badgeVariant = "destructive"
          else if (value > 3000) badgeVariant = "secondary"
          else if (value > 1000) badgeVariant = "default"

          return (
            <Badge variant={badgeVariant} className="font-medium">
              {value ? value.toLocaleString("tr-TR") : "N/A"}
            </Badge>
          );
        },
      },
    ],
    [],
  )

  return (
    <SummaryDataTable
      data={data}
      columns={columns}
      title="Bolum"
      searchPlaceholder="Bolum ara..."
      exportFileName="bolum-basvurulari"
      valueLabel="bölüm"
    />
  )
}

