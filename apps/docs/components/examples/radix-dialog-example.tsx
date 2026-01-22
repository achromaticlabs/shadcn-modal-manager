"use client";

import {
	ModalManager,
	ModalProvider,
	radixUiDialog,
	radixUiDialogContent,
	useModal,
	useModalData,
} from "shadcn-modal-manager";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Create a modal component using Radix Dialog
const ExampleModal = ModalManager.create<{ title?: string; message?: string }>(
	function ExampleModalContent() {
		const modal = useModal();
		const data = useModalData<{ title?: string; message?: string }>();

		return (
			<DialogPrimitive.Root {...radixUiDialog(modal)}>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay
						className={cn(
							"fixed inset-0 z-50 bg-black/50",
							"data-[state=open]:animate-in data-[state=closed]:animate-out",
							"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						)}
					/>
					<DialogPrimitive.Content
						{...radixUiDialogContent(modal)}
						className={cn(
							"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-fd-border bg-fd-background p-6 shadow-lg sm:rounded-lg",
							"duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
							"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
							"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
							"data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
							"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
						)}
					>
						<div className="flex flex-col space-y-1.5 text-center sm:text-left">
							<DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
								{data?.title || "Example Modal"}
							</DialogPrimitive.Title>
							<DialogPrimitive.Description className="text-sm text-fd-muted-foreground">
								{data?.message ||
									"This modal is managed by react-shadcn-modal-manager with Radix Dialog."}
							</DialogPrimitive.Description>
						</div>
						<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
							<Button variant="outline" onClick={() => modal.dismiss()}>
								Cancel
							</Button>
							<Button onClick={() => modal.close({ confirmed: true })}>
								Confirm
							</Button>
						</div>
						<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-fd-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-fd-ring focus:ring-offset-2">
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		);
	},
);

export function RadixDialogExample() {
	const handleOpenModal = async () => {
		const ref = ModalManager.open<{ confirmed: boolean }>(ExampleModal, {
			data: {
				title: "Radix Dialog",
				message: "This dialog is fully managed by react-shadcn-modal-manager!",
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
				<Button onClick={handleOpenModal}>Open Radix Dialog</Button>
				<span className="text-sm text-fd-muted-foreground">
					Click to see the modal in action
				</span>
			</div>
		</ModalProvider>
	);
}
