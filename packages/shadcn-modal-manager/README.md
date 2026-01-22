# shadcn-modal-manager

A lightweight, type-safe, and animation-aware modal management library for React.

[![Tests](https://github.com/achromaticlabs/shadcn-modal-manager/actions/workflows/test.yml/badge.svg)](https://github.com/achromaticlabs/shadcn-modal-manager/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🚀 Promise-based API** - `open()` returns promises for `afterOpened()` and `afterClosed()`.
- **🛡️ Type-safe** - Full TypeScript support with generics for modal data and results.
- **✨ Animation-aware** - Automatically waits for enter/exit animations/transitions before cleanup.
- **🔌 Pre-built Adapters** - Seamless integration with **Shadcn UI**, **Radix UI**, and **Base UI**.
- **📦 Lightweight** - Zero dependencies beyond React.
- **🧠 Flexible** - Manage modals via programmatic API or declarative JSX.

## Installation

```bash
npm install shadcn-modal-manager
```

## Quick Start

### 1. Wrap your app with the Provider

```tsx
import { ModalProvider } from "shadcn-modal-manager";

function Root() {
  return (
    <ModalProvider>
      <App />
    </ModalProvider>
  );
}
```

### 2. Define a modal

Use pre-built adapters to bridge your UI library with the modal manager logic.

```tsx
import { ModalManager, useModal, shadcnUiDialog, shadcnUiDialogContent } from "shadcn-modal-manager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MyModal = ModalManager.create(({ title }: { title: string }) => {
  const modal = useModal();

  return (
    <Dialog {...shadcnUiDialog(modal)}>
      <DialogContent {...shadcnUiDialogContent(modal)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>This is a managed modal!</p>
        <button onClick={() => modal.close("success")}>Close with Result</button>
      </DialogContent>
    </Dialog>
  );
});
```

### 3. Open the modal

```tsx
// 1. Programmatic Usage (e.g., in an event handler)
const openConfirmModal = async () => {
  const modalRef = ModalManager.open(MyModal, {
    data: { title: "Are you sure?" }
  });

  const result = await modalRef.afterClosed();

  if (result === "success") {
    // Handle success
  }
};

// 2. Declarative Usage (via JSX)
import { ModalDefinition } from "shadcn-modal-manager";

function MyPage() {
  return (
    <>
      {/* Registers the modal for later use by its ID */}
      <ModalDefinition id="optional-id" component={MyModal} />
      <button onClick={() => ModalManager.open("optional-id")}>Open by ID</button>
    </>
  );
}
```

## Common Patterns

### **1. Returning Results**
The `open()` function is generically typed to support results.

```tsx
const openConfirm = async () => {
  const modalRef = ModalManager.open<boolean>(MyModal);
  const result = await modalRef.afterClosed();

  if (result) {
    console.log("User confirmed!");
  }
};
```

### **2. Lifecycle Hooks**
Wait for the modal to be fully opened or perform actions before it closes.

```tsx
const ref = ModalManager.open(MyModal);

ref.afterOpened().then(() => {
  console.log("Modal is now fully visible and animations are done.");
});

const result = await ref.afterClosed();
```

### **3. Closing All Modals**
Useful for navigation changes or resetting application state.

```tsx
// Closes all modals and waits for their exit animations
await ModalManager.closeAll();
```

## Supported Libraries (Adapters)

We provide pre-built adapters to make integration seamless:

### **Shadcn UI**
```tsx
import { shadcnUiDialog, shadcnUiDialogContent, shadcnUiDrawer } from "shadcn-modal-manager";
```
Adapters: `shadcnUiDialog`, `shadcnUiDialogContent`, `shadcnUiAlertDialog`, `shadcnUiSheet`, `shadcnUiDrawer`, `shadcnUiPopover`.

### **Radix UI**
```tsx
import { radixUiDialog, radixUiDialogContent, radixUiPopover } from "shadcn-modal-manager";
```
Adapters: `radixUiDialog`, `radixUiDialogContent`, `radixUiAlertDialog`, `radixUiAlertDialogContent`, `radixUiPopover`, `radixUiSheet`.

### **Base UI**
```tsx
import { baseUiDialog, baseUiPopover } from "shadcn-modal-manager";
```
Adapters: `baseUiDialog`, `baseUiDialogPopup`, `baseUiDialogPortal`, `baseUiAlertDialog`, `baseUiAlertDialogPopup`, `baseUiPopover`, `baseUiPopoverPopup`, `baseUiPopoverPortal`, `baseUiSheet`.

## Documentation

For full documentation, including advanced usage, custom adapters, and API reference, visit [shadcn-modal-manager.achromatic.dev](https://shadcn-modal-manager.achromatic.dev).

## License

MIT

---

Maintained by [Achromatic](https://achromatic.dev)
