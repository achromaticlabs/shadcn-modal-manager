"use client";

import {
	ModalManager,
	ModalProvider,
	shadcnUiAlertDialog,
	useModal,
	useModalData,
} from "shadcn-modal-manager";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DeleteModal = ModalManager.create<{ itemName?: string }>(
	function DeleteModalContent() {
		const modal = useModal();
		const data = useModalData<{ itemName?: string }>();

		return (
			<AlertDialog {...shadcnUiAlertDialog(modal)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {data?.itemName || "Item"}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => modal.dismiss()}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={() => modal.close({ deleted: true })}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	},
);

export function ShadcnAlertDialogExample() {
	const handleDelete = async () => {
		const ref = ModalManager.open<{ deleted: boolean }>(DeleteModal, {
			data: { itemName: "Important File" },
		});
		const result = await ref.afterClosed();
		if (result?.deleted) {
			console.log("Item deleted!");
		}
	};

	return (
		<ModalProvider>
			<div className="flex items-center gap-4 rounded-lg border border-fd-border bg-fd-card p-6">
				<Button variant="destructive" onClick={handleDelete}>
					Delete Item
				</Button>
				<span className="text-sm text-fd-muted-foreground">
					Opens a confirmation alert
				</span>
			</div>
		</ModalProvider>
	);
}
