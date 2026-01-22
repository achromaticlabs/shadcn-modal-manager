"use client";

import {
	ModalManager,
	ModalProvider,
	shadcnUiDrawer,
	shadcnUiDrawerContent,
	useModal,
	useModalData,
} from "shadcn-modal-manager";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

const ExampleDrawer = ModalManager.create<{ title?: string; message?: string }>(
	function ExampleDrawerContent() {
		const modal = useModal();
		const data = useModalData<{ title?: string; message?: string }>();

		return (
			<Drawer {...shadcnUiDrawer(modal)}>
				<DrawerContent {...shadcnUiDrawerContent(modal)}>
					<DrawerHeader>
						<DrawerTitle>{data?.title || "Shadcn Drawer"}</DrawerTitle>
						<DrawerDescription>
							{data?.message ||
								"This drawer uses Shadcn UI components with react-shadcn-modal-manager."}
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button onClick={() => modal.close({ submitted: true })}>
							Submit
						</Button>
						<DrawerClose asChild>
							<Button variant="outline" onClick={() => modal.dismiss()}>
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	},
);

export function ShadcnDrawerExample() {
	const handleOpen = async () => {
		const ref = ModalManager.open<{ submitted: boolean }>(ExampleDrawer, {
			data: {
				title: "Shadcn Drawer",
				message: "Pull down or tap outside to close this drawer.",
			},
		});
		const result = await ref.afterClosed();
		if (result?.submitted) {
			console.log("Form submitted!");
		}
	};

	return (
		<ModalProvider>
			<div className="flex items-center gap-4 rounded-lg border border-fd-border bg-fd-card p-6">
				<Button onClick={handleOpen}>Open Drawer</Button>
				<span className="text-sm text-fd-muted-foreground">
					Opens a bottom drawer
				</span>
			</div>
		</ModalProvider>
	);
}
