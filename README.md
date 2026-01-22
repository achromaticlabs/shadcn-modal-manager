# shadcn-modal-manager

A lightweight, type-safe, and animation-aware React modal manager. It features a promise-based API and pre-built adapters for popular UI libraries like Shadcn, Radix, and Base UI.

## Getting Started

### Installation

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

### 2. Define and open a modal

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
        <button onClick={() => modal.close("success")}>Close</button>
      </DialogContent>
    </Dialog>
  );
});

// Open programmatically
const modalRef = ModalManager.open(MyModal, { data: { title: "Hello!" } });
const result = await modalRef.afterClosed();
```


## Development

### Prerequisites

- Node.js (v20 or higher)
- npm

### Common Commands

- `npm run build`: Build the core library.
- `npm run test`: Run the full test suite.
- `npm run lint`: Run linting and formatting checks.
- `npm run typecheck`: Run TypeScript type checks across the project.

## License

MIT

---

Maintained by [Achromatic](https://achromatic.dev)
