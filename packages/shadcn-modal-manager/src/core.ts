import type { ComponentType, Dispatch } from "react";
import type {
	DeferredPromise,
	ModalAction,
	ModalHocProps,
	ModalRegistryEntry,
	ModalStore,
} from "./types";

/** Symbol for storing modal IDs on component functions */
const symModalId: unique symbol = Symbol("ModalManagerId");

/** Type for components with attached modal ID */
type ComponentWithModalId = ComponentType<Record<string, unknown>> & {
	[symModalId]?: string;
};

// Initial empty state
export const initialState: ModalStore = {};

// Modal registry - maps IDs to component definitions
export const MODAL_REGISTRY: Record<string, ModalRegistryEntry> = {};

// Track already mounted modals for delayed visibility
export const ALREADY_MOUNTED: Record<string, boolean> = {};

/** Promise callbacks for modal open/close resolution */
export const modalCallbacks: Record<string, DeferredPromise<unknown>> = {};
export const hideModalCallbacks: Record<string, DeferredPromise<unknown>> = {};

/**
 * Cleanup all callbacks for a modal (prevents memory leaks)
 */
export const cleanupCallbacks = (modalId: string): void => {
	delete modalCallbacks[modalId];
	delete hideModalCallbacks[modalId];
};

/**
 * Cleanup all callbacks (useful for testing or full reset)
 */
export const cleanupAllCallbacks = (): void => {
	for (const key of Object.keys(modalCallbacks)) {
		delete modalCallbacks[key];
	}
	for (const key of Object.keys(hideModalCallbacks)) {
		delete hideModalCallbacks[key];
	}
};

// UID counter for generating unique IDs
let uidSeed = 0;

/**
 * Reset the UID seed (useful for SSR to prevent hydration mismatches)
 * Call this on the server before rendering to ensure consistent IDs
 * @internal
 */
export const resetUidSeed = (): void => {
	uidSeed = 0;
};

// Note: If you need external store subscriptions, implement useSyncExternalStore support here

// Global dispatch function - set by Provider
let dispatchFn: Dispatch<ModalAction> = () => {
	throw new Error(
		"No dispatch method detected. Did you wrap your app with ModalProvider?",
	);
};

/**
 * Generate a unique modal ID
 */
export const getUid = (): string => `_modal_${uidSeed++}`;

/**
 * Get the modal ID from a string or component
 */
export const getModalId = (
	modal: string | ComponentType<Record<string, unknown>>,
): string => {
	if (typeof modal === "string") {
		return modal;
	}
	const modalWithId = modal as ComponentWithModalId;
	if (!modalWithId[symModalId]) {
		modalWithId[symModalId] = getUid();
	}
	return modalWithId[symModalId];
};

/**
 * Get a registered modal component by ID
 */
export const getModal = (
	modalId: string,
): ComponentType<ModalHocProps & Record<string, unknown>> | undefined => {
	return MODAL_REGISTRY[modalId]?.comp;
};

/**
 * Set the global dispatch function
 */
export const setDispatch = (fn: Dispatch<ModalAction>): void => {
	dispatchFn = fn;
};

/**
 * Get the current dispatch function
 */
export const getDispatch = (): Dispatch<ModalAction> => dispatchFn;

/**
 * Action creators
 */
export const actions = {
	open: (modalId: string, data?: Record<string, unknown>): ModalAction => ({
		type: "shadcn-modal-manager/show",
		payload: { modalId, data },
	}),

	close: (modalId: string): ModalAction => ({
		type: "shadcn-modal-manager/hide",
		payload: { modalId },
	}),

	remove: (modalId: string): ModalAction => ({
		type: "shadcn-modal-manager/remove",
		payload: { modalId },
	}),

	setFlags: (modalId: string, flags: Record<string, unknown>): ModalAction => ({
		type: "shadcn-modal-manager/set-flags",
		payload: { modalId, flags },
	}),
};

/**
 * Reducer for modal state management
 */
export const reducer = (state: ModalStore, action: ModalAction): ModalStore => {
	switch (action.type) {
		case "shadcn-modal-manager/show": {
			const { modalId, data } = action.payload;
			return {
				...state,
				[modalId]: {
					...state[modalId],
					modalId,
					data,
					// If already mounted, show immediately; otherwise delay
					isOpen: !!ALREADY_MOUNTED[modalId],
					delayOpen: !ALREADY_MOUNTED[modalId],
				},
			};
		}

		case "shadcn-modal-manager/hide": {
			const { modalId } = action.payload;
			const modalState = state[modalId];
			if (!modalState) {
				return state;
			}
			return {
				...state,
				[modalId]: {
					...modalState,
					isOpen: false,
				},
			};
		}

		case "shadcn-modal-manager/remove": {
			const { modalId } = action.payload;
			const newState = { ...state };
			delete newState[modalId];
			return newState;
		}

		case "shadcn-modal-manager/set-flags": {
			const { modalId, flags } = action.payload;
			const existingState = state[modalId];
			// Only set flags if the modal exists
			if (!existingState) {
				return state;
			}
			return {
				...state,
				[modalId]: {
					...existingState,
					...flags,
				},
			};
		}

		default:
			return state;
	}
};

/**
 * Register a modal component
 */
export const register = (
	id: string,
	// biome-ignore lint/suspicious/noExplicitAny: component props vary
	comp: ComponentType<any>,
	props?: Record<string, unknown>,
): void => {
	if (MODAL_REGISTRY[id]) {
		MODAL_REGISTRY[id].props = props;
	} else {
		MODAL_REGISTRY[id] = {
			comp: comp as ComponentType<ModalHocProps & Record<string, unknown>>,
			props,
		};
	}
};

/**
 * Unregister a modal component
 */
export const unregister = (id: string): void => {
	delete MODAL_REGISTRY[id];
};
