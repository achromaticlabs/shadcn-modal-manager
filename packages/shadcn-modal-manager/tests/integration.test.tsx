/**
 * Integration Tests
 *
 * These tests verify the full modal lifecycle with actual DOM rendering,
 * similar to nice-modal-react's approach.
 */
import {
	act,
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalDefinition, ModalProvider } from "../src/context";
import {
	ALREADY_MOUNTED,
	cleanupAllCallbacks,
	MODAL_REGISTRY,
	resetUidSeed,
	setDispatch,
} from "../src/core";
import { useModal } from "../src/hooks";
import { ModalManager } from "../src/modal-manager";

const _delay = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));
const _noop = () => undefined;

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

/**
 * Test modal that simulates exit animation
 */
function TestModal({
	open = false,
	onExited,
	onClose,
	children,
}: {
	open?: boolean;
	onExited?: () => void;
	onClose?: () => void;
	children?: ReactNode;
}) {
	const lastOpenRef = useRef(open);
	const lastOpen = lastOpenRef.current;

	useEffect(() => {
		// Simulate exit animation completing
		if (!open && lastOpen && onExited) {
			const timer = setTimeout(onExited, 30);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [open, onExited, lastOpen]);

	lastOpenRef.current = open;

	if (!(open || lastOpen)) {
		return null;
	}

	return (
		<div data-testid="test-modal">
			<div>{children}</div>
			<button onClick={onClose} type="button">
				Close
			</button>
		</div>
	);
}

const HocTestModal = ModalManager.create<{ name?: string }>(
	({ name = "default" }) => {
		const modal = useModal();

		return (
			<TestModal
				onClose={modal.dismiss}
				onExited={modal.remove}
				open={modal.isOpen}
			>
				<span data-testid="modal-content">{name}</span>
			</TestModal>
		);
	},
);

describe("Full Modal Lifecycle", () => {
	it("open renders modal, close removes it after animation", async () => {
		ModalManager.register("test-modal", HocTestModal);
		render(<ModalProvider />);

		// Modal not visible initially
		expect(screen.queryByTestId("test-modal")).toBeNull();

		// Open modal
		act(() => {
			ModalManager.open("test-modal", { data: { name: "Hello" } });
		});

		// Modal is visible
		expect(screen.getByTestId("test-modal")).toBeInTheDocument();
		expect(screen.getByTestId("modal-content").textContent).toBe("Hello");

		// Close modal
		act(() => {
			ModalManager.close("test-modal");
		});

		// Modal still visible during animation
		expect(screen.getByTestId("test-modal")).toBeInTheDocument();

		// Wait for animation to complete and modal to be removed
		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});

	it("open by component reference works", async () => {
		render(<ModalProvider />);

		expect(screen.queryByTestId("test-modal")).toBeNull();

		act(() => {
			ModalManager.open(HocTestModal, { data: { name: "ComponentRef" } });
		});

		expect(screen.getByTestId("test-modal")).toBeInTheDocument();
		expect(screen.getByTestId("modal-content").textContent).toBe(
			"ComponentRef",
		);

		act(() => {
			ModalManager.close(HocTestModal);
		});

		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});
});

describe("Modal Registration Methods", () => {
	it("useModal with registered modal id", async () => {
		ModalManager.register("registered-modal", HocTestModal);

		let modalHandler: ReturnType<typeof useModal>;

		function App() {
			modalHandler = useModal("registered-modal");
			return <ModalProvider />;
		}

		render(<App />);

		act(() => {
			modalHandler.open({ name: "Registered" });
		});

		expect(screen.getByTestId("modal-content").textContent).toBe("Registered");

		act(() => {
			modalHandler.dismiss();
		});

		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});

	it("useModal with ModalDefinition declaration", async () => {
		let modalHandler: ReturnType<typeof useModal>;

		function App() {
			modalHandler = useModal("def-modal");
			return (
				<ModalProvider>
					<ModalDefinition component={HocTestModal} id="def-modal" />
				</ModalProvider>
			);
		}

		render(<App />);

		act(() => {
			modalHandler.open({ name: "FromDef" });
		});

		expect(screen.getByTestId("modal-content").textContent).toBe("FromDef");

		act(() => {
			modalHandler.dismiss();
		});

		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});

	it("useModal with component reference", async () => {
		let modalHandler: ReturnType<typeof useModal>;

		function App() {
			modalHandler = useModal(HocTestModal);
			return <ModalProvider />;
		}

		render(<App />);

		act(() => {
			modalHandler.open({ name: "ByComponent" });
		});

		expect(screen.getByTestId("modal-content").textContent).toBe("ByComponent");

		act(() => {
			modalHandler.dismiss();
		});

		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});
});

describe("Edge Cases", () => {
	it("close invalid id does not throw", () => {
		render(<ModalProvider />);

		expect(() => {
			ModalManager.close("nonexistent-id");
		}).not.toThrow();
	});

	it("open invalid id shows warning", () => {
		render(<ModalProvider />);

		const warnSpy = vi.spyOn(console, "warn").mockImplementation(_noop);

		act(() => {
			ModalManager.open("invalid-id");
		});

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining("No modal found for id: invalid-id"),
		);

		warnSpy.mockRestore();
	});

	it("defaultOpen shows modal immediately", async () => {
		render(
			<ModalProvider>
				<HocTestModal defaultOpen modalId="default-modal" name="Default" />
			</ModalProvider>,
		);
		await _delay(50); // Wait for useEffect
		expect(screen.getByTestId("test-modal")).toBeInTheDocument();

		act(() => {
			ModalManager.close("default-modal");
		});

		await waitForElementToBeRemoved(() => screen.queryByTestId("test-modal"));
	});

	it("keepMounted prevents removal after close", () => {
		const KeepMountedModal = ModalManager.create(() => {
			const modal = useModal();

			return (
				<div
					data-testid="keepmounted-modal"
					data-visible={String(modal.isOpen)}
				>
					<button onClick={modal.dismiss} type="button">
						Close
					</button>
				</div>
			);
		});

		render(
			<ModalProvider>
				<KeepMountedModal keepMounted modalId="keep-modal" />
			</ModalProvider>,
		);

		act(() => {
			ModalManager.open("keep-modal");
		});

		expect(screen.getByTestId("keepmounted-modal")).toBeInTheDocument();
		expect(
			screen.getByTestId("keepmounted-modal").getAttribute("data-visible"),
		).toBe("true");

		act(() => {
			ModalManager.close("keep-modal");
		});
		// Modal should still be in DOM but not visible
		expect(screen.getByTestId("keepmounted-modal")).toBeInTheDocument();
		expect(
			screen.getByTestId("keepmounted-modal").getAttribute("data-visible"),
		).toBe("false");
	});
});

describe("Redux Integration", () => {
	it("works with external dispatch and modals", () => {
		const dispatch = vi.fn();
		const modals = {};

		render(<ModalProvider dispatch={dispatch} modals={modals} />);

		act(() => {
			ModalManager.open("some-modal");
		});

		expect(dispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "shadcn-modal-manager/show",
				payload: expect.objectContaining({ modalId: "some-modal" }),
			}),
		);
	});
});

describe("ModalProvider", () => {
	it("throws error if open is called without provider", () => {
		// Reset dispatch to default throwing function
		setDispatch(() => {
			throw new Error(
				"No dispatch method detected. Did you wrap your app with ModalProvider?",
			);
		});

		expect(() => {
			ModalManager.open("test-modal");
		}).toThrow("No dispatch method detected");
	});

	it("renders children correctly", () => {
		render(
			<ModalProvider>
				<div data-testid="child-content">Hello World</div>
			</ModalProvider>,
		);

		expect(screen.getByTestId("child-content")).toBeInTheDocument();
		expect(screen.getByTestId("child-content").textContent).toBe("Hello World");
	});
});
