"use client";

import {
	ModalManager,
	ModalProvider,
	radixUiAlertDialog,
	radixUiAlertDialogContent,
	useModal,
	useModalData,
} from "shadcn-modal-manager";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Create an alert dialog modal using Radix
const DeleteConfirmDialog = ModalManager.create<{ itemName?: string }>(
	function DeleteConfirmContent() {
		const modal = useModal();
		const data = useModalData<{ itemName?: string }>();

		return (
			<AlertDialogPrimitive.Root {...radixUiAlertDialog(modal)}>
				<AlertDialogPrimitive.Portal>
					<AlertDialogPrimitive.Overlay
						className={cn(
							"fixed inset-0 z-50 bg-black/50",
							"data-[state=open]:animate-in data-[state=closed]:animate-out",
							"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						)}
					/>
					<AlertDialogPrimitive.Content
						{...radixUiAlertDialogContent(modal)}
						className={cn(
							"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-fd-border bg-fd-background p-6 shadow-lg sm:rounded-lg",
							"duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
							"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
							"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
						)}
					>
						<div className="flex flex-col space-y-2 text-center sm:text-left">
							<AlertDialogPrimitive.Title className="text-lg font-semibold">
								Delete {data?.itemName || "Item"}?
							</AlertDialogPrimitive.Title>
							<AlertDialogPrimitive.Description className="text-sm text-fd-muted-foreground">
								This action cannot be undone. This will permanently delete the
								item from our servers.
							</AlertDialogPrimitive.Description>
						</div>
						<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
							<AlertDialogPrimitive.Cancel asChild>
								<Button variant="outline" onClick={() => modal.dismiss()}>
									Cancel
								</Button>
							</AlertDialogPrimitive.Cancel>
							<AlertDialogPrimitive.Action asChild>
								<Button
									variant="destructive"
									onClick={() => modal.close({ deleted: true })}
								>
									Delete
								</Button>
							</AlertDialogPrimitive.Action>
						</div>
					</AlertDialogPrimitive.Content>
				</AlertDialogPrimitive.Portal>
			</AlertDialogPrimitive.Root>
		);
	},
);

export function RadixAlertDialogExample() {
	const handleDelete = async () => {
		const ref = ModalManager.open<{ deleted: boolean }>(DeleteConfirmDialog, {
			data: { itemName: "Project Alpha" },
			disableClose: true, // Prevent escape/click-outside closing
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
					Opens a confirmation dialog
				</span>
			</div>
		</ModalProvider>
	);
}
