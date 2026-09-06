"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  tableFeatures,
  useTable,
  createSortedRowModel,
  rowSortingFeature,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  type ColumnVisibilityState,
  sortFn_datetime,
} from "@tanstack/react-table"

const TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { datetime: sortFn_datetime },
})

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown, ChevronsUpDown, Search, Columns, Plus, Download, ChevronLeft, ChevronRight, Trash } from "lucide-react"

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="size-3.5" />
  if (sorted === "desc") return <ArrowDown className="size-3.5" />
  return <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />
}

type AppTableProps<T extends { id: string }> = {
  data: T[]
  columns: ColumnDef<typeof TABLE_FEATURES, T>[]
  title: string
  description: string
  icon?: React.ReactNode
  searchKey?: string
  searchPlaceholder?: string
  createLabel?: string
  onCreate?: () => void
  onDeleteSelected?: (ids: string[]) => void
}

export function AppTable<T extends { id: string }>({
  data: initialData,
  columns,
  title,
  description,
  icon,
  searchKey = "name",
  searchPlaceholder = "Search...",
  createLabel = "Create",
  onCreate,
  onDeleteSelected,
}: AppTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = React.useState(initialData)

  React.useEffect(() => setData(initialData), [initialData])

  const table = useTable({
    features: TABLE_FEATURES,
    data,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })

  const filterValue = (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()

  function handleDeleteSelected() {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.id)
    if (onDeleteSelected) onDeleteSelected(ids)
    else {
      setData((prev) => prev.filter((row) => !ids.includes(row.id)))
      toast("Removed", { description: `${ids.length} ${ids.length === 1 ? "row" : "rows"} removed.` })
    }
    table.resetRowSelection()
  }

  const labelMap: Record<string, string> = {}
  columns.forEach((c: any) => {
    if (c.accessorKey) labelMap[c.accessorKey] = c.accessorKey
    if (c.id) labelMap[c.id] = c.id
  })

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">{icon}</div>}
          <div>
            <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description} • {data.length} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filterValue}
              onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-7 w-48 pl-8 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}><Columns className="size-3.5" /> View</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
                  <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={(v) => col.toggleVisibility(!!v)} closeOnClick={false}>
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {onCreate && (
            <Button size="sm" onClick={onCreate}><Plus className="size-3.5" /> {createLabel}</Button>
          )}
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium tabular-nums">{selectedCount} Selected</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" onClick={() => table.resetRowSelection()}>Clear</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={handleDeleteSelected}><Trash className="size-3.5" /> Remove</Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-border bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9",
                      header.column.id === "select" && "w-10 pl-4",
                      header.column.id === "actions" && "w-10 pr-4"
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className="border-b last:border-0 hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("py-3", cell.column.id === "select" && "pl-4", cell.column.id === "actions" && "pr-4")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{totalCount}</span> {totalCount === 1 ? "Result" : "Results"}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="size-7" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="size-3.5" /></Button>
            <span className="px-1 text-xs text-muted-foreground tabular-nums">Page {table.state.pagination.pageIndex + 1} of {Math.max(pageCount, 1)}</span>
            <Button variant="outline" size="icon" className="size-7" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  )
}

// Re-export SortIcon for columns
export { SortIcon }
