"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table";
import { utils, writeFile } from "xlsx";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the data type for our table
export default interface SubmissionData {
  submission_id: string;
  Ad: string;
  Soyad: string;
  Mail_Adresi: string;
  Telefon: string;
  Egitim_Durumu: string;
  Universite: string;
  Bolum: string;
  Sinif: string;
  Aldigi_Dersler: string;
  Tarih: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface PremiumDataTableProps {
  data: SubmissionData[];
  dateIsShown?: boolean;
}

export function PremiumDataTable({
  data,
  dateIsShown = true,
}: PremiumDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [filteredData, setFilteredData] = useState<SubmissionData[]>(data);
  const [rowSelection, setRowSelection] = useState({});

  // Define columns with proper TypeScript typing
  const columns = useMemo<ColumnDef<SubmissionData>[]>(
    () => [
      {
        id: "submission_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            ID
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "submission_id",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono">
            {row.getValue("submission_id")}
          </Badge>
        ),
      },
      {
        id: "Ad",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Ad
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Ad",
      },
      {
        id: "Soyad",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Soyad
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Soyad",
      },
      {
        id: "Mail_Adresi",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Mail
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Mail_Adresi",
        cell: ({ row }) => (
          <span className="text-blue-600 font-medium">
            {row.getValue("Mail_Adresi")}
          </span>
        ),
      },
      {
        id: "Telefon",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Telefon
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Telefon",
      },
      {
        id: "Egitim_Durumu",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Eğitim
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Egitim_Durumu",
        cell: ({ row }) => {
          const value = row.getValue("Egitim_Durumu") as string;

          return <Badge className="font-medium">{value}</Badge>;
        },
      },
      {
        id: "Universite",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Universite
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Universite",
      },
      {
        id: "Bolum",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Bolum
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Bolum",
      },
      {
        id: "Sinif",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Sinif
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Sinif",
      },
      {
        id: "Aldigi_Dersler",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Dersler
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Aldigi_Dersler",
        cell: ({ row }) => {
          const value = row.getValue("Aldigi_Dersler") as string;
          const courses = typeof value === "string" ? value.split(", ") : [];

          return (
            <div className="max-w-md truncate" title={value}>
              {courses.length > 2
                ? `${courses[0]}, ${courses[1]} ve ${
                    courses.length - 2
                  } daha...`
                : value}
            </div>
          );
        },
      },
      {
        id: "Tarih",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-sm"
          >
            Tarih
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        accessorKey: "Tarih",
        cell: ({ row }) => {
          const value = row.getValue("Tarih") as string;
          // Format date
          try {
            const date = new Date(value);
            return format(date, "dd.MM.yyyy HH:mm", { locale: tr });
          } catch (e) {
            return value;
          }
        },
      },
    ],
    []
  );

  // Apply date range filter
  useEffect(() => {
    let filtered = [...data];

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.Tarih);

        if (dateRange.from && dateRange.to) {
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        } else if (dateRange.to) {
          return itemDate <= dateRange.to;
        }

        return true;
      });
    }

    setFilteredData(filtered);
  }, [data, dateRange]);

  // Set up the table with our filtered data
  const table = useReactTable<SubmissionData>({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Set up pagination options for larger datasets
  const pageSizeOptions = [10, 20, 30, 40, 50, 100, 250, 500];

  // Handle date range selection
  const handleDateRangeSelect = (range: string) => {
    const now = new Date();
    let from: Date | undefined = undefined;
    let to: Date | undefined = now;

    switch (range) {
      case "today":
        from = new Date();
        from.setHours(0, 0, 0, 0);
        to = new Date();
        to.setHours(23, 59, 59, 999);
        break;
      case "yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        from = new Date(yesterday.setHours(0, 0, 0, 0));
        to = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      }
      case "last7days":
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        break;
      case "last30days":
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        break;
      case "thisMonth": {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      }
      case "lastMonth": {
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case "clear":
        from = undefined;
        to = undefined;
        break;
    }

    setDateRange({ from, to });
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Simulate a delay for the export process
      await new Promise((resolve) => setTimeout(resolve, 800));

      const ws = utils.json_to_sheet(filteredData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Başvuru Verileri");
      writeFile(
        wb,
        `basvuru-verileri-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-lg border-none bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl font-bold">
            Başvuru Verileri{" "}
            <small className="text-gray-500">
              {filteredData.length > 0 &&
                `${filteredData.length.toLocaleString("tr-TR")}`}{" "}
              / {data.length > 0 && `${data.length.toLocaleString("tr-TR")}`}
            </small>
            {dateRange.from && dateRange.to && (
              <Badge variant="outline" className="ml-2 font-normal">
                {format(dateRange.from, "dd.MM.yyyy", { locale: tr })} -{" "}
                {format(dateRange.to, "dd.MM.yyyy", { locale: tr })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() =>
                    setDateRange({ from: undefined, to: undefined })
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Ara..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 w-full sm:w-[250px] h-9 bg-white"
              />
            </div>

            <div className="flex gap-2">
              {dateIsShown && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tarih Filtresi
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Tabs defaultValue="presets">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="presets">Hızlı Seçim</TabsTrigger>
                          <TabsTrigger value="calendar">Takvim</TabsTrigger>
                        </TabsList>
                        <TabsContent value="presets" className="p-4 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect("today")}
                            >
                              Bugün
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect("yesterday")}
                            >
                              Dün
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect("last7days")}
                            >
                              Son 7 Gün
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDateRangeSelect("last30days")
                              }
                            >
                              Son 30 Gün
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect("thisMonth")}
                            >
                              Bu Ay
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDateRangeSelect("lastMonth")}
                            >
                              Geçen Ay
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleDateRangeSelect("clear")}
                          >
                            Filtreyi Temizle
                          </Button>
                        </TabsContent>
                        <TabsContent value="calendar" className="p-0 space-y-2">
                          <div className="flex flex-col sm:flex-row gap-0">
                            <div className="border-r p-2">
                              <div className="text-sm font-medium mb-1 px-1">
                                Başlangıç
                              </div>
                              <CalendarComponent
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) =>
                                  setDateRange({ ...dateRange, from: date })
                                }
                                initialFocus
                                locale={tr}
                              />
                            </div>
                            <div className="p-2">
                              <div className="text-sm font-medium mb-1 px-1">
                                Bitiş
                              </div>
                              <CalendarComponent
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) => {
                                  if (date) {
                                    // Set time to end of day
                                    date.setHours(23, 59, 59, 999);
                                  }
                                  setDateRange({ ...dateRange, to: date });
                                }}
                                initialFocus
                                locale={tr}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDateRange({ from: undefined, to: undefined })
                              }
                            >
                              Temizle
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </PopoverContent>
                  </Popover>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrele
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Sütun Görünürlüğü</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id
                          .replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Gelişmiş Filtreler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left p-3 font-medium text-gray-600"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-gray-500"
                  >
                    {globalFilter || dateRange.from || dateRange.to
                      ? "Filtrelere uygun veri bulunamadı"
                      : "Veri bulunamadı"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Toplam {table.getFilteredRowModel().rows.length} kayıt
              {table.getFilteredRowModel().rows.length !== data.length && (
                <span className="text-gray-500">
                  {" "}
                  (Filtrelenmiş: {data.length} kayıttan)
                </span>
              )}
            </p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
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
                {table.getState().pagination.pageIndex + 1} /{" "}
                {table.getPageCount() || 1}
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
  );
}
