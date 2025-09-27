"use client";

import * as React from "react";
import { format } from "date-fns";
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
import { ArrowUpDown, CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Ceremony, Passport } from "@/types/types";
import {
	getAllPassports,
	getCeremonyList,
	getFullCeremonyList,
} from "@/lib/get-passport-data";
import { useEffect, useState } from "react";
import {
	getCeremonyTimeDate,
	getCeremonyTimestamp,
	getCeremonyTimeString,
	getCeremonyTimeStringFullDate,
	getCeremonyTimeStringTime,
} from "@/lib/ceremony-data";
import CeremonyDropdown, {
	FullCeremonyDropdown,
} from "@/lib/ceremony-dropdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/cn";
import { Calendar } from "./ui/calendar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	addNewCeremony,
	deleteCeremony,
	modifyCeremony,
} from "@/lib/ceremony-utils";
import { Switch } from "./ui/switch";
import { useToast } from "@/hooks/use-toast";

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
		cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
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
		header: "Activated",
		cell: ({ row }) => (
			<div className="capitalize">
				{(row.getValue("activated") as string).toString()}
			</div>
		),
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
		header: "Date of Issue",
		cell: ({ row }) => (
			<div className="capitalize">
				{getCeremonyTimeStringFullDate(row.getValue("date_of_issue"))}
			</div>
		),
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

export const ceremonyColumns: ColumnDef<Ceremony>[] = [
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
		enableSorting: true,
		enableHiding: false,
	},
	{
		accessorKey: "total_slots",
		header: "Total Slots",
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("total_slots")}</div>
		),
	},
	{
		accessorKey: "open_registration",
		header: "Open Registration",
		cell: ({ row }) => (
			<div className="capitalize">
				{(row.getValue("open_registration") as string).toString()}
			</div>
		),
	},
];

const CreateFormSchema = z.object({
	newCeremonyTime: z.date({
		required_error: "A ceremony date is required.",
	}),
	maxRegistrations: z.string({
		required_error: "You must set a maximum number of participants.",
	}),
	openRegistration: z.boolean({
		required_error: "You must select an option.",
	}),
});

const ModifyFormSchema = z.object({
	modifyCeremonyTime: z.string({
		required_error: "A ceremony date is required.",
	}),
	ceremonyTimeMod: z.date({
		required_error: "You must set a ceremony date and time.",
	}),
	maxRegistrationsMod: z.string({
		required_error: "You must set a maximum number of participants.",
	}),
	openRegistrationMod: z.boolean({
		required_error: "You must select an option.",
	}),
});

const DeleteFormSchema = z.object({
	deleteCeremonyTime: z.string({
		required_error: "A date of birth is required.",
	}),
});

export default function AdminPage() {
	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(false); // TODO: do this better
	const [timeValue, setTimeValue] = useState<string>("00:00");
	const [dateValue, setDateValue] = useState<Date>();

	const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const time = e.target.value;
		if (!timeValue || !dateValue) {
			setTimeValue(time);
			return;
		}
		const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
		const newDate = new Date(
			dateValue.getUTCFullYear(),
			dateValue.getUTCMonth(),
			dateValue.getUTCDate(),
			hours,
			minutes,
		);
		setTimeValue(time);
		setDateValue(newDate);
		return newDate;
	};

	const handleDaySelect = (date: Date | undefined) => {
		if (!timeValue || !date) {
			return;
		}
		const [hours, minutes] = timeValue
			.split(":")
			.map((str) => parseInt(str, 10));
		const newDate = new Date(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			hours,
			minutes,
		);
		setDateValue(newDate);
		return newDate;
	};

	const createForm = useForm<z.infer<typeof CreateFormSchema>>({
		resolver: zodResolver(CreateFormSchema),
		defaultValues: {
			maxRegistrations: "10",
			openRegistration: true,
		},
	});

	const modifyForm = useForm<z.infer<typeof ModifyFormSchema>>({
		resolver: zodResolver(ModifyFormSchema),
		defaultValues: {
			maxRegistrationsMod: "10",
			openRegistrationMod: true,
		},
	});

	const deleteForm = useForm<z.infer<typeof DeleteFormSchema>>({
		resolver: zodResolver(DeleteFormSchema),
	});

	async function onSubmitCreate(data: z.infer<typeof CreateFormSchema>) {
		setIsLoading(true);
		const success = await addNewCeremony({
			ceremony_time: new Date(data.newCeremonyTime),
			total_slots: parseInt(data.maxRegistrations),
			open_registration: data.openRegistration,
		});

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.newCeremonyTime) + " created!",
			});
			setReloadDatabase(true);
			setIsLoading(false);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.newCeremonyTime) +
					" failed to be created. Are you using a duplicate date?",
			});
			setIsLoading(false);
		}
	}

	async function onSubmitModify(data: z.infer<typeof ModifyFormSchema>) {
		setIsLoading(true);
		const success = await modifyCeremony({
			old_ceremony_time: new Date(data.modifyCeremonyTime),
			ceremony_time: new Date(data.ceremonyTimeMod),
			total_slots: parseInt(data.maxRegistrationsMod),
			open_registration: data.openRegistrationMod,
		});

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.modifyCeremonyTime) + " modified!",
			});
			setReloadDatabase(true);
			setIsLoading(false);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.modifyCeremonyTime) +
					" failed to be modified.",
			});
			setIsLoading(false);
		}
	}

	async function onSubmitDelete(data: z.infer<typeof DeleteFormSchema>) {
		setIsLoading(true);
		const success = await deleteCeremony(new Date(data.deleteCeremonyTime));

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.deleteCeremonyTime) + " deleted!",
			});
			setReloadDatabase(true);
			setIsLoading(false);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.deleteCeremonyTime) +
					" failed to be deleted.",
			});
			setIsLoading(false);
		}
	}

	const [passportData, setPassportData] = useState<Passport[]>([]);
	const [ceremonyData, setCeremonyData] = useState<Ceremony[]>([]);
	const [reloadDatabase, setReloadDatabase] = useState(true);

	useEffect(() => {
		const fetchPassportData = async () => {
			try {
				const result = await getAllPassports();
				setPassportData(result ?? []);
			} catch (e) {}
		};
		const fetchCeremonyData = async () => {
			try {
				const result = await getFullCeremonyList();
				setCeremonyData(result ?? []);
			} catch (e) {}
		};

		if (reloadDatabase) {
			fetchPassportData();
			fetchCeremonyData();
			setReloadDatabase(false);
		}
	}, [reloadDatabase]);

	const [passportSorting, setPassportSorting] = React.useState<SortingState>(
		[],
	);
	const [passportColumnFilters, setPassportColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [passportColumnVisibility, setPassportColumnVisibility] =
		React.useState<VisibilityState>({});
	const [passportRowSelection, setPassportRowSelection] = React.useState({});
	const [passportPagination, setPassportPagination] =
		React.useState<PaginationState>({
			pageIndex: 0,
			pageSize: 5,
		});

	const [ceremonySorting, setCeremonySorting] = React.useState<SortingState>(
		[],
	);
	const [ceremonyColumnFilters, setCeremonyColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [ceremonyColumnVisibility, setCeremonyColumnVisibility] =
		React.useState<VisibilityState>({});
	const [ceremonyRowSelection, setCeremonyRowSelection] = React.useState({});
	const [ceremonyPagination, setCeremonyPagination] =
		React.useState<PaginationState>({
			pageIndex: 0,
			pageSize: 5,
		});

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
		onPaginationChange: setCeremonyPagination,
		state: {
			sorting: ceremonySorting,
			columnFilters: ceremonyColumnFilters,
			columnVisibility: ceremonyColumnVisibility,
			rowSelection: ceremonyRowSelection,
			pagination: ceremonyPagination,
		},
	});

	const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony");
	const [modifyCeremonyTime, setModifyCeremonyTime] =
		useState("noPassportCeremony");
	const [deleteCeremonyTime, setDeleteCeremonyTime] =
		useState("noPassportCeremony");

	return (
		<div className="w-full">
			<Tabs
				defaultValue="passports"
				className="w-full min-w-0"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="passports">Passport List</TabsTrigger>
					<TabsTrigger value="ceremonies">Upcoming Ceremony List</TabsTrigger>
				</TabsList>
				<TabsContent value="passports">
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
											column?.setFilterValue(
												getCeremonyTimeDate(e).toISOString(),
											);
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
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{ceremonyTable.getRowModel().rows?.length ? (
									ceremonyTable.getRowModel().rows.map((row) => (
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
						<div className="flex-1 text-sm text-muted-foreground">
							Page {ceremonyTable.getState().pagination.pageIndex + 1} of{" "}
							{ceremonyTable.getPageCount()}
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
					<div className="grid grid-cols-3 gap-5 lg:gap-3 w-full max-w-4xl auto-cols-auto">
						<div className="grid-cols-subgrid">
							<Card className="mx-auto">
								<CardHeader>
									<CardTitle>Add a Ceremony</CardTitle>
									<CardDescription>
										Create a new Passport Ceremony. The ceremony will appear for
										selection once created.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...createForm}>
										<form
											onSubmit={createForm.handleSubmit(onSubmitCreate)}
											className="space-y-8"
										>
											<FormField
												control={createForm.control}
												name="newCeremonyTime"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant={"outline"}
																		className={cn(
																			"pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
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
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	mode="single"
																	selected={new Date(field.value)}
																	onSelect={(e) => {
																		field.onChange(handleDaySelect(e));
																	}}
																	disabled={(date) => date < new Date()}
																	initialFocus
																/>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={createForm.control}
												name="newCeremonyTime"
												render={({ field }) => (
													<FormItem>
														<Label>
															<p className="pb-1">Set the time </p>
															<Input
																type="time"
																value={timeValue}
																onChange={(e) => {
																	field.onChange(handleTimeChange(e));
																}}
																className={cn(
																	"pl-3 pr-3 text-left font-normal",
																	!field.value && "text-muted-foreground",
																)}
															/>
														</Label>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={createForm.control}
												name="maxRegistrations"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<>
																<Label>Maximum Participant Count</Label>
																<Input
																	type="number"
																	{...field}
																/>
															</>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={createForm.control}
												name="openRegistration"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<>
																<Label>Open for Registration</Label>
																<Switch
																	checked={field.value}
																	onCheckedChange={field.onChange}
																	aria-readonly
																/>
															</>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
												disabled={isLoading}
											>
												{isLoading ? "Submitting..." : "Submit"}
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
						<div className="grid-cols-subgrid">
							<Card className="mx-auto">
								<CardHeader>
									<CardTitle>Modify a Ceremony</CardTitle>
									<CardDescription>
										Change the number of allowed participants, or disable
										registrations.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...modifyForm}>
										<form
											onSubmit={modifyForm.handleSubmit(onSubmitModify)}
											className="space-y-8"
										>
											<FormField
												control={modifyForm.control}
												name="modifyCeremonyTime"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormItem>
															<FormLabel>Ceremony Date</FormLabel>
															<FormControl>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button
																			variant="outline"
																			className="w-full"
																		>
																			{modifyCeremonyTime ==
																			"noPassportCeremony" ? (
																				<p>Select a Date</p>
																			) : (
																				<p>
																					{getCeremonyTimeString(
																						modifyCeremonyTime,
																					)}
																				</p>
																			)}
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent className="w-full min-w-0">
																		<DropdownMenuLabel>
																			Upcoming Ceremonies
																		</DropdownMenuLabel>
																		<DropdownMenuSeparator />
																		<DropdownMenuRadioGroup
																			value={field.value}
																			onValueChange={(e) => {
																				field.onChange(getCeremonyTimestamp(e));
																				setModifyCeremonyTime(e);
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
															</FormControl>
															<FormMessage />
														</FormItem>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={modifyForm.control}
												name="ceremonyTimeMod"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant={"outline"}
																		className={cn(
																			"pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
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
															<PopoverContent
																className="w-auto p-0"
																align="start"
															>
																<Calendar
																	mode="single"
																	selected={new Date(field.value)}
																	onSelect={(e) => {
																		field.onChange(handleDaySelect(e));
																	}}
																	disabled={(date) => date < new Date()}
																	initialFocus
																/>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={modifyForm.control}
												name="ceremonyTimeMod"
												render={({ field }) => (
													<FormItem>
														<Label>
															<p className="pb-1">Set the time </p>
															<Input
																type="time"
																value={timeValue}
																onChange={(e) => {
																	field.onChange(handleTimeChange(e));
																}}
																className={cn(
																	"pl-3 pr-3 text-left font-normal",
																	!field.value && "text-muted-foreground",
																)}
															/>
														</Label>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={modifyForm.control}
												name="maxRegistrationsMod"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<>
																<Label>Maximum Participant Count</Label>
																<Input
																	type="number"
																	{...field}
																/>
															</>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={modifyForm.control}
												name="openRegistrationMod"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<>
																<Label>Open for Registration</Label>
																<Switch
																	checked={field.value}
																	onCheckedChange={field.onChange}
																	aria-readonly
																/>
															</>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
												disabled={isLoading}
											>
												{isLoading ? "Submitting..." : "Submit"}
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
						<div className="grid-cols-subgrid">
							<Card className="mx-auto">
								<CardHeader>
									<CardTitle>Delete a Ceremony</CardTitle>
									<CardDescription>Delete a Passport Ceremony.</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-sm border-[3px] border-red-400 flex flex-col justify-center w-full md:w-10/12 gap-4 p-3 sm:p-4 my-4 mx-auto break-inside-avoid shadow-red-600 shadow-blocks-sm font-main">
										<p>
											WARNING! Deleting a Passport Ceremony does not clear the
											date on the registered passports. The corresponding
											passports will still be &quot;registered&quot; for the
											passport ceremony.
										</p>
									</div>
									<Form {...deleteForm}>
										<form
											onSubmit={deleteForm.handleSubmit(onSubmitDelete)}
											className="space-y-8"
										>
											<FormField
												control={deleteForm.control}
												name="deleteCeremonyTime"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormItem>
															<FormLabel>Ceremony Date</FormLabel>
															<FormControl>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button
																			variant="outline"
																			className="w-full"
																		>
																			{deleteCeremonyTime ==
																			"noPassportCeremony" ? (
																				<p>Select a Date</p>
																			) : (
																				<p>
																					{getCeremonyTimeString(
																						deleteCeremonyTime,
																					)}
																				</p>
																			)}
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent className="w-full min-w-0">
																		<DropdownMenuLabel>
																			Upcoming Ceremonies
																		</DropdownMenuLabel>
																		<DropdownMenuSeparator />
																		<DropdownMenuRadioGroup
																			value={field.value}
																			onValueChange={(e) => {
																				field.onChange(getCeremonyTimestamp(e));
																				setDeleteCeremonyTime(e);
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
															</FormControl>
															<FormMessage />
														</FormItem>
														<FormMessage />
													</FormItem>
												)}
											/>
											<Button
												type="submit"
												className="rounded-[0.25rem] border-2 border-slate-800 bg-amber-500 px-4 py-2 text-sm font-bold text-slate-800 shadow-[4px_4px_0_0_#0f172a] transition-colors hover:bg-amber-500/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
												disabled={isLoading}
											>
												{isLoading ? "Submitting..." : "Submit"}
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
