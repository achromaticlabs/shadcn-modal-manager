// Primary API - ModalManager namespace

// Re-export adapter types
export type {
	AdapterOptions,
	BaseUiDialogPopupProps,
	BaseUiDialogPortalProps,
	BaseUiDialogRootProps,
	BaseUiPopoverPopupProps,
	BaseUiPopoverPortalProps,
	BaseUiPopoverRootProps,
	ShadcnUiDrawerContentProps,
	ShadcnUiDrawerRootProps,
} from "./adapters";
// Re-export adapters
export {
	// Base UI adapters
	baseUiAlertDialog,
	baseUiAlertDialogPopup,
	baseUiAlertDialogPortal,
	baseUiDialog,
	baseUiDialogPopup,
	baseUiDialogPortal,
	// Base UI Popover adapters
	baseUiPopover,
	baseUiPopoverPopup,
	baseUiPopoverPortal,
	// Base UI Sheet adapters
	baseUiSheet,
	baseUiSheetPopup,
	baseUiSheetPortal,
	// Radix UI adapters
	radixUiAlertDialog,
	radixUiAlertDialogContent,
	radixUiDialog,
	radixUiDialogContent,
	radixUiPopover,
	radixUiSheet,
	radixUiSheetContent,
	// Shadcn adapters
	shadcnUiAlertDialog,
	shadcnUiAlertDialogContent,
	shadcnUiDialog,
	shadcnUiDialogContent,
	shadcnUiDrawer,
	shadcnUiDrawerContent,
	shadcnUiPopover,
	shadcnUiSheet,
	shadcnUiSheetContent,
} from "./adapters";
// Re-export context and provider
export {
	ModalContext,
	ModalDefinition,
	ModalIdContext,
	ModalProvider,
} from "./context";
// Re-export core utilities (for advanced usage)
export { getModalId, reducer } from "./core";
// Re-export hooks
export { useModal, useModalConfig, useModalData } from "./hooks";
export { ModalManager } from "./modal-manager";
// Re-export types
export type {
	DeferredPromise,
	InternalModalConfig,
	ModalAction,
	ModalActionType,
	ModalAnimationHandlers,
	ModalConfig,
	ModalControls,
	ModalHandler,
	ModalHocProps,
	ModalLifecycleState,
	ModalProps,
	ModalProviderProps,
	ModalReadState,
	ModalRef,
	ModalState,
	ModalStore,
	RadixDialogContentProps,
	RadixDialogProps,
	ShadcnDialogProps,
} from "./types";
// Re-export constants
export { MODAL_CONFIG_KEY } from "./types";
