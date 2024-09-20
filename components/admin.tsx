"use client"

import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
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
import { CalendarIcon, ChevronDown } from "lucide-react"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Ceremony, Passport } from "@/types/types"
import { getAllPassports, getCeremonyList } from "@/lib/get-passport-data"
import { useEffect, useState } from "react"
import CeremonyDropdown, { getCeremonyTimeDate } from "@/lib/ceremony-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/cn"
import { Calendar } from "./ui/calendar"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export const passportColumns: ColumnDef<Passport>[] = [
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

export const ceremonyColumns: ColumnDef<Ceremony>[] = [
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
    }, {
        accessorKey: "total_slots",
        header: "Total Slots",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("total_slots")}</div>
        ),
    }, {
        accessorKey: "open_registration",
        header: "Open Registration",
        cell: ({ row }) => (
            <div className="capitalize">{(row.getValue("open_registration") as string).toString()}</div>
        ),
    },
]


const FormSchema = z.object({
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
})


export default function AdminPage({

}: {

    }) {

    const [selected, setSelected] = useState<Date>();
    const [timeValue, setTimeValue] = useState<string>("00:00");

    const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const time = e.target.value;
        if (!selected) {
            setTimeValue(time);
            return;
        }
        const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
        const newSelectedDate = setHours(setMinutes(selected, minutes), hours);
        setSelected(newSelectedDate);
        setTimeValue(time);
    };

    const handleDaySelect = (date: Date | undefined) => {
        if (!timeValue || !date) {
            setSelected(date);
            return;
        }
        const [hours, minutes] = timeValue
            .split(":")
            .map((str) => parseInt(str, 10));
        const newDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours,
            minutes
        );
        return (newDate);
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        alert(JSON.stringify(data, null, 2))
    }

    const [passportData, setPassportData] = useState<Passport[]>([]);
    const [ceremonyData, setCeremonyData] = useState<Ceremony[]>([]);
    useEffect(() => {
        const fetchPassportData = async () => {
            try {
                const result = await getAllPassports();
                setPassportData(result ?? []);
            } catch (e) { }
        };
        const fetchCeremonyData = async () => {
            try {
                const result = await getCeremonyList();
                setCeremonyData(result ?? []);
            } catch (e) { }
        };

        fetchPassportData();
        fetchCeremonyData();
    }, []);

    const [passportSorting, setPassportSorting] = React.useState<SortingState>([])
    const [passportColumnFilters, setPassportColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [passportColumnVisibility, setPassportColumnVisibility] =
        React.useState<VisibilityState>({})
    const [passportRowSelection, setPassportRowSelection] = React.useState({})

    const [ceremonySorting, setCeremonySorting] = React.useState<SortingState>([])
    const [ceremonyColumnFilters, setCeremonyColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [ceremonyColumnVisibility, setCeremonyColumnVisibility] =
        React.useState<VisibilityState>({})
    const [ceremonyRowSelection, setCeremonyRowSelection] = React.useState({})

    const passportTable = useReactTable({
        data: passportData,
        columns: passportColumns,
        onSortingChange: setPassportSorting,
        onColumnFiltersChange: setPassportColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setPassportColumnVisibility,
        onRowSelectionChange: setPassportRowSelection,
        state: {
            sorting: passportSorting,
            columnFilters: passportColumnFilters,
            columnVisibility: passportColumnVisibility,
            rowSelection: passportRowSelection,
        },
    })

    const ceremonyTable = useReactTable({
        data: ceremonyData,
        columns: ceremonyColumns,
        onSortingChange: setCeremonySorting,
        onColumnFiltersChange: setCeremonyColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setCeremonyColumnVisibility,
        onRowSelectionChange: setCeremonyRowSelection,
        state: {
            sorting: ceremonySorting,
            columnFilters: ceremonyColumnFilters,
            columnVisibility: ceremonyColumnVisibility,
            rowSelection: ceremonyRowSelection,
        },
    })

    const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony")

    return (
        <div className="w-full">
            <p>&quot;But wait!&quot; I hear you saying. &quot;Isn't everything just in random places?&quot;</p>
            <p>Yes. :D</p>
            <br />
            <Tabs defaultValue="passports" className="w-full min-w-0">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="passports">Passport List</TabsTrigger>
                    <TabsTrigger value="ceremonies">Ceremony List</TabsTrigger>
                </TabsList>
                <TabsContent value="passports">
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

                                                    new Date((passportTable.getColumn("ceremony_time")?.getFilterValue() ?? "") as string).toLocaleDateString('en-US', {
                                                        timeZone: 'UTC',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })} - {new Date((passportTable.getColumn("ceremony_time")?.getFilterValue() ?? "") as string).toLocaleTimeString('en-US', {
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
                                <DropdownMenuRadioGroup value={(passportTable.getColumn("ceremony_time")?.getFilterValue() as string) ?? ""} onValueChange={e => { passportTable.getColumn("ceremony_time")?.setFilterValue(getCeremonyTimeDate(e).toISOString()); setCeremonyTime(e) }}>
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
                                {passportTable
                                    .getAllColumns()
                                    .filter((passportColumn) => passportColumn.getCanHide())
                                    .map((passportColumn) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={passportColumn.id}
                                                className="capitalize"
                                                checked={passportColumn.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    passportColumn.toggleVisibility(!!value)
                                                }
                                            >
                                                {passportColumn.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {passportTable.getHeaderGroups().map((headerGroup) => (
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
                                {passportTable.getRowModel().rows?.length ? (
                                    passportTable.getRowModel().rows.map((row) => (
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
                                            colSpan={passportColumns.length}
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
                            {passportTable.getFilteredSelectedRowModel().rows.length} of{" "}
                            {passportTable.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => passportTable.previousPage()}
                                disabled={!passportTable.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => passportTable.nextPage()}
                                disabled={!passportTable.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="ceremonies">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {ceremonyTable.getHeaderGroups().map((headerGroup) => (
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
                                {ceremonyTable.getRowModel().rows?.length ? (
                                    ceremonyTable.getRowModel().rows.map((row) => (
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
                                            colSpan={ceremonyColumns.length}
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
                        <div>
                            <div className="flex-1 text-sm text-muted-foreground">
                                {ceremonyTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                {ceremonyTable.getFilteredRowModel().rows.length} row(s) selected.
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => ceremonyTable.previousPage()}
                                    disabled={!ceremonyTable.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => ceremonyTable.nextPage()}
                                    disabled={!ceremonyTable.getCanNextPage()}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-[2fr_3fr] gap-20 lg:gap-12 w-full max-w-4xl">
                        <Card className="space-y-8">
                            <CardHeader>
                                <CardTitle>Add a Ceremony</CardTitle>
                                <CardDescription>Create a new Passport Ceremony. The ceremony will </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="new_ceremony_time"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[240px] pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={e => { field.onChange(handleDaySelect(e)) }}
                                                                disabled={(date) =>
                                                                    date > new Date() || date < new Date("1900-01-01")
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Label>
                                                        <p className="pb-1">Set the time{" "}</p>
                                                        <Input type="time" value={timeValue} onChange={handleTimeChange} className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )} />
                                                    </Label>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit">Submit</Button>
                                    </form>
                                </Form>
                            </CardContent>
                            <CardFooter>
                                <p>Card Footer</p>
                            </CardFooter>
                        </Card>
                    </div>
                    <aside>
                        <div className="flex flex-col gap-4">

                        </div>
                    </aside>
                </TabsContent>
            </Tabs>
        </div>
    )
}