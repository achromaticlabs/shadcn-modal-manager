"use client";

import {
	ModalManager,
	ModalProvider,
	shadcnUiDialog,
	useModal,
	useModalData,
} from "shadcn-modal-manager";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const ExampleModal = ModalManager.create<{ title?: string; message?: string }>(
	function ExampleModalContent() {
		const modal = useModal();
		const data = useModalData<{ title?: string; message?: string }>();

		return (
			<Dialog {...shadcnUiDialog(modal)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{data?.title || "Shadcn Dialog"}</DialogTitle>
						<DialogDescription>
							{data?.message ||
								"This dialog uses Shadcn UI components with react-shadcn-modal-manager."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => modal.dismiss()}>
							Cancel
						</Button>
						<Button onClick={() => modal.close({ confirmed: true })}>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
);

export function ShadcnDialogExample() {
	const handleOpen = async () => {
		const ref = ModalManager.open<{ confirmed: boolean }>(ExampleModal, {
			data: {
				title: "Shadcn Dialog",
				message:
					"This is a Shadcn-styled dialog managed by react-shadcn-modal-manager!",
			},
		});
		const result = await ref.afterClosed();
		if (result?.confirmed) {
			console.log("User confirmed!");
		}
	};

	return (
		<ModalProvider>
			<div className="flex items-center gap-4 rounded-lg border border-fd-border bg-fd-card p-6">
				<Button onClick={handleOpen}>Open Shadcn Dialog</Button>
				<span className="text-sm text-fd-muted-foreground">
					Click to see the dialog
				</span>
			</div>
		</ModalProvider>
	);
}
