/**
 * Modal Lifecycle Integration Tests
 *
 * These tests verify the core behavior of the modal manager:
 * 1. State management (reducer)
 * 2. Promise resolution (open/close)
 * 3. Multiple modal tracking
 * 4. Data passing
 */
import { render, renderHook, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { useContext } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ModalContext,
	ModalDefinition,
	ModalHolder,
	ModalIdContext,
	ModalProvider,
} from "../src/context";
import {
	ALREADY_MOUNTED,
	actions,
	cleanupAllCallbacks,
	cleanupCallbacks,
	getModal,
	getModalId,
	getUid,
	hideModalCallbacks,
	initialState,
	MODAL_REGISTRY,
	modalCallbacks,
	reducer,
	register,
	resetUidSeed,
	setDispatch,
	unregister,
} from "../src/core";
import { useModal, useModalConfig, useModalData } from "../src/hooks";
import { ModalManager } from "../src/modal-manager";
import type { ModalStore } from "../src/types";

const MODAL_ID_PATTERN = /^_modal_\d+$/;
const noop = () => undefined;

beforeEach(() => {
	for (const key of Object.keys(MODAL_REGISTRY)) {
		delete MODAL_REGISTRY[key];
	}
	for (const key of Object.keys(ALREADY_MOUNTED)) {
		delete ALREADY_MOUNTED[key];
	}
	cleanupAllCallbacks();
	ModalManager.cleanupAll();
	resetUidSeed();
});

describe("Core State Management", () => {
	describe("Reducer", () => {
		it("open action adds modal with delayed visibility when not mounted", () => {
			const state = reducer(
				initialState,
				actions.open("modal1", { foo: "bar" }),
			);

			expect(state.modal1).toEqual({
				modalId: "modal1",
				data: { foo: "bar" },
				isOpen: false,
				delayOpen: true,
			});
		});

		it("open action sets isOpen immediately when already mounted", () => {
			ALREADY_MOUNTED.modal1 = true;
			const state = reducer(initialState, actions.open("modal1"));

			expect(state.modal1?.isOpen).toBe(true);
			expect(state.modal1?.delayOpen).toBe(false);
		});

		it("close action sets isOpen to false", () => {
			const state: ModalStore = {
				modal1: { modalId: "modal1", isOpen: true },
			};
			const newState = reducer(state, actions.close("modal1"));

			expect(newState.modal1?.isOpen).toBe(false);
		});

		it("close returns same state for nonexistent modal", () => {
			const state: ModalStore = {};
			const newState = reducer(state, actions.close("nonexistent"));

			expect(newState).toBe(state);
		});

		it("remove action deletes modal from state", () => {
			const state: ModalStore = {
				modal1: { modalId: "modal1", isOpen: false },
				modal2: { modalId: "modal2", isOpen: true },
			};
			const newState = reducer(state, actions.remove("modal1"));

			expect(newState.modal1).toBeUndefined();
			expect(newState.modal2).toBeDefined();
		});

		it("setFlags merges flags into existing modal", () => {
			const state: ModalStore = {
				modal1: { modalId: "modal1", isOpen: true },
			};
			const newState = reducer(
				state,
				actions.setFlags("modal1", { keepMounted: true }),
			);

			expect(newState.modal1?.keepMounted).toBe(true);
			expect(newState.modal1?.isOpen).toBe(true);
		});

		it("setFlags returns same state for nonexistent modal", () => {
			const state: ModalStore = {};
			const newState = reducer(
				state,
				actions.setFlags("nonexistent", { keepMounted: true }),
			);

			expect(newState).toBe(state);
		});
	});

	describe("Registry", () => {
		it("register adds component to registry", () => {
			const Component = () => null;
			register("test", Component);

			expect(MODAL_REGISTRY.test?.comp).toBe(Component);
		});

		it("register updates props for existing entry", () => {
			const Component = () => null;
			register("test", Component, { a: 1 });
			register("test", Component, { b: 2 });

			expect(MODAL_REGISTRY.test?.props).toEqual({ b: 2 });
		});

		it("unregister removes component", () => {
			const Component = () => null;
			register("test", Component);
			unregister("test");

			expect(MODAL_REGISTRY.test).toBeUndefined();
		});

		it("getModal returns registered component", () => {
			const Component = () => null;
			register("test", Component);

			expect(getModal("test")).toBe(Component);
		});

		it("getModalId returns string as-is", () => {
			expect(getModalId("my-modal")).toBe("my-modal");
		});

		it("getModalId generates and caches ID for components", () => {
			const Component = () => null;
			const id1 = getModalId(Component);
			const id2 = getModalId(Component);

			expect(id1).toMatch(MODAL_ID_PATTERN);
			expect(id1).toBe(id2);
		});

		it("getUid generates sequential IDs", () => {
			expect(getUid()).toBe("_modal_0");
			expect(getUid()).toBe("_modal_1");
			expect(getUid()).toBe("_modal_2");
		});
	});

	describe("Callbacks", () => {
		it("cleanupCallbacks removes callbacks for specific modal", () => {
			modalCallbacks.test = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};
			hideModalCallbacks.test = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};

			cleanupCallbacks("test");

			expect(modalCallbacks.test).toBeUndefined();
			expect(hideModalCallbacks.test).toBeUndefined();
		});

		it("cleanupAllCallbacks removes all callbacks", () => {
			modalCallbacks.a = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};
			modalCallbacks.b = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};
			hideModalCallbacks.c = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};

			cleanupAllCallbacks();

			expect(Object.keys(modalCallbacks)).toHaveLength(0);
			expect(Object.keys(hideModalCallbacks)).toHaveLength(0);
		});
	});
});

describe("API Functions", () => {
	const mockDispatch = vi.fn();

	beforeEach(() => {
		mockDispatch.mockClear();
		setDispatch(mockDispatch);
	});

	describe("close", () => {
		it("dispatches close action and returns promise", () => {
			const promise = ModalManager.close("test-modal");

			expect(mockDispatch).toHaveBeenCalledWith({
				type: "shadcn-modal-manager/hide",
				payload: { modalId: "test-modal" },
			});
			expect(promise).toBeInstanceOf(Promise);
		});

		it("resolves open promise with undefined when closing", () => {
			const resolveCallback = vi.fn();
			modalCallbacks.test = {
				resolve: resolveCallback,
				reject: vi.fn(),
				promise: Promise.resolve(),
			};

			ModalManager.close("test");

			expect(resolveCallback).toHaveBeenCalledWith(undefined);
		});
	});

	describe("remove", () => {
		it("dispatches remove action and cleans up callbacks", () => {
			modalCallbacks.test = {
				resolve: vi.fn(),
				reject: vi.fn(),
				promise: Promise.resolve(),
			};

			ModalManager.remove("test");

			expect(mockDispatch).toHaveBeenCalledWith({
				type: "shadcn-modal-manager/remove",
				payload: { modalId: "test" },
			});
			expect(modalCallbacks.test).toBeUndefined();
		});
	});

	describe("open (ModalRef API)", () => {
		it("returns ModalRef with modalId and data", () => {
			const Component = () => null;
			register("test", Component);

			const ref = ModalManager.open("test", { data: { userId: "123" } });

			expect(ref.modalId).toBe("test");
			expect(ref.data).toEqual({ userId: "123" });
		});

		it("dispatches open action", () => {
			const Component = () => null;
			register("test", Component);

			ModalManager.open("test", { data: { foo: "bar" } });

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "shadcn-modal-manager/show",
					payload: expect.objectContaining({ modalId: "test" }),
				}),
			);
		});

		it("auto-registers component on open", () => {
			const Component = () => null;
			ModalManager.open(Component);

			expect(Object.keys(MODAL_REGISTRY).length).toBe(1);
		});

		it("ModalManager.close() dispatches hide", () => {
			const Component = () => null;
			register("test", Component);

			const ref = ModalManager.open("test");
			ref.close("result");

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({ type: "shadcn-modal-manager/hide" }),
			);
		});

		it("getState() returns lifecycle state", () => {
			const Component = () => null;
			register("test", Component);

			const ref = ModalManager.open("test");
			expect(ref.getState()).toBe("open");

			ref.close();
			expect(ref.getState()).toBe("closing");
		});

		it("disableClose getter/setter works", () => {
			const Component = () => null;
			register("test", Component);

			const ref = ModalManager.open("test", { disableClose: false });
			expect(ref.disableClose).toBe(false);

			ref.disableClose = true;
			expect(ref.disableClose).toBe(true);
		});
	});

	describe("Multiple modal tracking", () => {
		it("getOpenModals returns IDs of open modals", () => {
			ModalManager.open("modal1");
			ModalManager.open("modal2");

			const openModals = ModalManager.getOpen();

			expect(openModals).toContain("modal1");
			expect(openModals).toContain("modal2");
		});

		it("hasOpenModals returns true when modals are open", () => {
			expect(ModalManager.hasOpen()).toBe(false);

			ModalManager.open("modal1");

			expect(ModalManager.hasOpen()).toBe(true);
		});

		it("closeAll dispatches close for all open modals", () => {
			ModalManager.open("modal1");
			ModalManager.open("modal2");
			mockDispatch.mockClear();

			// Don't await - just verify dispatch is called
			ModalManager.closeAll();

			const closeCalls = mockDispatch.mock.calls.filter(
				(call) => call[0].type === "shadcn-modal-manager/hide",
			);
			expect(closeCalls.length).toBe(2);
		});
	});
});

describe("React Integration", () => {
	describe("ModalProvider", () => {
		it("renders children", () => {
			render(
				<ModalProvider>
					<div data-testid="child">Child</div>
				</ModalProvider>,
			);

			expect(screen.getByTestId("child")).toBeDefined();
		});

		it("provides empty modal context initially", () => {
			let modals: ModalStore = { initial: { modalId: "initial" } };

			const TestComponent = () => {
				modals = useContext(ModalContext);
				return null;
			};

			render(
				<ModalProvider>
					<TestComponent />
				</ModalProvider>,
			);

			expect(modals).toEqual({});
		});

		it("uses external dispatch when provided", () => {
			const externalDispatch = vi.fn();
			const externalModals = { test: { modalId: "test", isOpen: true } };

			let capturedModals: ModalStore = {};
			const TestComponent = () => {
				capturedModals = useContext(ModalContext);
				return null;
			};

			render(
				<ModalProvider dispatch={externalDispatch} modals={externalModals}>
					<TestComponent />
				</ModalProvider>,
			);

			expect(capturedModals).toBe(externalModals);
		});
	});

	describe("ModalDefinition", () => {
		it("registers component on mount and unregisters on unmount", () => {
			const Component = () => <div>Modal</div>;

			const { unmount } = render(
				<ModalProvider>
					<ModalDefinition component={Component} id="def-modal" />
				</ModalProvider>,
			);

			expect(MODAL_REGISTRY["def-modal"]?.comp).toBe(Component);

			unmount();

			expect(MODAL_REGISTRY["def-modal"]).toBeUndefined();
		});
	});

	describe("ModalHolder", () => {
		it("throws when handler is missing", () => {
			const Component = () => <div>Modal</div>;

			expect(() => {
				// @ts-expect-error - testing invalid input
				render(<ModalHolder handler={null} modal={Component} />);
			}).toThrow("[ModalManager] No handler found in ModalHolder");
		});

		it("throws when string modal not found", () => {
			const handler = {};

			expect(() => {
				render(<ModalHolder handler={handler} modal="nonexistent" />);
			}).toThrow("[ModalManager] No modal found for id: nonexistent");
		});

		it("attaches open/close methods to handler", () => {
			const Component = ({ modalId }: { modalId: string }) => (
				<div>{modalId}</div>
			);
			const handler: {
				open?: (data?: Record<string, unknown>) => Promise<unknown>;
				close?: () => Promise<unknown>;
			} = {};

			render(
				<ModalProvider>
					<ModalHolder
						handler={handler}
						modal={Component as ComponentType<Record<string, unknown>>}
					/>
				</ModalProvider>,
			);

			expect(typeof handler.open).toBe("function");
			expect(typeof handler.close).toBe("function");
		});
	});

	describe("useModal hook", () => {
		it("returns handler with correct modalId", () => {
			const { result } = renderHook(() => useModal("test"), {
				wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
			});

			expect(result.current.modalId).toBe("test");
			expect(result.current.isOpen).toBe(false);
		});

		it("uses context modal ID when available", () => {
			const { result } = renderHook(() => useModal(), {
				wrapper: ({ children }) => (
					<ModalProvider>
						<ModalIdContext.Provider value="context-id">
							{children}
						</ModalIdContext.Provider>
					</ModalProvider>
				),
			});

			expect(result.current.modalId).toBe("context-id");
		});

		it("throws when no modal ID available", () => {
			expect(() => {
				renderHook(() => useModal(), {
					wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
				});
			}).toThrow("[ModalManager] No modal id found in useModal");
		});

		it("returns handler with open/close/dismiss methods", () => {
			const { result } = renderHook(() => useModal("test"), {
				wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
			});

			expect(typeof result.current.open).toBe("function");
			expect(typeof result.current.close).toBe("function");
			expect(typeof result.current.dismiss).toBe("function");
			expect(typeof result.current.remove).toBe("function");
			expect(typeof result.current.onAnimationEnd).toBe("function");
		});
	});

	describe("useModalData hook", () => {
		it("throws when used outside modal context", () => {
			expect(() => {
				renderHook(() => useModalData(), {
					wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
				});
			}).toThrow(
				"[ModalManager] useModalData must be used inside a modal component",
			);
		});

		it("returns undefined when no data passed", () => {
			const { result } = renderHook(() => useModalData(), {
				wrapper: ({ children }) => (
					<ModalProvider>
						<ModalIdContext.Provider value="test">
							{children}
						</ModalIdContext.Provider>
					</ModalProvider>
				),
			});

			expect(result.current).toBeUndefined();
		});
	});

	describe("useModalConfig hook", () => {
		it("throws when used outside modal context", () => {
			expect(() => {
				renderHook(() => useModalConfig(), {
					wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
				});
			}).toThrow(
				"[ModalManager] useModalConfig must be used inside a modal component",
			);
		});

		it("returns empty object when no config", () => {
			const { result } = renderHook(() => useModalConfig(), {
				wrapper: ({ children }) => (
					<ModalProvider>
						<ModalIdContext.Provider value="test">
							{children}
						</ModalIdContext.Provider>
					</ModalProvider>
				),
			});

			expect(result.current).toEqual({});
		});
	});
});

describe("HOC (createModal)", () => {
	it("sets displayName for debugging", () => {
		const MyModal = () => <div>Modal</div>;
		MyModal.displayName = "MyModal";

		const Wrapped = ModalManager.create(MyModal);

		expect(Wrapped.displayName).toBe("ModalManager(MyModal)");
	});

	it("provides ModalIdContext to wrapped component", () => {
		let capturedId: string | null = null;

		const TestModal = ModalManager.create(() => {
			capturedId = useContext(ModalIdContext);
			return <div data-testid="modal">Modal</div>;
		});

		render(
			<ModalProvider
				dispatch={noop}
				modals={{ test: { modalId: "test", isOpen: true } }}
			>
				<TestModal modalId="test" />
			</ModalProvider>,
		);

		expect(capturedId).toBe("test");
	});

	it("only renders when modal is in store", () => {
		const TestModal = ModalManager.create(() => (
			<div data-testid="modal">Modal</div>
		));

		const { rerender } = render(
			<ModalProvider dispatch={noop} modals={{}}>
				<TestModal modalId="test" />
			</ModalProvider>,
		);

		expect(screen.queryByTestId("modal")).toBeNull();

		rerender(
			<ModalProvider
				dispatch={noop}
				modals={{ test: { modalId: "test", isOpen: true } }}
			>
				<TestModal modalId="test" />
			</ModalProvider>,
		);

		expect(screen.getByTestId("modal")).toBeDefined();
	});

	it("tracks ALREADY_MOUNTED state", () => {
		const TestModal = ModalManager.create(() => <div>Modal</div>);

		const { unmount } = render(
			<ModalProvider
				dispatch={noop}
				modals={{ test: { modalId: "test", isOpen: true } }}
			>
				<TestModal modalId="test" />
			</ModalProvider>,
		);

		expect(ALREADY_MOUNTED.test).toBe(true);

		unmount();

		expect(ALREADY_MOUNTED.test).toBeUndefined();
	});
});
