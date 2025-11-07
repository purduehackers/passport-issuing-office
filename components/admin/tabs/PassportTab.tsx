import { useState, useEffect } from "react";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
	ColumnDef,
	ColumnFiltersState,
	PaginationState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { getAllPassports } from "@/lib/get-passport-data";
import { Passport } from "@/types/types";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FullCeremonyDropdown } from "@/lib/ceremony-dropdown";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	getCeremonyTimeDate,
	getCeremonyTimeStringTime,
	getCeremonyTimeStringFullDate,
} from "@/lib/ceremony-data";
import Link from "next/link";

export const passportColumns: ColumnDef<Passport>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Passport ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const passportId: string = row.getValue("id");
			return (
				<div className="capitalize">
					<Link href={`/admin/passport/${passportId}`}>{passportId}</Link>
				</div>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: "owner_id",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Owner ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("owner_id")}</div>
		),
	},
	{
		accessorKey: "activated",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Activation Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="capitalize">
				{(row.getValue("activated") as string).toString()}
			</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "surname",
		header: "Last Name",
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("surname")}</div>
		),
	},
	{
		accessorKey: "name",
		header: "First Name",
		cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "date_of_birth",
		header: "Date of Birth",
		cell: ({ row }) => (
			<div className="capitalize">
				{getCeremonyTimeStringFullDate(row.getValue("date_of_birth"))}
			</div>
		),
	},
	{
		accessorKey: "date_of_issue",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Date of Issue
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="capitalize">
				{getCeremonyTimeStringFullDate(row.getValue("date_of_issue"))}
			</div>
		),
		enableSorting: true,
	},
	{
		accessorKey: "place_of_origin",
		header: "Place of Origin",
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("place_of_origin")}</div>
		),
	},
	{
		accessorKey: "ceremony_time",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Ceremony Time
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="capitalize">
				{getCeremonyTimeStringFullDate(row.getValue("ceremony_time"))} -{" "}
				{getCeremonyTimeStringTime(row.getValue("ceremony_time"))}
			</div>
		),
	},
];

const PassportTab = ({ reloadKey }: { reloadKey: number }) => {
	const [passportData, setPassportData] = useState<Passport[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const result = await getAllPassports();
				setPassportData(result ?? []);
			} catch (e) {}
		})();
	}, [reloadKey]);

	const [passportSorting, setPassportSorting] = useState<SortingState>([]);
	const [passportColumnFilters, setPassportColumnFilters] =
		useState<ColumnFiltersState>([]);
	const [passportColumnVisibility, setPassportColumnVisibility] =
		useState<VisibilityState>({});
	const [passportRowSelection, setPassportRowSelection] = useState({});
	const [passportPagination, setPassportPagination] = useState<PaginationState>(
		{
			pageIndex: 0,
			pageSize: 10,
		},
	);

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
		onPaginationChange: setPassportPagination,
		state: {
			sorting: passportSorting,
			columnFilters: passportColumnFilters,
			columnVisibility: passportColumnVisibility,
			rowSelection: passportRowSelection,
			pagination: passportPagination,
		},
	});

	const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony");

	return (
		<>
			<div className="flex items-center py-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="max-w-sm"
						>
							{ceremonyTime == "noPassportCeremony" ? (
								<p>Select a date to filter by</p>
							) : (
								<p>
									{new Date(
										(passportTable
											.getColumn("ceremony_time")
											?.getFilterValue() ?? "") as string,
									).toLocaleDateString("en-US", {
										timeZone: "America/Indianapolis",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}{" "}
									-{" "}
									{new Date(
										(passportTable
											.getColumn("ceremony_time")
											?.getFilterValue() ?? "") as string,
									).toLocaleTimeString("en-US", {
										timeZone: "America/Indianapolis",
										hour: "numeric",
										minute: "numeric",
										hour12: true,
									})}
								</p>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-full min-w-0">
						<DropdownMenuLabel>Upcoming Ceremonies</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuRadioGroup
							value={
								(passportTable
									.getColumn("ceremony_time")
									?.getFilterValue() as string) ?? ""
							}
							onValueChange={(e) => {
								const column = passportTable.getColumn("ceremony_time");
								if (e.valueOf() == "noPassportCeremony") {
									column?.setFilterValue("");
									setCeremonyTime("noPassportCeremony");
								} else {
									column?.setFilterValue(getCeremonyTimeDate(e).toISOString());
									setCeremonyTime(e);
								}
							}}
						>
							<DropdownMenuRadioItem
								value="noPassportCeremony"
								className="flex justify-between items-center"
							>
								Select a Date
							</DropdownMenuRadioItem>
							<FullCeremonyDropdown />
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="ml-auto"
						>
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
								);
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
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{passportTable.getRowModel().rows?.length ? (
							passportTable.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
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
					Page {passportTable.getState().pagination.pageIndex + 1} of{" "}
					{passportTable.getPageCount()}
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
		</>
	);
};

export default PassportTab;
