import {
	cleanupAllModals,
	cleanupModal,
	closeAllModals,
	closeModal,
	getOpenModals,
	hasOpenModals,
	openModal,
	removeModal,
} from "./api";
import { register, unregister } from "./core";
import { createModal } from "./hoc";

/**
 * ModalManager namespace - the primary API for managing modals.
 *
 * @example
 * ```tsx
 * import { ModalManager } from "shadcn-modal-manager";
 *
 * // Create a modal
 * const MyModal = ModalManager.create<{ message: string }>(({ message }) => {
 *   const modal = useModal();
 *   return (
 *     <Dialog {...radixDialog(modal)}>
 *       <DialogContent {...radixDialogContent(modal)}>
 *         <p>{message}</p>
 *         <button onClick={() => modal.close(true)}>Confirm</button>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * });
 *
 * // Open it
 * const result = await ModalManager.open(MyModal, {
 *   data: { message: "Hello!" }
 * }).afterClosed();
 *
 * // Close it
 * ModalManager.close(MyModal);
 *
 * // Close all modals
 * ModalManager.closeAll();
 * ```
 */
export const ModalManager = {
	/**
	 * Create a modal component with lifecycle management.
	 * Wraps your component with automatic registration and state handling.
	 */
	create: createModal,

	/**
	 * Open a modal and return a ModalRef for controlling it.
	 * @returns ModalRef with afterOpened(), afterClosed(), beforeClosed() promises
	 */
	open: openModal,

	/**
	 * Close a specific modal by component or ID.
	 * @returns Promise that resolves when the close animation completes
	 */
	close: closeModal,

	/**
	 * Close all open modals.
	 * @returns Promise that resolves when all close animations complete
	 */
	closeAll: closeAllModals,

	/**
	 * Remove a modal from the DOM completely.
	 */
	remove: removeModal,

	/**
	 * Check if any modals are currently open.
	 */
	hasOpen: hasOpenModals,

	/**
	 * Get array of currently open modal IDs.
	 */
	getOpen: getOpenModals,

	/**
	 * Register a modal component with an ID for later use.
	 */
	register,

	/**
	 * Unregister a previously registered modal.
	 */
	unregister,

	/**
	 * Clean up all internal state for a specific modal.
	 */
	cleanup: cleanupModal,

	/**
	 * Clean up all modal state (useful for testing).
	 */
	cleanupAll: cleanupAllModals,
} as const;
