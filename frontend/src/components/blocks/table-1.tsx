"use client"

import * as React from "react"
import {
  sortFn_datetime,
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
  sortFns: {
    datetime: sortFn_datetime,
  },
})
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUp, ArrowDown, ChevronsUpDown, Ellipsis, Copy, Users, Search, Columns, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

export type DirectoryUser = {
  id: number
  name: string
  email: string
  role: "orgmenu" | "businessowners"
  created_at: string
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const roleVariant: Record<DirectoryUser["role"], "default" | "secondary"> = {
  orgmenu: "default",
  businessowners: "secondary",
};

function RoleBadge({ role }: { role: DirectoryUser["role"] }) {
  if (role === "orgmenu") {
    return (
      <Badge className="rounded-full border-amber-500/25 bg-amber-500/10 text-[11.5px] text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
        Org Menu
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-[11.5px] text-emerald-700 dark:text-emerald-300"
    >
      Business
    </Badge>
  );
}

const roleLabel: Record<DirectoryUser["role"], string> = {
  orgmenu: "Org Menu",
  businessowners: "Business",
}

const COLUMN_LABELS: Record<string, string> = {
  name: "User",
  role: "Role",
  created_at: "Joined",
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : dateFmt.format(parsed)
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return (
      <ArrowUp className="size-3.5" aria-hidden="true" />
    )
  if (sorted === "desc")
    return (
      <ArrowDown className="size-3.5" aria-hidden="true" />
    )
  return (
    <ChevronsUpDown className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
  )
}

const columns: ColumnDef<typeof TABLE_FEATURES, DirectoryUser>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
        aria-label="Select all users on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label={`Select ${row.original.name}`}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 inline-flex items-center gap-1 rounded-none px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        User
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    filterFn: (row, _id, value: string) => {
      const q = value.toLowerCase()
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.email.toLowerCase().includes(q)
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-8 shrink-0 border border-border">
            <AvatarFallback className="text-xs">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm leading-tight font-medium">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 inline-flex items-center gap-1 rounded-none px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        Role
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <RoleBadge role={row.original.role} />
    ),
  },
  {
    accessorKey: "created_at",
    sortFn: "datetime",
    header: ({ column }) => (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-none px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        Joined
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="block text-right text-xs text-muted-foreground tabular-nums">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={async () => {
                await navigator.clipboard.writeText(row.original.email)
                toast("Email copied", {
                  description: row.original.email,
                })
              }}
            >
              <Copy aria-hidden="true" />
              Copy email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

function toCsv(users: DirectoryUser[]) {
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`
  return [
    "id,name,email,role,created_at",
    ...users.map((u) =>
      [u.id, esc(u.name), esc(u.email), u.role, u.created_at].join(",")
    ),
  ].join("\n")
}

export default function TableBlock({
  users,
  loading,
  error,
  onRefresh,
}: {
  users: DirectoryUser[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useTable({
    features: TABLE_FEATURES,
    data: users,
    columns,
    getRowId: (row) => String(row.id),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })

  const nameFilter = (table.getColumn("name")?.getFilterValue() as string) ?? ""
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()

  function handleExport() {
    const rows =
      selectedCount > 0
        ? table.getFilteredSelectedRowModel().rows.map((r) => r.original)
        : table.getFilteredRowModel().rows.map((r) => r.original)
    const blob = new Blob([toCsv(rows)], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast("Export started", {
      description: `Exporting ${rows.length} users to CSV.`,
    })
  }

  return (
    <section className="flex h-full min-h-full w-full flex-1 flex-col text-foreground">
      <div className="flex w-full max-w-none flex-1 flex-col">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
              <Users className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="eyebrow">Directory · Admin</p>
              <h1 className="mt-0.5 text-[18px] leading-tight font-semibold tracking-[-0.02em]">
                Users
              </h1>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {loading
                  ? "Loading users..."
                  : `${users.length} registered users across all roles`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={nameFilter}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                placeholder="Search users..."
                className="h-9 w-52 rounded-xl bg-card pr-3 pl-9 text-[13px]"
                aria-label="Search users by name or email"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Toggle columns"
                    className="h-9 rounded-xl"
                  >
                    <Columns className="size-3.5" aria-hidden="true" />
                    View
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked === true)
                        }
                        closeOnClick={false}
                      >
                        {COLUMN_LABELS[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="h-9 rounded-xl">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport} disabled={users.length === 0} className="h-9 rounded-xl">
              <Download className="size-3.5" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-medium text-foreground tabular-nums">
                {selectedCount} Selected
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => table.resetRowSelection()}
              >
                Clear
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 rounded-lg bg-card">
              <Download className="size-3.5" aria-hidden="true" />
              Export selected
            </Button>
          </div>
        )}

        <div className="surface-card flex w-full flex-1 flex-col overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border/70 bg-muted/40 hover:bg-muted/40"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10",
                        header.column.id === "select" && "w-10 pl-4",
                        header.column.id === "name" && "pl-1",
                        header.column.id === "created_at" && "text-right",
                        header.column.id === "actions" && "w-10 pr-4"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" />
                      Loading users...
                    </span>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="border-b border-border/60 transition-colors duration-150 last:border-b-0 hover:bg-muted/40 data-[state=selected]:bg-emerald-500/[0.05]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3",
                          cell.column.id === "select" && "pl-4",
                          cell.column.id === "name" && "pl-1",
                          cell.column.id === "actions" && "pr-4"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No users match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-4 border-t border-border/70 bg-muted/30 px-4 py-2.5">
            <p className="text-[12.5px] text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{totalCount}</span>{" "}
              {totalCount === 1 ? "Result" : "Results"}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg bg-card"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
              </Button>
              <span className="px-1 font-mono text-[12px] text-muted-foreground tabular-nums">
                Page {table.state.pagination.pageIndex + 1} of{" "}
                {Math.max(pageCount, 1)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg bg-card"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  )
}
