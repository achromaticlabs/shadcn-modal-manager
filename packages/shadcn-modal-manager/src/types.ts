import type {
	ComponentType,
	Dispatch,
	JSXElementConstructor,
	ReactNode,
} from "react";

// =============================================================================
// Internal Types
// =============================================================================

/** Internal key for modal configuration stored in data */
export const MODAL_CONFIG_KEY = "__modalConfig" as const;

/** Internal modal configuration shape */
export interface InternalModalConfig {
	disableClose?: boolean;
	keepMounted?: boolean;
}

// =============================================================================
// State Types
// =============================================================================

/**
 * State for a single modal instance
 */
export interface ModalState {
	modalId: string;
	data?: Record<string, unknown>;
	isOpen?: boolean;
	delayOpen?: boolean;
	keepMounted?: boolean;
}

/**
 * Global modal store - maps modal IDs to their state
 */
export interface ModalStore {
	[key: string]: ModalState | undefined;
}

/**
 * Modal lifecycle state
 */
export type ModalLifecycleState = "open" | "closing" | "closed";

// =============================================================================
// Action Types (for Redux/external state management)
// =============================================================================

export type ModalActionType = "show" | "hide" | "remove" | "set-flags";

export interface ModalAction {
	type: `shadcn-modal-manager/${ModalActionType}`;
	payload: {
		modalId: string;
		data?: Record<string, unknown>;
		flags?: Record<string, unknown>;
	};
}

// =============================================================================
// Promise/Callback Types
// =============================================================================

/**
 * Deferred promise with exposed resolve/reject handlers
 */
export interface DeferredPromise<T = unknown> {
	resolve: (value: T) => void;
	reject: (reason: unknown) => void;
	promise: Promise<T>;
}

// =============================================================================
// Modal Handler Types (returned by useModal)
// =============================================================================

/**
 * Read-only state of a modal instance
 */
export interface ModalReadState<TData = Record<string, unknown>> {
	/** The modal's unique identifier */
	readonly modalId: string;
	/** Data passed to the modal via open() */
	readonly data: TData | undefined;
	/** Whether the modal is currently open */
	readonly isOpen: boolean;
	/** Whether to keep the modal mounted after closing */
	readonly keepMounted: boolean;
}

/**
 * Methods for controlling a modal
 */
export interface ModalControls<TData = Record<string, unknown>> {
	/** Open the modal with optional data */
	open: (data?: TData) => Promise<unknown>;
	/** Close the modal and resolve with a result */
	close: (result?: unknown) => void;
	/** Dismiss the modal (close without result, resolves undefined) */
	dismiss: () => void;
	/** Remove the modal from the DOM immediately */
	remove: () => void;
}

/**
 * Internal methods for animation lifecycle (used by adapters)
 * @internal
 */
export interface ModalAnimationHandlers {
	/** Called when closing animation completes */
	onAnimationEnd: () => void;
}

/**
 * Complete modal handler returned by useModal hook
 * Combines state, controls, and animation handlers
 */
export interface ModalHandler<TData = Record<string, unknown>>
	extends ModalReadState<TData>,
		ModalControls<TData>,
		ModalAnimationHandlers {}

// =============================================================================
// HOC Types
// =============================================================================

/**
 * Props injected into HOC-wrapped modal components
 * Note: Uses `modalId` instead of `id` to avoid conflicts with common props
 */
export interface ModalHocProps {
	modalId: string;
	defaultOpen?: boolean;
	keepMounted?: boolean;
}

/**
 * Registry entry for a modal component
 */
export interface ModalRegistryEntry<
	TProps extends Record<string, unknown> = Record<string, unknown>,
> {
	comp: ComponentType<ModalHocProps & TProps>;
	props?: TProps;
}

/**
 * Extract props from a component type, excluding HOC props
 */
export type ModalProps<T> =
	T extends JSXElementConstructor<infer P>
		? Omit<P, keyof ModalHocProps>
		: Record<string, unknown>;

// =============================================================================
// Provider Types
// =============================================================================

/**
 * Props for the ModalProvider component
 */
export interface ModalProviderProps {
	children?: ReactNode;
	/** Optional external dispatch for state management integration */
	dispatch?: Dispatch<ModalAction>;
	/** Optional external modal store */
	modals?: ModalStore;
}

// =============================================================================
// Modal Reference Type (returned by open())
// =============================================================================

/**
 * Modal reference for programmatic control
 * Provides lifecycle promises and control methods
 */
export interface ModalRef<TResult = unknown, TData = unknown> {
	/** Unique identifier for this modal instance */
	readonly modalId: string;
	/** Data passed to the modal */
	readonly data: TData | undefined;
	/** Whether the user is allowed to close the modal (via escape/outside click) */
	disableClose: boolean;
	/** Close the modal with an optional result */
	close: (result?: TResult) => void;
	/** Promise that resolves when the modal opening animation completes */
	afterOpened: () => Promise<void>;
	/** Promise that resolves with the result when the modal closing animation completes */
	afterClosed: () => Promise<TResult | undefined>;
	/** Promise that resolves when the modal starts closing (before animation) */
	beforeClosed: () => Promise<TResult | undefined>;
	/** Update the data passed to the modal */
	updateData: (data: Partial<TData>) => void;
	/** Get the current lifecycle state of the modal */
	getState: () => ModalLifecycleState;
}

/**
 * Configuration for opening a modal
 */
export interface ModalConfig<TData = unknown> {
	/** Data to pass to the modal component */
	readonly data?: TData;
	/** Keep the modal mounted in DOM after closing (for animation performance) */
	readonly keepMounted?: boolean;
	/** Custom ID for the modal (auto-generated if not provided) */
	readonly modalId?: string;
	/** Whether clicking outside/escape closes the modal */
	readonly disableClose?: boolean;
}

// =============================================================================
// Adapter Types (for UI library integration)
// =============================================================================

/**
 * Props for Radix UI Dialog root component
 */
export interface RadixDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Props for Radix UI Dialog content component
 */
export interface RadixDialogContentProps {
	onAnimationEndCapture: () => void;
	onEscapeKeyDown: (e?: Event) => void;
	onPointerDownOutside: (e?: Event) => void;
}

/**
 * Combined props for Shadcn Dialog
 */
export interface ShadcnDialogProps extends RadixDialogProps {
	onClose: () => void;
	onAnimationEndCapture: () => void;
}
