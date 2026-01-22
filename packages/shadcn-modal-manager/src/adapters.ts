import type {
	ModalHandler,
	RadixDialogContentProps,
	RadixDialogProps,
	ShadcnDialogProps,
} from "./types";

/**
 * Options for adapter behavior
 */
export interface AdapterOptions {
	/** Prevent closing via escape key or clicking outside */
	disableClose?: boolean;
}

// ============================================
// Radix UI adapters
// ============================================

/**
 * Adapter for Radix UI Dialog root component
 */
export const radixUiDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Radix UI Dialog.Content component
 */
export const radixUiDialogContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Radix UI AlertDialog root component
 */
export const radixUiAlertDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Radix UI AlertDialog.Content component
 */
export const radixUiAlertDialogContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

// ============================================
// Shadcn UI adapters
// ============================================

/**
 * Adapter for Shadcn UI Dialog
 */
export const shadcnUiDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): ShadcnDialogProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	onClose: () => {
		if (!options?.disableClose) {
			modal.dismiss();
		}
	},
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Adapter for Shadcn UI DialogContent
 */
export const shadcnUiDialogContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Shadcn UI AlertDialog
 */
export const shadcnUiAlertDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): ShadcnDialogProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	onClose: () => {
		if (!options?.disableClose) {
			modal.dismiss();
		}
	},
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Adapter for Shadcn UI AlertDialogContent
 */
export const shadcnUiAlertDialogContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Shadcn UI Sheet
 */
export const shadcnUiSheet = (
	modal: ModalHandler,
	options?: AdapterOptions,
): ShadcnDialogProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	onClose: () => {
		if (!options?.disableClose) {
			modal.dismiss();
		}
	},
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Adapter for Shadcn UI SheetContent
 */
export const shadcnUiSheetContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Shadcn UI Popover
 */
export const shadcnUiPopover = (
	modal: ModalHandler,
	options?: AdapterOptions,
): { open: boolean; onOpenChange: (open: boolean) => void } => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
			modal.onAnimationEnd();
		}
	},
});

/**
 * Props returned by Shadcn UI Drawer adapters
 */
export interface ShadcnUiDrawerRootProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dismissible?: boolean;
}

/**
 * Props for Shadcn UI DrawerContent component
 */
export interface ShadcnUiDrawerContentProps {
	onAnimationEnd: () => void;
}

/**
 * Adapter for Shadcn UI Drawer
 */
export const shadcnUiDrawer = (
	modal: ModalHandler,
	options?: AdapterOptions,
): ShadcnUiDrawerRootProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	dismissible: !options?.disableClose,
});

/**
 * Adapter for Shadcn UI DrawerContent component
 */
export const shadcnUiDrawerContent = (
	modal: ModalHandler,
): ShadcnUiDrawerContentProps => ({
	onAnimationEnd: () => {
		modal.onAnimationEnd();
	},
});

// ============================================
// Radix UI Sheet adapters
// ============================================

/**
 * Adapter for Radix UI Sheet root component
 */
export const radixUiSheet = (
	modal: ModalHandler,
	options?: AdapterOptions,
): { open: boolean; onOpenChange: (open: boolean) => void } => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Radix UI Sheet.Content component
 */
export const radixUiSheetContent = (
	modal: ModalHandler,
	options?: AdapterOptions,
): RadixDialogContentProps => ({
	onAnimationEndCapture: () => {
		modal.onAnimationEnd();
	},
	onEscapeKeyDown: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
	onPointerDownOutside: (e?: Event) => {
		if (options?.disableClose) {
			e?.preventDefault();
		} else {
			modal.dismiss();
		}
	},
});

// ============================================
// Radix UI Popover adapter
// ============================================

/**
 * Adapter for Radix UI Popover
 */
export const radixUiPopover = (
	modal: ModalHandler,
	options?: AdapterOptions,
): { open: boolean; onOpenChange: (open: boolean) => void } => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
			modal.onAnimationEnd();
		}
	},
});

// ============================================
// Base UI adapters (v1+)
// ============================================

/**
 * Props returned by Base UI dialog adapters
 */
export interface BaseUiDialogRootProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dismissible?: boolean;
}

/**
 * Props for Base UI Dialog.Portal component
 */
export interface BaseUiDialogPortalProps {
	keepMounted?: boolean;
}

/**
 * Props for Base UI Dialog.Popup component
 */
export interface BaseUiDialogPopupProps {
	onAnimationEnd: () => void;
}

/**
 * Adapter for Base UI Dialog.Root component
 */
export const baseUiDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): BaseUiDialogRootProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	dismissible: !options?.disableClose,
});

/**
 * Adapter for Base UI Dialog.Portal component
 */
export const baseUiDialogPortal = (
	modal: ModalHandler,
): BaseUiDialogPortalProps => ({
	keepMounted: modal.keepMounted,
});

/**
 * Adapter for Base UI Dialog.Popup component
 */
export const baseUiDialogPopup = (
	modal: ModalHandler,
): BaseUiDialogPopupProps => ({
	onAnimationEnd: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Adapter for Base UI AlertDialog root component
 */
export const baseUiAlertDialog = (
	modal: ModalHandler,
	options?: AdapterOptions,
): BaseUiDialogRootProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	dismissible: !options?.disableClose,
});

/**
 * Adapter for Base UI AlertDialog.Portal component
 */
export const baseUiAlertDialogPortal = (
	modal: ModalHandler,
): BaseUiDialogPortalProps => ({
	keepMounted: modal.keepMounted,
});

/**
 * Adapter for Base UI AlertDialog.Popup component
 */
export const baseUiAlertDialogPopup = (
	modal: ModalHandler,
): BaseUiDialogPopupProps => ({
	onAnimationEnd: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Props returned by Base UI popover adapters
 */
export interface BaseUiPopoverRootProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Props for Base UI Popover.Portal component
 */
export interface BaseUiPopoverPortalProps {
	keepMounted?: boolean;
}

/**
 * Props for Base UI Popover.Popup component
 */
export interface BaseUiPopoverPopupProps {
	onAnimationEnd: () => void;
}

/**
 * Adapter for Base UI Popover.Root component
 */
export const baseUiPopover = (
	modal: ModalHandler,
	options?: AdapterOptions,
): BaseUiPopoverRootProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
});

/**
 * Adapter for Base UI Popover.Portal component
 */
export const baseUiPopoverPortal = (
	modal: ModalHandler,
): BaseUiPopoverPortalProps => ({
	keepMounted: modal.keepMounted,
});

/**
 * Adapter for Base UI Popover.Popup component
 */
export const baseUiPopoverPopup = (
	modal: ModalHandler,
): BaseUiPopoverPopupProps => ({
	onAnimationEnd: () => {
		modal.onAnimationEnd();
	},
});

/**
 * Adapter for Base UI Sheet root component
 */
export const baseUiSheet = (
	modal: ModalHandler,
	options?: AdapterOptions,
): BaseUiDialogRootProps => ({
	open: modal.isOpen,
	onOpenChange: (open: boolean) => {
		if (!(open || options?.disableClose)) {
			modal.dismiss();
		}
	},
	dismissible: !options?.disableClose,
});

/**
 * Adapter for Base UI Sheet.Portal component
 */
export const baseUiSheetPortal = (
	modal: ModalHandler,
): BaseUiDialogPortalProps => ({
	keepMounted: modal.keepMounted,
});

/**
 * Adapter for Base UI Sheet.Popup component
 */
export const baseUiSheetPopup = (
	modal: ModalHandler,
): BaseUiDialogPopupProps => ({
	onAnimationEnd: () => {
		modal.onAnimationEnd();
	},
});
