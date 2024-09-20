"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
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
} from "@tanstack/react-table";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getAllPassports, getCeremonyList } from "@/lib/get-passport-data";
import { useEffect, useState } from "react";
import CeremonyDropdown, {
	getCeremonySlotsBadge,
	getCeremonyTimeDate,
	getCeremonyTimestamp,
	getCeremonyTimeString,
} from "@/lib/ceremony-data";
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
	CardFooter,
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
		cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
	},
	{
		accessorKey: "owner_id",
		header: "Owner ID",
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
				{new Date(row.getValue("date_of_birth") as string).toLocaleDateString(
					"en-US",
					{
						timeZone: "UTC",
						day: "numeric",
						month: "long",
						year: "numeric",
					},
				)}
			</div>
		),
	},
	{
		accessorKey: "date_of_issue",
		header: "Date of Issue",
		cell: ({ row }) => (
			<div className="capitalize">
				{new Date(row.getValue("date_of_issue") as string).toLocaleDateString(
					"en-US",
					{
						timeZone: "UTC",
						day: "numeric",
						month: "long",
						year: "numeric",
					},
				)}
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
		header: "Ceremony Time",
		cell: ({ row }) => (
			<div className="capitalize">
				{new Date(row.getValue("ceremony_time") as string).toLocaleDateString(
					"en-US",
					{
						timeZone: "UTC",
						day: "numeric",
						month: "long",
						year: "numeric",
					},
				)}{" "}
				-{" "}
				{new Date(row.getValue("ceremony_time") as string).toLocaleTimeString(
					"en-US",
					{
						timeZone: "UTC",
						hour: "numeric",
						minute: "numeric",
						hour12: true,
					},
				)}
			</div>
		),
	},
];

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
	},
	{
		accessorKey: "ceremony_time",
		header: "Ceremony Time",
		cell: ({ row }) => (
			<div className="capitalize">
				{new Date(row.getValue("ceremony_time") as string).toLocaleDateString(
					"en-US",
					{
						timeZone: "UTC",
						day: "numeric",
						month: "long",
						year: "numeric",
					},
				)}{" "}
				-{" "}
				{new Date(row.getValue("ceremony_time") as string).toLocaleTimeString(
					"en-US",
					{
						timeZone: "UTC",
						hour: "numeric",
						minute: "numeric",
						hour12: true,
					},
				)}
			</div>
		),
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
	new_ceremony_time: z.date({
		required_error: "A date of birth is required.",
	}),
	max_registrations: z.string({
		required_error: "You must set a maximum number of participants.",
	}),
	open_registration: z.boolean({
		required_error: "You must select an option.",
	}),
});

const ModifyFormSchema = z.object({
	modify_ceremony_time: z.string({
		required_error: "A date of birth is required.",
	}),
	max_registrations_mod: z.string({
		required_error: "You must set a maximum number of participants.",
	}),
	open_registration_mod: z.boolean({
		required_error: "You must select an option.",
	}),
});

const DeleteFormSchema = z.object({
	delete_ceremony_time: z.string({
		required_error: "A date of birth is required.",
	}),
});

export default function AdminPage({}: {}) {
	const { toast } = useToast();

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
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			hours,
			minutes,
		);
		return newDate;
	};

	const createForm = useForm<z.infer<typeof CreateFormSchema>>({
		resolver: zodResolver(CreateFormSchema),
		defaultValues: {
			max_registrations: "10",
			open_registration: true,
		},
	});

	const modifyForm = useForm<z.infer<typeof ModifyFormSchema>>({
		resolver: zodResolver(ModifyFormSchema),
		defaultValues: {
			max_registrations_mod: "10",
			open_registration_mod: true,
		},
	});

	const deleteForm = useForm<z.infer<typeof DeleteFormSchema>>({
		resolver: zodResolver(DeleteFormSchema),
	});

	async function onSubmitCreate(data: z.infer<typeof CreateFormSchema>) {
		const success = await addNewCeremony({
			ceremony_time: new Date(data.new_ceremony_time),
			total_slots: parseInt(data.max_registrations),
			open_registration: data.open_registration,
		});

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.new_ceremony_time) + " created!",
			});
			setReloadDatebase(true);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.new_ceremony_time) +
					" failed to be created. Are you using a duplicate date?",
			});
		}
	}

	async function onSubmitModify(data: z.infer<typeof ModifyFormSchema>) {
		const success = await modifyCeremony({
			ceremony_time: new Date(data.modify_ceremony_time),
			total_slots: parseInt(data.max_registrations_mod),
			open_registration: data.open_registration_mod,
		});

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.modify_ceremony_time) + " modified!",
			});
			setReloadDatebase(true);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.modify_ceremony_time) +
					" failed to be modified.",
			});
		}
	}

	async function onSubmitDelete(data: z.infer<typeof DeleteFormSchema>) {
		const success = await deleteCeremony(new Date(data.delete_ceremony_time));

		if (success) {
			toast({
				title: "Success!",
				description:
					"Ceremony at " + new Date(data.delete_ceremony_time) + " deleted!",
			});
			setReloadDatebase(true);
		} else {
			toast({
				title: "Meltdown Imminent!",
				variant: "destructive",
				description:
					"Ceremony at " +
					new Date(data.delete_ceremony_time) +
					" failed to be deleted.",
			});
		}
	}

	const [passportData, setPassportData] = useState<Passport[]>([]);
	const [ceremonyData, setCeremonyData] = useState<Ceremony[]>([]);
	const [reloadDatabase, setReloadDatebase] = useState(true);

	useEffect(() => {
		const fetchPassportData = async () => {
			try {
				const result = await getAllPassports();
				setPassportData(result ?? []);
			} catch (e) {}
		};
		const fetchCeremonyData = async () => {
			try {
				const result = await getCeremonyList();
				setCeremonyData(result ?? []);
			} catch (e) {}
		};

		if (reloadDatabase) {
			fetchPassportData();
			fetchCeremonyData();
			setReloadDatebase(false);
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

	const [ceremonySorting, setCeremonySorting] = React.useState<SortingState>(
		[],
	);
	const [ceremonyColumnFilters, setCeremonyColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [ceremonyColumnVisibility, setCeremonyColumnVisibility] =
		React.useState<VisibilityState>({});
	const [ceremonyRowSelection, setCeremonyRowSelection] = React.useState({});

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
		state: {
			sorting: ceremonySorting,
			columnFilters: ceremonyColumnFilters,
			columnVisibility: ceremonyColumnVisibility,
			rowSelection: ceremonyRowSelection,
		},
	});

	const [ceremonyTime, setCeremonyTime] = useState("noPassportCeremony");
	const [modifyCeremonyTime, setModifyCeremonyTime] =
		useState("noPassportCeremony");
	const [deleteCeremonyTime, setDeleteCeremonyTime] =
		useState("noPassportCeremony");

	return (
		<div className="w-full">
			<p>
				&quot;But wait!&quot; I hear you saying. &quot;Isn&apos;t everything
				just in random places?&quot;
			</p>
			<p>Yes. :D</p>
			<br />
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
												timeZone: "UTC",
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
												timeZone: "UTC",
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
										passportTable
											.getColumn("ceremony_time")
											?.setFilterValue(getCeremonyTimeDate(e).toISOString());
										setCeremonyTime(e);
									}}
								>
									<DropdownMenuRadioItem
										value="noPassportCeremony"
										className="flex justify-between items-center"
									>
										Select a Date
									</DropdownMenuRadioItem>
									<CeremonyDropdown />
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
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
										>
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
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
										>
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
						<div>
							<div className="flex-1 text-sm text-muted-foreground">
								{ceremonyTable.getFilteredSelectedRowModel().rows.length} of{" "}
								{ceremonyTable.getFilteredRowModel().rows.length} row(s)
								selected.
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
					<div className="grid grid-cols-3 gap-5 lg:gap-3 w-full max-w-4xl auto-cols-auto">
						<div className="grid-cols-subgrid">
							<Card className="space-y-8 mx-auto">
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
														<Label>
															<p className="pb-1">Set the time </p>
															<Input
																type="time"
																value={timeValue}
																onChange={handleTimeChange}
																className={cn(
																	"w-[240px] pl-3 pr-3 text-left font-normal",
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
												name="max_registrations"
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
												name="open_registration"
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
											>
												Submit
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
						<div className="grid-cols-subgrid">
							<Card className="space-y-8 mx-auto">
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
												name="modify_ceremony_time"
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
																					{getCeremonySlotsBadge(
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
																			<CeremonyDropdown />
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
												name="max_registrations_mod"
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
												name="open_registration_mod"
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
											>
												Submit
											</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
						<div className="grid-cols-subgrid">
							<Card className="space-y-16 mx-auto">
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
												name="delete_ceremony_time"
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
																					{getCeremonySlotsBadge(
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
																			<CeremonyDropdown />
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
											>
												Submit
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
