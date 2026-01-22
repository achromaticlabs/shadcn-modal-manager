import {
	type ComponentType,
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useReducer,
} from "react";
import { closeModal, openModal } from "./api";
import {
	ALREADY_MOUNTED,
	getUid,
	initialState,
	MODAL_REGISTRY,
	reducer,
	register,
	setDispatch,
	unregister,
} from "./core";
import type { ModalProviderProps, ModalStore } from "./types";

/**
 * Context for the modal store
 */
export const ModalContext = createContext<ModalStore>(initialState);

/**
 * Context for the current modal ID (used in HOC-wrapped components)
 */
export const ModalIdContext = createContext<string | null>(null);

/**
 * Component that renders all currently visible modals from the registry
 */
function ModalPlaceholder(): ReactNode {
	const modals = useContext(ModalContext);
	const visibleModalIds = Object.keys(modals).filter(
		(id) => modals[id] !== undefined,
	);

	// Build render list and warn about unregistered modals in single pass
	const toRender: Array<{
		id: string;
		comp: (typeof MODAL_REGISTRY)[string]["comp"];
		props: (typeof MODAL_REGISTRY)[string]["props"];
	}> = [];

	for (const id of visibleModalIds) {
		const entry = MODAL_REGISTRY[id];
		if (entry) {
			toRender.push({ id, comp: entry.comp, props: entry.props });
		} else if (!ALREADY_MOUNTED[id]) {
			console.warn(
				`[ModalManager] No modal found for id: ${id}. ` +
					"Please check if it is registered or declared via JSX.",
			);
		}
	}

	return (
		<>
			{toRender.map(({ id, comp: Comp, props }) => (
				<Comp key={id} modalId={id} {...props} />
			))}
		</>
	);
}

/**
 * Internal provider that creates its own reducer
 */
function InnerContextProvider({
	children,
}: {
	children: ReactNode;
}): ReactNode {
	const [modals, dispatch] = useReducer(reducer, initialState);
	setDispatch(dispatch);

	return (
		<ModalContext.Provider value={modals}>
			{children}
			<ModalPlaceholder />
		</ModalContext.Provider>
	);
}

/**
 * Modal Provider - wrap your app with this to enable modal management
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 *
 * // With external state management (Redux, etc.)
 * <ModalProvider dispatch={dispatch} modals={modals}>
 *   <App />
 * </ModalProvider>
 * ```
 */
export function ModalProvider({
	children,
	dispatch: givenDispatch,
	modals: givenModals,
}: ModalProviderProps): ReactNode {
	// If external state management is provided, use it
	if (givenDispatch && givenModals) {
		setDispatch(givenDispatch);
		return (
			<ModalContext.Provider value={givenModals}>
				{children}
				<ModalPlaceholder />
			</ModalContext.Provider>
		);
	}

	// Otherwise, use internal state management
	return <InnerContextProvider>{children}</InnerContextProvider>;
}

/**
 * Declarative modal definition component
 *
 * @example
 * ```tsx
 * <ModalDefinition id="my-modal" component={MyModal} />
 * ```
 */
export function ModalDefinition({
	id,
	component,
}: {
	id: string;
	// biome-ignore lint/suspicious/noExplicitAny: component props vary
	component: ComponentType<any>;
}): ReactNode {
	useEffect(() => {
		register(id, component);
		return () => {
			unregister(id);
		};
	}, [id, component]);

	return null;
}

/**
 * Imperative modal holder - useful for controlled scenarios
 *
 * @example
 * ```tsx
 * const handler = useRef<{ open?: Function; close?: Function }>({});
 *
 * <ModalHolder modal={MyModal} handler={handler.current} />
 *
 * // Later:
 * handler.current.open?.({ title: 'Hello' });
 * ```
 */
export function ModalHolder({
	modal,
	handler,
	...restProps
}: {
	// biome-ignore lint/suspicious/noExplicitAny: component props vary
	modal: string | ComponentType<any>;
	handler: {
		open?: (data?: Record<string, unknown>) => Promise<unknown>;
		close?: () => Promise<unknown>;
	};
	[key: string]: unknown;
}): ReactNode {
	const mid = useMemo(() => getUid(), []);

	// biome-ignore lint/suspicious/noExplicitAny: component props vary
	const ModalComp: ComponentType<any> | undefined =
		typeof modal === "string" ? MODAL_REGISTRY[modal]?.comp : modal;

	if (!handler) {
		throw new Error("[ModalManager] No handler found in ModalHolder.");
	}

	if (!ModalComp) {
		throw new Error(
			`[ModalManager] No modal found for id: ${String(modal)} in ModalHolder.`,
		);
	}

	// Attach open/close methods to handler after mount
	useEffect(() => {
		handler.open = (data?: Record<string, unknown>) => {
			const ref = openModal(mid, { data });
			return ref.afterClosed();
		};

		handler.close = () => {
			return closeModal(mid);
		};
	}, [mid, handler]);

	return <ModalComp modalId={mid} {...restProps} />;
}
