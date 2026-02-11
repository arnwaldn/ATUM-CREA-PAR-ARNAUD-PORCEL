# Template: Dashboard Application

## Overview

Template complet pour créer un dashboard d'analyse de données avec visualisations, filtres avancés, exports, et temps réel. Adapté pour analytics, monitoring, et business intelligence.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR, streaming |
| **Auth** | Clerk | Simple, secure |
| **Database** | Supabase (PostgreSQL) | Realtime, time-series |
| **ORM** | Prisma | Type-safe queries |
| **Charts** | Recharts / Tremor | React-native, responsive |
| **Tables** | TanStack Table | Sorting, filtering, pagination |
| **UI** | shadcn/ui + TailwindCSS | Dashboard components |
| **Export** | xlsx / jsPDF | Excel, PDF export |
| **Realtime** | Supabase Realtime | Live updates |

---

## STRUCTURE PROJET

```
my-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                  # Overview/Home
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx              # Analytics dashboard
│   │   │   │   └── [metric]/page.tsx     # Drill-down
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx              # Reports list
│   │   │   │   └── [id]/page.tsx         # Report detail
│   │   │   ├── data/
│   │   │   │   ├── page.tsx              # Data explorer
│   │   │   │   └── import/page.tsx       # Import data
│   │   │   ├── settings/
│   │   │   │   └── page.tsx              # Dashboard settings
│   │   │   └── layout.tsx                # Dashboard layout
│   │   │
│   │   ├── api/
│   │   │   ├── analytics/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── data/route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── metric-card.tsx
│   │   │   └── command-menu.tsx
│   │   ├── charts/
│   │   │   ├── area-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── line-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   ├── sparkline.tsx
│   │   │   └── chart-container.tsx
│   │   ├── tables/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── columns/
│   │   └── filters/
│   │       ├── filter-bar.tsx
│   │       ├── date-filter.tsx
│   │       └── multi-select-filter.tsx
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   ├── analytics.ts                  # Analytics queries
│   │   ├── export.ts                     # Export utilities
│   │   └── date-utils.ts
│   │
│   ├── hooks/
│   │   ├── use-analytics.ts
│   │   ├── use-realtime.ts
│   │   └── use-filters.ts
│   │
│   ├── store/
│   │   └── filter-store.ts               # Zustand filters
│   │
│   └── types/
│       └── analytics.ts
│
├── prisma/
│   └── schema.prisma
│
└── package.json
```

---

## MODÈLES DE DONNÉES

### Prisma Schema (Analytics-Ready)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User
model User {
  id        String   @id
  email     String   @unique
  name      String?
  role      Role     @default(VIEWER)
  createdAt DateTime @default(now())

  dashboards  Dashboard[]
  savedFilters SavedFilter[]

  @@map("users")
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

// Custom Dashboard
model Dashboard {
  id        String   @id @default(cuid())
  name      String
  isDefault Boolean  @default(false)
  layout    Json     // Widget positions

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  widgets Widget[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("dashboards")
}

model Widget {
  id          String     @id @default(cuid())
  type        WidgetType
  title       String
  config      Json       // Chart config, query, etc
  position    Json       // { x, y, w, h }

  dashboardId String
  dashboard   Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@map("widgets")
}

enum WidgetType {
  METRIC_CARD
  LINE_CHART
  BAR_CHART
  PIE_CHART
  AREA_CHART
  TABLE
  SPARKLINE
  PROGRESS
}

// Saved Filters
model SavedFilter {
  id      String @id @default(cuid())
  name    String
  filters Json   // { dateRange, dimensions, metrics }

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@map("saved_filters")
}

// Analytics Event (Time-series)
model AnalyticsEvent {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  eventType String   // page_view, conversion, etc
  value     Decimal? @db.Decimal(10, 2)

  // Dimensions
  source    String?  // google, facebook, direct
  medium    String?  // organic, cpc, email
  campaign  String?
  country   String?
  device    String?  // desktop, mobile, tablet
  browser   String?

  // Session
  sessionId String?
  userId    String?

  // Custom properties
  properties Json?

  @@index([timestamp])
  @@index([eventType])
  @@index([source, medium])
  @@map("analytics_events")
}

// Aggregated Metrics (Pre-computed for performance)
model DailyMetric {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  metric    String   // page_views, conversions, revenue
  value     Decimal  @db.Decimal(12, 2)

  // Dimensions (for drill-down)
  dimension String?  // source=google, country=FR
  breakdown Json?    // Detailed breakdown

  @@unique([date, metric, dimension])
  @@index([date])
  @@index([metric])
  @@map("daily_metrics")
}

// Report
model Report {
  id          String       @id @default(cuid())
  name        String
  description String?
  type        ReportType
  schedule    String?      // cron expression
  config      Json         // Metrics, filters, format
  lastRunAt   DateTime?
  nextRunAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("reports")
}

enum ReportType {
  SCHEDULED
  ON_DEMAND
  ALERT
}
```

---

## COMPOSANTS CLÉS

### 1. Metric Card

```tsx
// src/components/charts/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number         // Percentage change
  changeLabel?: string    // "vs last period"
  trend?: number[]        // Sparkline data
  format?: "number" | "currency" | "percent"
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  trend,
  format = "number",
  loading = false,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(val)
      case "percent":
        return `${val.toFixed(1)}%`
      default:
        return new Intl.NumberFormat("fr-FR").format(val)
    }
  }

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getTrendColor = () => {
    if (!change) return "text-gray-500"
    return change > 0 ? "text-green-500" : "text-red-500"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {trend && <Sparkline data={trend} className="h-8 w-20" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className={cn("text-sm", getTrendColor())}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 2. Chart Container (Responsive)

```tsx
// src/components/charts/chart-container.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Download, Maximize2, RefreshCw } from "lucide-react"
import { useState } from "react"

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onExport?: () => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

export function ChartContainer({
  title,
  subtitle,
  children,
  onExport,
  onRefresh,
  loading = false,
  className,
}: ChartContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRefresh && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="mr-2 h-4 w-4" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="h-[300px]">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 3. Date Range Picker

```tsx
// src/components/dashboard/date-range-picker.tsx
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const presets = [
  { label: "Today", value: "today", range: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", value: "yesterday", range: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 days", value: "7d", range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 30 days", value: "30d", range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "This month", value: "this_month", range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", value: "last_month", range: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
]

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value || presets[2].range())

  const handlePresetChange = (presetValue: string) => {
    const preset = presets.find((p) => p.value === presetValue)
    if (preset) {
      const range = preset.range()
      setDate(range)
      onChange?.(range)
    }
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMM yyyy", { locale: fr })} -{" "}
                  {format(date.to, "d MMM yyyy", { locale: fr })}
                </>
              ) : (
                format(date.from, "d MMM yyyy", { locale: fr })
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

### 4. Data Table with Export

```tsx
// src/components/tables/data-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"
import { useState } from "react"
import { exportToExcel, exportToCsv } from "@/lib/export"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  exportable?: boolean
  exportFilename?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  exportable = true,
  exportFilename = "export",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  const handleExport = (format: "xlsx" | "csv") => {
    const exportData = table.getFilteredRowModel().rows.map((row) => row.original)
    if (format === "xlsx") {
      exportToExcel(exportData, exportFilename)
    } else {
      exportToCsv(exportData, exportFilename)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <Input
            placeholder="Search..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        )}
        {exportable && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 5. Analytics Hook (Realtime)

```typescript
// src/hooks/use-analytics.ts
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useFilterStore } from "@/store/filter-store"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AnalyticsData {
  overview: {
    pageViews: number
    visitors: number
    conversions: number
    revenue: number
    changes: {
      pageViews: number
      visitors: number
      conversions: number
      revenue: number
    }
  }
  timeSeries: {
    date: string
    pageViews: number
    visitors: number
    conversions: number
  }[]
  topSources: { source: string; visitors: number; conversions: number }[]
  topPages: { page: string; views: number; avgTime: number }[]
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { dateRange, filters } = useFilterStore()

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange, filters }),
      })

      if (!response.ok) throw new Error("Failed to fetch analytics")

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, filters])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("analytics-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "analytics_events" },
        (payload) => {
          // Optimistic update
          if (data) {
            setData({
              ...data,
              overview: {
                ...data.overview,
                pageViews: data.overview.pageViews + 1,
              },
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [data])

  return { data, loading, error, refetch: fetchAnalytics }
}
```

---

## FEATURES INCLUSES

### MVP (Phase 1)
- [x] Overview dashboard avec KPIs
- [x] Metric cards avec trends
- [x] Line/Bar/Pie charts
- [x] Date range picker avec presets
- [x] Data tables avec sorting/filtering
- [x] Export CSV/Excel

### Phase 2
- [ ] Realtime updates (Supabase)
- [ ] Drill-down analytics
- [ ] Saved filters
- [ ] Custom date comparisons

### Phase 3
- [ ] Custom dashboards (drag & drop)
- [ ] Scheduled reports (email)
- [ ] Alerts & notifications
- [ ] API access

---

## CONFIGURATION

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@tanstack/react-table": "^8.0.0",
    "date-fns": "^3.0.0",
    "next": "15.0.0",
    "react": "19.0.0",
    "recharts": "^2.12.0",
    "xlsx": "^0.18.0",
    "zustand": "^4.5.0"
  }
}
```

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer un dashboard
/create dashboard MonDashboard

# Avec options
/create dashboard MonDashboard --with-realtime --with-custom-dashboards

# Ajouter features
/generate feature custom-widgets
/generate feature scheduled-reports
```

---

**Version:** 1.0
**Stack:** Next.js 15 + Recharts + TanStack Table + Supabase
**Temps estimé:** 2-4 heures pour MVP
