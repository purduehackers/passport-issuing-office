import { useState, useEffect } from "react";

import { ArrowUpDown } from "lucide-react";
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

import { getAllUsers } from "@/lib/get-passport-data";
import { Users } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const userColumns: ColumnDef<Users>[] = [
	{
		accessorKey: "id",
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
		cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
		enableSorting: true,
		enableHiding: false,
	},
	{
		accessorKey: "discord_id",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Discord ID
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("discord_id")}</div>
		),
		enableSorting: true,
		enableHiding: false,
	},
	{
		accessorKey: "role",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Role
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
		enableSorting: true,
		enableHiding: false,
	},
];

const UserTab = ({ reloadKey }: { reloadKey: number }) => {
	const [userData, setUserData] = useState<Users[]>([]);

	const [userSorting, setUserSorting] = useState<SortingState>([]);
	const [userColumnFilters, setUserColumnFilters] =
		useState<ColumnFiltersState>([]);
	const [userColumnVisibility, setUserColumnVisibility] =
		useState<VisibilityState>({});
	const [userRowSelection, setUserRowSelection] = useState({});
	const [userPagination, setUserPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	useEffect(() => {
		(async () => {
			try {
				const result = await getAllUsers();
				setUserData(result ?? []);
			} catch (e) {}
		})();
	}, [reloadKey]);

	const userTable = useReactTable({
		data: userData,
		columns: userColumns,
		onSortingChange: setUserSorting,
		onColumnFiltersChange: setUserColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setUserColumnVisibility,
		onRowSelectionChange: setUserRowSelection,
		onPaginationChange: setUserPagination,
		state: {
			sorting: userSorting,
			columnFilters: userColumnFilters,
			columnVisibility: userColumnVisibility,
			rowSelection: userRowSelection,
			pagination: userPagination,
		},
	});

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{userTable.getHeaderGroups().map((headerGroup) => (
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
						{userTable.getRowModel().rows?.length ? (
							userTable.getRowModel().rows.map((row) => (
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
									colSpan={userColumns.length}
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
					Page {userTable.getState().pagination.pageIndex + 1} of{" "}
					{userTable.getPageCount()}
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => userTable.previousPage()}
						disabled={!userTable.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => userTable.nextPage()}
						disabled={!userTable.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</>
	);
};

export default UserTab;
