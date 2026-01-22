import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import {
	closeModal,
	markClosed,
	notifyOpened,
	openModal,
	removeModal,
} from "./api";
import { ModalContext, ModalIdContext } from "./context";
import {
	getModalId,
	hideModalCallbacks,
	MODAL_REGISTRY,
	modalCallbacks,
	register,
} from "./core";
import type { ModalHandler, ModalHocProps, ModalProps } from "./types";
import { type InternalModalConfig, MODAL_CONFIG_KEY } from "./types";

/**
 * Hook to control a modal from within the modal component or from anywhere.
 * Returns an enhanced handler with state and control methods.
 *
 * @example
 * ```tsx
 * // Inside a modal component (uses context)
 * const modal = useModal();
 *
 * return (
 *   <Dialog open={modal.open} onOpenChange={(open) => !open && modal.dismiss()}>
 *     <DialogContent onAnimationEnd={modal.onAnimationEnd}>
 *       <Button onClick={() => modal.close(result)}>Save</Button>
 *       <Button onClick={modal.dismiss}>Cancel</Button>
 *     </DialogContent>
 *   </Dialog>
 * );
 *
 * // With a specific modal component
 * const modal = useModal(MyModal);
 * modal.open({ userId: '123' });
 *
 * // With a string ID
 * const modal = useModal('my-modal');
 * ```
 */

export function useModal(
	modal?: string,
	data?: Record<string, unknown>,
): ModalHandler;

export function useModal<
	TProps extends Record<string, unknown>,
	P extends Partial<ModalProps<React.ComponentType<TProps & ModalHocProps>>>,
>(
	modal: React.ComponentType<TProps & ModalHocProps>,
	data?: P,
): ModalHandler<TProps>;

export function useModal(
	// biome-ignore lint/suspicious/noExplicitAny: component props vary
	modal?: React.ComponentType<any> | string,
	initialData?: Record<string, unknown>,
): ModalHandler {
	const modals = useContext(ModalContext);
	const contextModalId = useContext(ModalIdContext);

	// Determine modal ID - from argument or context
	const modalId = modal ? getModalId(modal) : contextModalId;

	if (!modalId) {
		throw new Error(
			"[ModalManager] No modal id found in useModal. " +
				"Either pass a modal component/id or use inside a modal component.",
		);
	}

	// Check if modal argument is a component reference (not a string ID)
	// Note: ForwardRefExoticComponent is an object, not a function
	const isComponentRef = modal !== undefined && typeof modal !== "string";

	// Register component if passed and not already registered
	useEffect(() => {
		if (isComponentRef && !MODAL_REGISTRY[modalId]) {
			register(
				modalId,
				modal as React.ComponentType<Record<string, unknown>>,
				initialData,
			);
		}
	}, [isComponentRef, modalId, modal, initialData]);

	const modalInfo = modals[modalId];

	// Use refs to avoid stale closures in animation handlers
	const modalInfoRef = useRef(modalInfo);
	useEffect(() => {
		modalInfoRef.current = modalInfo;
	}, [modalInfo]);

	// Memoized control methods
	const openCallback = useCallback(
		(data?: Record<string, unknown>) => {
			const ref = openModal(modalId, { data });
			return ref.afterClosed();
		},
		[modalId],
	);

	const closeCallback = useCallback(
		(result?: unknown) => {
			modalCallbacks[modalId]?.resolve(result);
			delete modalCallbacks[modalId];
			closeModal(modalId);
		},
		[modalId],
	);

	const dismissCallback = useCallback(() => {
		modalCallbacks[modalId]?.resolve(undefined);
		delete modalCallbacks[modalId];
		closeModal(modalId);
	}, [modalId]);

	const removeCallback = useCallback(() => removeModal(modalId), [modalId]);

	// Animation completion handler
	const onAnimationEnd = useCallback(() => {
		const current = modalInfoRef.current;

		if (current?.isOpen) {
			// Modal is opening - notify afterOpened promise
			notifyOpened(modalId);
		} else {
			// Modal is closing - mark as fully closed
			markClosed(modalId);

			// Resolve close promise when closing animation completes
			hideModalCallbacks[modalId]?.resolve(undefined);
			delete hideModalCallbacks[modalId];

			// Remove if not keepMounted (use ref for latest value)
			if (!current?.keepMounted) {
				removeModal(modalId);
			}
		}
	}, [modalId]);

	return useMemo(
		() => ({
			// State
			modalId,
			data: modalInfo?.data,
			isOpen: !!modalInfo?.isOpen,
			keepMounted: !!modalInfo?.keepMounted,
			// Controls
			open: openCallback,
			close: closeCallback,
			dismiss: dismissCallback,
			remove: removeCallback,
			// Animation handler
			onAnimationEnd,
		}),
		[
			modalId,
			modalInfo?.data,
			modalInfo?.isOpen,
			modalInfo?.keepMounted,
			openCallback,
			closeCallback,
			dismissCallback,
			removeCallback,
			onAnimationEnd,
		],
	);
}

/**
 * Hook to get typed data passed to a modal
 * Must be used inside a modal component (within ModalIdContext)
 *
 * @example
 * ```tsx
 * interface MyModalData {
 *   userId: string;
 *   userName: string;
 * }
 *
 * const MyModal = createModal(() => {
 *   const data = useModalData<MyModalData>();
 *   const modal = useModal();
 *
 *   return (
 *     <Dialog open={modal.open}>
 *       <DialogContent>
 *         <p>User: {data?.userName}</p>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * });
 *
 * // Usage:
 * open(MyModal, { data: { userId: '123', userName: 'John' } });
 * ```
 */
export function useModalData<TData = Record<string, unknown>>():
	| TData
	| undefined {
	const modals = useContext(ModalContext);
	const modalId = useContext(ModalIdContext);

	if (!modalId) {
		throw new Error(
			"[ModalManager] useModalData must be used inside a modal component. " +
				"Make sure you're using createModal() to wrap your modal.",
		);
	}

	const modalInfo = modals[modalId];
	const data = modalInfo?.data;

	// Filter out internal modal config from user data
	if (!data) {
		return undefined;
	}
	const { [MODAL_CONFIG_KEY]: _, ...userData } = data;
	return userData as TData;
}

/**
 * Hook to get the modal config options (disableClose, keepMounted, etc.)
 * Must be used inside a modal component
 */
export function useModalConfig(): InternalModalConfig {
	const modals = useContext(ModalContext);
	const modalId = useContext(ModalIdContext);

	if (!modalId) {
		throw new Error(
			"[ModalManager] useModalConfig must be used inside a modal component.",
		);
	}

	const modalInfo = modals[modalId];
	const config = modalInfo?.data?.[MODAL_CONFIG_KEY] as
		| InternalModalConfig
		| undefined;

	return config ?? {};
}
