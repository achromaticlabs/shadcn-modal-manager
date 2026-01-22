/**
 * Adapter Integration Tests
 *
 * Adapters translate modal handler state into UI library props.
 * These tests verify the BEHAVIOR - that the adapters:
 * 1. Correctly map visibility state to open prop
 * 2. Call dismiss() at the right times
 * 3. Trigger onAnimationEnd() for animation lifecycle
 * 4. Respect disableClose option
 */
import { describe, expect, it, vi } from "vitest";
import {
	baseUiAlertDialog,
	baseUiAlertDialogPopup,
	baseUiAlertDialogPortal,
	baseUiDialog,
	baseUiDialogPopup,
	baseUiDialogPortal,
	baseUiPopover,
	baseUiPopoverPopup,
	baseUiPopoverPortal,
	baseUiSheet,
	baseUiSheetPopup,
	baseUiSheetPortal,
	radixUiAlertDialog,
	radixUiAlertDialogContent,
	radixUiDialog,
	radixUiDialogContent,
	radixUiPopover,
	radixUiSheet,
	radixUiSheetContent,
	shadcnUiAlertDialog,
	shadcnUiAlertDialogContent,
	shadcnUiDialog,
	shadcnUiDialogContent,
	shadcnUiDrawer,
	shadcnUiDrawerContent,
	shadcnUiPopover,
	shadcnUiSheet,
	shadcnUiSheetContent,
} from "../src/adapters";
import type { ModalHandler } from "../src/types";

const createHandler = (overrides?: Partial<ModalHandler>): ModalHandler => ({
	modalId: "test",
	isOpen: true,
	keepMounted: false,
	data: {},
	open: vi.fn(),
	close: vi.fn(),
	dismiss: vi.fn(),
	remove: vi.fn(),
	onAnimationEnd: vi.fn(),
	...overrides,
});

describe("Radix UI Adapters", () => {
	describe("radixUiDialog", () => {
		it("maps isOpen state to open prop", () => {
			expect(radixUiDialog(createHandler({ isOpen: true })).open).toBe(true);
			expect(radixUiDialog(createHandler({ isOpen: false })).open).toBe(false);
		});

		it("calls dismiss() when user closes dialog (onOpenChange false)", () => {
			const handler = createHandler();
			const props = radixUiDialog(handler);
			props.onOpenChange(false);
			expect(handler.dismiss).toHaveBeenCalledTimes(1);
		});

		it("respects disableClose option", () => {
			const handler = createHandler();
			const props = radixUiDialog(handler, { disableClose: true });
			props.onOpenChange(false);
			expect(handler.dismiss).not.toHaveBeenCalled();
		});
	});

	describe("radixUiDialogContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = radixUiDialogContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("dismisses on escape key unless disableClose is set", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			// Normal behavior
			radixUiDialogContent(handler).onEscapeKeyDown?.(event);
			expect(handler.dismiss).toHaveBeenCalled();

			// Disabled close
			vi.clearAllMocks();
			radixUiDialogContent(handler, { disableClose: true }).onEscapeKeyDown?.(
				event,
			);
			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalled();
		});

		it("dismisses on pointer down outside unless disableClose is set", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			radixUiDialogContent(handler).onPointerDownOutside?.(event);
			expect(handler.dismiss).toHaveBeenCalled();

			vi.clearAllMocks();
			radixUiDialogContent(handler, {
				disableClose: true,
			}).onPointerDownOutside?.(event);
			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalled();
		});
	});

	describe("radixUiAlertDialog", () => {
		it("maps isOpen state to open prop", () => {
			expect(radixUiAlertDialog(createHandler({ isOpen: true })).open).toBe(
				true,
			);
			expect(radixUiAlertDialog(createHandler({ isOpen: false })).open).toBe(
				false,
			);
		});
	});

	describe("radixUiAlertDialogContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = radixUiAlertDialogContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("respects disableClose for escape and pointer events", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			const props = radixUiAlertDialogContent(handler, { disableClose: true });
			props.onEscapeKeyDown?.(event);
			props.onPointerDownOutside?.(event);

			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalledTimes(2);
		});
	});

	describe("radixUiSheet", () => {
		it("maps isOpen state to open prop", () => {
			expect(radixUiSheet(createHandler({ isOpen: true })).open).toBe(true);
		});
	});

	describe("radixUiSheetContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = radixUiSheetContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("respects disableClose for escape and pointer events", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			const props = radixUiSheetContent(handler, { disableClose: true });
			props.onEscapeKeyDown?.(event);
			props.onPointerDownOutside?.(event);

			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalledTimes(2);
		});
	});

	describe("radixUiPopover", () => {
		it("calls dismiss and onAnimationEnd immediately on close", () => {
			const handler = createHandler();
			const props = radixUiPopover(handler);
			props.onOpenChange(false);
			expect(handler.dismiss).toHaveBeenCalled();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});
});

describe("Shadcn UI Adapters", () => {
	describe("shadcnUiDialog", () => {
		it("maps isOpen state to open prop", () => {
			expect(shadcnUiDialog(createHandler({ isOpen: true })).open).toBe(true);
		});

		it("onClose calls dismiss", () => {
			const handler = createHandler();
			const props = shadcnUiDialog(handler);
			props.onClose();
			expect(handler.dismiss).toHaveBeenCalled();
		});

		it("respects disableClose option in onClose", () => {
			const handler = createHandler();
			const props = shadcnUiDialog(handler, { disableClose: true });
			props.onClose();
			expect(handler.dismiss).not.toHaveBeenCalled();
		});

		it("triggers onAnimationEnd on animation end capture", () => {
			const handler = createHandler();
			shadcnUiDialog(handler).onAnimationEndCapture?.();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("shadcnUiDialogContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = shadcnUiDialogContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("respects disableClose for escape and pointer events", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			const props = shadcnUiDialogContent(handler, { disableClose: true });
			props.onEscapeKeyDown?.(event);
			props.onPointerDownOutside?.(event);

			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalledTimes(2);
		});
	});

	describe("shadcnUiDrawer", () => {
		it("sets dismissible based on disableClose", () => {
			expect(shadcnUiDrawer(createHandler()).dismissible).toBe(true);
			expect(
				shadcnUiDrawer(createHandler(), { disableClose: true }).dismissible,
			).toBe(false);
		});

		it("calls onAnimationEnd on animation end", () => {
			const handler = createHandler();
			const props = shadcnUiDrawerContent(handler);
			props.onAnimationEnd();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("shadcnUiSheet", () => {
		it("onClose calls dismiss", () => {
			const handler = createHandler();
			const props = shadcnUiSheet(handler);
			props.onClose();
			expect(handler.dismiss).toHaveBeenCalled();
		});

		it("triggers onAnimationEnd on animation end capture", () => {
			const handler = createHandler();
			shadcnUiSheet(handler).onAnimationEndCapture?.();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("shadcnUiSheetContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = shadcnUiSheetContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("respects disableClose for escape and pointer events", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			const props = shadcnUiSheetContent(handler, { disableClose: true });
			props.onEscapeKeyDown?.(event);
			props.onPointerDownOutside?.(event);

			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalledTimes(2);
		});
	});

	describe("shadcnUiAlertDialog", () => {
		it("onClose calls dismiss", () => {
			const handler = createHandler();
			const props = shadcnUiAlertDialog(handler);
			props.onClose();
			expect(handler.dismiss).toHaveBeenCalled();
		});

		it("triggers onAnimationEnd on animation end capture", () => {
			const handler = createHandler();
			shadcnUiAlertDialog(handler).onAnimationEndCapture?.();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("shadcnUiAlertDialogContent", () => {
		it("calls onAnimationEnd when animation ends", () => {
			const handler = createHandler();
			const props = shadcnUiAlertDialogContent(handler);
			props.onAnimationEndCapture();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});

		it("respects disableClose for escape and pointer events", () => {
			const handler = createHandler();
			const event = { preventDefault: vi.fn() } as unknown as Event;

			const props = shadcnUiAlertDialogContent(handler, { disableClose: true });
			props.onEscapeKeyDown?.(event);
			props.onPointerDownOutside?.(event);

			expect(handler.dismiss).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalledTimes(2);
		});
	});

	describe("shadcnUiPopover", () => {
		it("calls dismiss and onAnimationEnd immediately on close", () => {
			const handler = createHandler();
			const props = shadcnUiPopover(handler);
			props.onOpenChange(false);
			expect(handler.dismiss).toHaveBeenCalled();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});
});

describe("Base UI Adapters", () => {
	describe("baseUiDialog", () => {
		it("maps dismissible from disableClose", () => {
			expect(baseUiDialog(createHandler()).dismissible).toBe(true);
			expect(
				baseUiDialog(createHandler(), { disableClose: true }).dismissible,
			).toBe(false);
		});

		it("portal maps keepMounted from modal", () => {
			const { baseUiDialogPortal } = __importAdapters();
			expect(
				baseUiDialogPortal(createHandler({ keepMounted: true })).keepMounted,
			).toBe(true);
			expect(
				baseUiDialogPortal(createHandler({ keepMounted: false })).keepMounted,
			).toBe(false);
		});

		it("popup calls onAnimationEnd on animation end", () => {
			const handler = createHandler();
			const props = baseUiDialogPopup(handler);
			props.onAnimationEnd();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	// Helper to resolve imports if needed, but since they are imported at top, just use them.
	const __importAdapters = () => ({
		baseUiDialogPortal,
		baseUiAlertDialogPortal,
		baseUiSheetPortal,
		baseUiPopoverPortal,
	});

	describe("baseUiAlertDialog", () => {
		it("maps isOpen state to open prop", () => {
			const handler = createHandler({ isOpen: true });
			expect(baseUiAlertDialog(handler).open).toBe(true);
		});

		it("portal maps keepMounted from modal", () => {
			const { baseUiAlertDialogPortal } = __importAdapters();
			expect(
				baseUiAlertDialogPortal(createHandler({ keepMounted: true }))
					.keepMounted,
			).toBe(true);
		});

		it("popup calls onAnimationEnd on animation end", () => {
			const handler = createHandler();
			const props = baseUiAlertDialogPopup(handler);
			props.onAnimationEnd();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("baseUiPopover", () => {
		it("dismisses on onOpenChange(false)", () => {
			const handler = createHandler();
			const props = baseUiPopover(handler);
			props.onOpenChange(false);
			expect(handler.dismiss).toHaveBeenCalled();
		});

		it("portal maps keepMounted from modal", () => {
			const { baseUiPopoverPortal } = __importAdapters();
			expect(
				baseUiPopoverPortal(createHandler({ keepMounted: true })).keepMounted,
			).toBe(true);
		});

		it("popup calls onAnimationEnd on animation end", () => {
			const handler = createHandler();
			const props = baseUiPopoverPopup(handler);
			props.onAnimationEnd();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});

	describe("baseUiSheet", () => {
		it("maps dismissible from disableClose", () => {
			expect(baseUiSheet(createHandler()).dismissible).toBe(true);
			expect(
				baseUiSheet(createHandler(), { disableClose: true }).dismissible,
			).toBe(false);
		});

		it("portal maps keepMounted from modal", () => {
			const { baseUiSheetPortal } = __importAdapters();
			expect(
				baseUiSheetPortal(createHandler({ keepMounted: true })).keepMounted,
			).toBe(true);
		});

		it("popup calls onAnimationEnd on animation end", () => {
			const handler = createHandler();
			const props = baseUiSheetPopup(handler);
			props.onAnimationEnd();
			expect(handler.onAnimationEnd).toHaveBeenCalled();
		});
	});
});
