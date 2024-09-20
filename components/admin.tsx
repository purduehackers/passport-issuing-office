"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Passport } from "@/types/types"
import { getAllPassports } from "@/lib/get-passport-data"
import { useEffect, useState } from "react"
import CeremonyDropdown, { getCeremonyTimeDate, getCeremonyTimestamp, getCeremonyTimeString } from "@/lib/ceremony-data"
import { Badge } from "./ui/badge"

export const columns: ColumnDef<Passport>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Passport ID",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "owner_id",
        header: "Owner ID",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("owner_id")}</div>
        ),
    }, {
        accessorKey: "activated",
        header: "Activated",
        cell: ({ row }) => (
            <div className="capitalize">{(row.getValue("activated") as string).toString()}</div>
        ),
    }, {
        accessorKey: "surname",
        header: "Last Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("surname")}</div>
        ),
    }, {
        accessorKey: "name",
        header: "First Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    }, {
        accessorKey: "date_of_birth",
        header: "Date of Birth",
        cell: ({ row }) => (
            <div className="capitalize">{
                new Date(row.getValue("date_of_birth") as string).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </div>
        ),
    }, {
        accessorKey: "date_of_issue",
        header: "Date of Issue",
        cell: ({ row }) => (
            <div className="capitalize">{
                new Date(row.getValue("date_of_issue") as string).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })
                }
            </div>
        ),
    }, {
        accessorKey: "place_of_origin",
        header: "Place of Origin",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("place_of_origin")}</div>
        ),
    }, {
        accessorKey: "ceremony_time",
        header: "Ceremony Time",
        cell: ({ row }) => (
            <div className="capitalize">{
                new Date(row.getValue("ceremony_time") as string).toLocaleDateString('en-US', {
                    timeZone: 'UTC',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })} - {new Date(row.getValue("ceremony_time") as string).toLocaleTimeString('en-US', {
                    timeZone: 'UTC',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
                }
            </div>
        ),
    },
]


export default function AdminPage({

}: {

    }) {

    const [data, setData] = useState<Passport[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllPassports();
                setData(result ?? []);
            } catch (e) { }
        };

        fetchData();
    }, []);

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    console.log(data)

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony")

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="max-w-sm">
                            {
                                ceremonyTime == "noPassportCeremony" ? (
                                    <p>Select a date to filter by</p>
                                ) : (
                                    <p>
                                        {
                                            //getCeremonyTimeString(ceremonyTime).toString()
                                            //table.getColumn("ceremony_time")?.getFilterValue() ?? ""

                                            new Date((table.getColumn("ceremony_time")?.getFilterValue() ?? "") as string).toLocaleDateString('en-US', {
                                                timeZone: 'UTC',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })} - {new Date((table.getColumn("ceremony_time")?.getFilterValue() ?? "") as string).toLocaleTimeString('en-US', {
                                                timeZone: 'UTC',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true
                                            })
                                        }
                                    </p>
                                )
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-0">
                        <DropdownMenuLabel>Upcoming Ceremonies</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={(table.getColumn("ceremony_time")?.getFilterValue() as string) ?? ""} onValueChange={e => { table.getColumn("ceremony_time")?.setFilterValue(getCeremonyTimeDate(e).toISOString()); setCeremonyTime(e) }}>
                            <DropdownMenuRadioItem value="noPassportCeremony" className="flex justify-between items-center">Select a Date</DropdownMenuRadioItem>
                            <CeremonyDropdown />
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
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
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
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