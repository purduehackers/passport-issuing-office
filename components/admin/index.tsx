"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PassportTab from "./tabs/PassportTab";
import CeremonyTab from "./tabs/CeremonyTab";
import UserTab from "./tabs/UserTab";

export default function AdminPage() {
	const [reloadKey, setReloadKey] = useState(0);

	const triggerReload = () => {
		setReloadKey((prev) => prev + 1);
	};

	return (
		<div className="w-full">
			<Tabs
				defaultValue="passports"
				className="w-full min-w-0"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="passports">Passport List</TabsTrigger>
					<TabsTrigger value="ceremonies">Upcoming Ceremony List</TabsTrigger>
					<TabsTrigger value="users">User List</TabsTrigger>
				</TabsList>
				<TabsContent value="passports">
					<PassportTab reloadKey={reloadKey} />
				</TabsContent>
				<TabsContent value="ceremonies">
					<CeremonyTab
						reloadKey={reloadKey}
						triggerReload={triggerReload}
					/>
				</TabsContent>
				<TabsContent value="users">
					<UserTab reloadKey={reloadKey} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
