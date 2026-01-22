import {
	actions,
	getDispatch,
	getModalId,
	hideModalCallbacks,
	MODAL_REGISTRY,
	modalCallbacks,
	register,
} from "./core";
import type {
	DeferredPromise,
	ModalConfig,
	ModalLifecycleState,
	ModalRef,
} from "./types";
import { type InternalModalConfig, MODAL_CONFIG_KEY } from "./types";

/** Delay before cleaning up closed modal state (allows getState() calls) */
const CLEANUP_DELAY_MS = 5000;

/** Creates a deferred promise with exposed resolve/reject handlers */
function createDeferredPromise<T = unknown>(): DeferredPromise<T> {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { resolve, reject, promise };
}

// Store for opened promises (afterOpened callbacks)
const openedCallbacks: Record<
	string,
	{ resolve: () => void; promise: Promise<void> }
> = {};

// Store for beforeClosed promises
const beforeClosedCallbacks: Record<
	string,
	{ resolve: (result: unknown) => void; promise: Promise<unknown> }
> = {};

// Track modal lifecycle states
const modalStates: Record<string, ModalLifecycleState> = {};

// Store promises separately so they persist after close() deletes callbacks
// This ensures afterClosed() returns the correct promise even after close() is called
const closedPromises: Record<string, Promise<unknown>> = {};

/**
 * Clean up all internal state for a modal to prevent memory leaks
 */
export const cleanupModal = (modalId: string): void => {
	delete modalCallbacks[modalId];
	delete hideModalCallbacks[modalId];
	delete openedCallbacks[modalId];
	delete beforeClosedCallbacks[modalId];
	delete modalStates[modalId];
	delete closedPromises[modalId];
};

/**
 * Clean up all modal state (useful for testing)
 */
export const cleanupAllModals = (): void => {
	const allIds = new Set([
		...Object.keys(modalCallbacks),
		...Object.keys(hideModalCallbacks),
		...Object.keys(openedCallbacks),
		...Object.keys(beforeClosedCallbacks),
		...Object.keys(modalStates),
		...Object.keys(closedPromises),
	]);
	for (const id of allIds) {
		cleanupModal(id);
	}
};

/**
 * Close a modal and return a promise that resolves when the animation completes
 *
 * @example
 * ```tsx
 * await closeModal(MyModal);
 * await closeModal('my-modal');
 * ```
 */
export function closeModal<TResult = unknown>(
	// biome-ignore lint/suspicious/noExplicitAny: implementation signature needs flexibility
	modal: string | React.ComponentType<any>,
): Promise<TResult>;

export function closeModal(
	// biome-ignore lint/suspicious/noExplicitAny: implementation signature needs flexibility
	modal: string | React.ComponentType<any>,
): Promise<unknown> {
	const modalId = getModalId(modal);

	// Update state
	modalStates[modalId] = "closing";

	// Dispatch close action
	getDispatch()(actions.close(modalId));

	// Resolve open promise with undefined when closing directly
	if (modalCallbacks[modalId]) {
		modalCallbacks[modalId].resolve(undefined);
		delete modalCallbacks[modalId];
	}

	// Create close promise if it doesn't exist
	if (!hideModalCallbacks[modalId]) {
		hideModalCallbacks[modalId] = createDeferredPromise();
	}

	return hideModalCallbacks[modalId].promise;
}

/**
 * Remove a modal from the DOM completely
 *
 * @example
 * ```tsx
 * removeModal(MyModal);
 * removeModal('my-modal');
 * ```
 */
export const removeModal = (
	modal: string | React.ComponentType<Record<string, unknown>>,
): void => {
	const modalId = getModalId(modal);

	// Dispatch remove action
	getDispatch()(actions.remove(modalId));

	// Resolve any pending promises before cleanup
	modalCallbacks[modalId]?.resolve(undefined);
	hideModalCallbacks[modalId]?.resolve(undefined);
	beforeClosedCallbacks[modalId]?.resolve(undefined);
	openedCallbacks[modalId]?.resolve();

	// Clean up all callbacks to prevent memory leaks
	cleanupModal(modalId);
};

/**
 * Set flags on a modal (internal use)
 */
export const setFlags = (
	modalId: string,
	flags: Record<string, unknown>,
): void => {
	getDispatch()(actions.setFlags(modalId, flags));
};

/**
 * Open a modal and return a ModalRef for controlling it
 *
 * @example
 * ```tsx
 * // Open a modal with typed data
 * const modalRef = openModal<{ confirmed: boolean }, { userId: string }>(
 *   ConfirmModal,
 *   { data: { userId: '123' } }
 * );
 *
 * // Wait for it to close
 * const result = await modalRef.afterClosed();
 * if (result?.confirmed) {
 *   // User confirmed
 * }
 *
 * // Or close it programmatically
 * modalRef.close({ confirmed: false });
 *
 * // Check lifecycle state
 * if (modalRef.getState() === 'open') {
 *   modalRef.close();
 * }
 * ```
 */
export function openModal<TResult = unknown, TData = Record<string, unknown>>(
	// biome-ignore lint/suspicious/noExplicitAny: Modal components have varying props types due to createModal HOC
	modal: React.ComponentType<any>,
	config?: ModalConfig<TData>,
): ModalRef<TResult, TData>;

export function openModal<TResult = unknown, TData = Record<string, unknown>>(
	modal: string,
	config?: ModalConfig<TData>,
): ModalRef<TResult, TData>;

export function openModal<TResult = unknown, TData = Record<string, unknown>>(
	// biome-ignore lint/suspicious/noExplicitAny: Implementation signature needs flexibility
	modal: React.ComponentType<any> | string,
	config: ModalConfig<TData> = {},
): ModalRef<TResult, TData> {
	const modalId = config.modalId ?? getModalId(modal);

	// Auto-register if it's a component and not already registered
	if (typeof modal !== "string" && !MODAL_REGISTRY[modalId]) {
		register(modalId, modal);
	}

	// Track disableClose state for the ref
	let disableClose = config.disableClose ?? false;

	// Prepare data with internal config
	const modalConfig: InternalModalConfig = {
		disableClose,
		keepMounted: config.keepMounted,
	};
	const data: Record<string, unknown> = {
		...(config.data as Record<string, unknown>),
		[MODAL_CONFIG_KEY]: modalConfig,
	};

	// Set initial state
	modalStates[modalId] = "open";

	// Dispatch open action
	getDispatch()(actions.open(modalId, data));

	// Set keepMounted flag if specified
	if (config.keepMounted) {
		getDispatch()(actions.setFlags(modalId, { keepMounted: true }));
	}

	// Create show promise
	const mainCallbacks = createDeferredPromise();
	modalCallbacks[modalId] = mainCallbacks;

	// Store promise reference that persists after close() for afterClosed()
	closedPromises[modalId] = mainCallbacks.promise;

	// Create opened promise
	const openedDeferred = createDeferredPromise<void>();
	openedCallbacks[modalId] = {
		resolve: openedDeferred.resolve,
		promise: openedDeferred.promise,
	};

	// Create beforeClosed promise
	const beforeClosedDeferred = createDeferredPromise();
	beforeClosedCallbacks[modalId] = {
		resolve: beforeClosedDeferred.resolve,
		promise: beforeClosedDeferred.promise,
	};

	// Return the ModalRef
	const modalRef: ModalRef<TResult, TData> = {
		modalId,
		data: config.data,

		get disableClose() {
			return disableClose;
		},
		set disableClose(value: boolean) {
			disableClose = value;
			// Update the modal config
			const currentConfig =
				(data[MODAL_CONFIG_KEY] as InternalModalConfig) ?? {};
			const updatedData = {
				...data,
				[MODAL_CONFIG_KEY]: {
					...currentConfig,
					disableClose: value,
				},
			};
			getDispatch()(actions.setFlags(modalId, { data: updatedData }));
		},

		close: (result?: TResult) => {
			if (modalStates[modalId] === "closed") {
				return;
			}

			// Trigger beforeClosed
			modalStates[modalId] = "closing";
			beforeClosedCallbacks[modalId]?.resolve(result);
			delete beforeClosedCallbacks[modalId];

			// Resolve the main promise
			modalCallbacks[modalId]?.resolve(result);
			delete modalCallbacks[modalId];

			closeModal(modalId);
		},

		afterOpened: () => {
			return openedCallbacks[modalId]?.promise ?? Promise.resolve();
		},

		afterClosed: () => {
			// Return stored promise that persists even after close() is called
			return (closedPromises[modalId] ?? Promise.resolve(undefined)) as Promise<
				TResult | undefined
			>;
		},

		beforeClosed: () => {
			return (beforeClosedCallbacks[modalId]?.promise ??
				Promise.resolve(undefined)) as Promise<TResult | undefined>;
		},

		updateData: (newData: Partial<TData>) => {
			Object.assign(data, newData as Record<string, unknown>);
			getDispatch()(actions.open(modalId, data));
		},

		getState: () => {
			return modalStates[modalId] ?? "closed";
		},
	};

	return modalRef;
}

/**
 * Mark a modal as fully closed (called after animation completes)
 * @internal
 */
export const markClosed = (modalId: string): void => {
	modalStates[modalId] = "closed";
	// Clean up state after a delay to allow getState() calls
	setTimeout(() => {
		if (modalStates[modalId] === "closed") {
			delete modalStates[modalId];
			delete closedPromises[modalId];
		}
	}, CLEANUP_DELAY_MS);
};

/**
 * Get all currently open modal IDs
 *
 * @example
 * ```tsx
 * const openModals = ModalManager.getOpenModals();
 * console.log(`${openModals.length} modals are open`);
 * ```
 */
export const getOpenModals = (): string[] => {
	return Object.entries(modalStates)
		.filter(([_, state]) => state === "open" || state === "closing")
		.map(([id]) => id);
};

/**
 * Close all open modals
 * Useful for navigation, logout, or error handling scenarios
 * Returns a promise that resolves when all modals are hidden
 *
 * @example
 * ```tsx
 * // Close all modals when navigating away
 * useEffect(() => {
 *   return () => {
 *     closeAllModals();
 *   };
 * }, []);
 *
 * // Close all modals on logout
 * const handleLogout = async () => {
 *   await closeAllModals();
 *   logout();
 * };
 * ```
 */
export const closeAllModals = async (): Promise<void> => {
	const openModals = getOpenModals();

	// Collect all close promises to await them
	const closePromises: Promise<unknown>[] = [];

	for (const modalId of openModals) {
		// Trigger beforeClosed
		modalStates[modalId] = "closing";
		beforeClosedCallbacks[modalId]?.resolve(undefined);
		delete beforeClosedCallbacks[modalId];

		// Resolve the main promise with undefined
		modalCallbacks[modalId]?.resolve(undefined);
		delete modalCallbacks[modalId];

		// Close the modal and collect the promise
		closePromises.push(closeModal(modalId));
	}

	// Wait for all close animations to complete
	await Promise.all(closePromises);
};

/**
 * Check if any modals are currently open
 *
 * @example
 * ```tsx
 * if (ModalManager.hasOpenModals()) {
 *   // Prevent navigation or show warning
 * }
 * ```
 */
export const hasOpenModals = (): boolean => {
	return getOpenModals().length > 0;
};

/**
 * Notify that a modal has been opened (called internally after mount/animation)
 */
export const notifyOpened = (modalId: string): void => {
	openedCallbacks[modalId]?.resolve();
	delete openedCallbacks[modalId];
};
