import { type ComponentType, type Ref, useContext, useEffect } from "react";
import { setFlags } from "./api";
import { ModalContext, ModalIdContext } from "./context";
import { ALREADY_MOUNTED } from "./core";
import { useModal } from "./hooks";
import type { ModalHocProps } from "./types";

/** Props passed directly to the HOC wrapper */
type HocOwnProps = ModalHocProps;

/** Props for components that accept a ref (React 19+ style) */
export interface RefProp<T> {
	ref?: Ref<T>;
}

/**
 * HOC to create a modal component with automatic registration and lifecycle management.
 * Uses React 19's ref-as-prop pattern (no forwardRef needed).
 *
 * @example
 * ```tsx
 * interface MyModalProps {
 *   title: string;
 *   onSave: () => void;
 * }
 *
 * const MyModal = createModal<MyModalProps>(({ title, onSave }) => {
 *   const modal = useModal();
 *
 *   return (
 *     <Dialog open={modal.open} onOpenChange={(open) => !open && modal.dismiss()}>
 *       <DialogContent onAnimationEnd={modal.onAnimationEnd}>
 *         <h2>{title}</h2>
 *         <Button onClick={() => { onSave(); modal.close(); }}>Save</Button>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * });
 *
 * // Usage
 * open(MyModal, { data: { title: 'Edit Item', onSave: handleSave } });
 * ```
 */
export const createModal = <
	TProps extends Record<string, unknown> = Record<string, unknown>,
	TRef = unknown,
>(
	Comp: ComponentType<TProps & RefProp<TRef>>,
): ComponentType<TProps & HocOwnProps & RefProp<TRef>> => {
	function WrappedComponent(allProps: TProps & HocOwnProps & RefProp<TRef>) {
		// Extract HOC props
		const { defaultOpen, keepMounted, modalId, ref, ...restProps } =
			allProps as HocOwnProps & RefProp<TRef> & Record<string, unknown>;
		const componentProps = restProps as TProps;

		const { data, open: openModal } = useModal(modalId);
		const modals = useContext(ModalContext);

		// Only mount if this modal exists in the store
		const shouldMount = modalId in modals;

		// Handle default visibility and track mounted state
		useEffect(() => {
			if (defaultOpen) {
				openModal();
			}

			ALREADY_MOUNTED[modalId] = true;

			return () => {
				delete ALREADY_MOUNTED[modalId];
			};
		}, [modalId, openModal, defaultOpen]);

		// Handle keepMounted flag
		useEffect(() => {
			if (keepMounted) {
				setFlags(modalId, { keepMounted: true });
			}
		}, [modalId, keepMounted]);

		// Handle delayed visibility (for modals shown before mount)
		const delayOpen = modals[modalId]?.delayOpen;
		useEffect(() => {
			if (delayOpen) {
				openModal(data);
			}
		}, [delayOpen, data, openModal]);

		if (!shouldMount) {
			return null;
		}

		// Merge static props with dynamic data from open()
		const mergedProps: TProps & RefProp<TRef> = {
			...componentProps,
			...(data as Partial<TProps>),
			ref,
		};

		return (
			<ModalIdContext.Provider value={modalId}>
				<Comp {...mergedProps} />
			</ModalIdContext.Provider>
		);
	}

	// Copy display name for debugging
	WrappedComponent.displayName = `ModalManager(${
		Comp.displayName || Comp.name || "Component"
	})`;

	return WrappedComponent;
};
