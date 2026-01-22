# Contributing to shadcn-modal-manager

Thank you for your interest in contributing to shadcn-modal-manager! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

- Check the issues to see if the bug has already been reported.
- If not, create a new issue. Provide a clear description and a minimal reproduction if possible.

### Feature Requests

- Open an issue to discuss your proposal before starting implementation.

### Pull Requests

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and ensure tests pass: `npm run test`.
4. Ensure your code follows the project's linting and formatting rules: `npm run lint`.
5. Commit your changes: `git commit -m "feat: add your feature"`.
6. Push to your branch and open a Pull Request.

## Development Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the library in development mode: `npm run dev --workspace=packages/shadcn-modal-manager`.
4. Run the documentation site: `npm run dev --workspace=apps/docs`.

### Testing

We use Vitest for testing. All new features should include corresponding tests in the `packages/shadcn-modal-manager/tests` directory.

```bash
npm run test --workspace=packages/shadcn-modal-manager
```

### Linting

We use Biome for linting and formatting.

```bash
npm run lint --workspace=packages/shadcn-modal-manager
```

## Community

Join our community to discuss the project and get help.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
