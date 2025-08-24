# Contributing to NEAR JSON-RPC TypeScript SDK

Thank you for your interest in contributing to the NEAR JSON-RPC TypeScript SDK! This project provides type-safe JSON-RPC client libraries for NEAR Protocol, automatically generated from NEAR's OpenAPI specification.

## Table of Contents

- [Project Overview](#-project-overview)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Project Architecture](#-project-architecture)
- [Contributing Guidelines](#-contributing-guidelines)
- [Testing](#-testing)
- [Release Process](#-release-process)
- [Getting Help](#-getting-help)

## Project Overview

This monorepo contains three main packages:

- **[@saka-labs/near-jsonrpc-client](./packages/jsonrpc-client)** - Type-safe JSON-RPC client
- **[@saka-labs/near-jsonrpc-types](./packages/jsonrpc-types)** - TypeScript types and Zod schemas (auto-generated)
- **[@saka-labs/near-jsonrpc-generator](./packages/jsonrpc-generator)** - Code generator that creates types from OpenAPI specs

### Key Features

- **Type Safety**: Full TypeScript support with compile-time validation
- **Runtime Validation**: Zod schemas for request/response validation
- **Auto-Generated**: Types stay in sync with NEAR's API via automated updates
- **Monorepo Structure**: Uses Yarn workspaces and Turborepo for efficient builds

## Getting Started

### Prerequisites

- **Node.js**: Version 22
- **Yarn**: Version 1.22.22 (managed via packageManager field)
- **Git**: For version control

### Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/joundy/near-jsonrpc.git
   cd near-jsonrpc
   ```

2. **Install Dependencies**

   ```bash
   yarn install
   ```

3. **Build All Packages**

   ```bash
   yarn build
   ```

4. **Verify Setup**

   ```bash
   yarn check-types
   ```

## Development Workflow

### Available Commands

```bash
# Build all packages
yarn build

# Development mode with file watching
yarn dev

# Type checking across all packages
yarn check-types

# Clean build artifacts
yarn clean

# Generate types from OpenAPI spec
yarn generate
```

### Package-Specific Development

To work on a specific package:

```bash
# Navigate to package directory
cd packages/jsonrpc-client

# Run package-specific commands
yarn build
yarn dev
yarn check-types
```

### Making Changes

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**

   ```bash
   yarn build
   yarn check-types
   ```

4. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide clear description of changes
   - Link any relevant issues
   - Wait for review and CI checks

## Project Architecture

### Monorepo Structure

```
packages/
├── jsonrpc-client/     # Client library
├── jsonrpc-types/      # Generated types and schemas
└── jsonrpc-generator/  # Code generation tool
```

### Code Generation Flow

The project uses a sophisticated code generation system:

```
OpenAPI Spec → TypeScript Types → Zod Schemas → Package Output
```

1. **Input**: NEAR's OpenAPI specification
2. **Processing**: AST parsing and transformation
3. **Output**: Type-safe TypeScript + Zod validation schemas

For detailed information, see [GENERATOR.md](./GENERATOR.md).

### Automated Updates

- **Daily**: GitHub Actions fetches latest OpenAPI spec
- **Auto-PR**: Creates pull requests when API changes detected
- **Review**: Maintainers review and merge updates

## Contributing Guidelines

### Code Style

- **TypeScript**: Follow existing patterns and conventions
- **Imports**: Use `@saka-labs/near-jsonrpc-types` instead of relative paths in the monorepo
- **Naming**: Use camelCase for TypeScript, snake_case for JSON-RPC properties
- **Comments**: Add JSDoc for public APIs

### Commit Convention

We use conventional commits for automated changelog generation:

```bash
feat: add new functionality
fix: bug fixes
docs: documentation changes
chore: maintenance tasks
refactor: code refactoring without functional changes
test: adding or updating tests
```

### What to Contribute

#### Areas Where Contributions Are Welcome

- **Bug Fixes**: Issues with existing functionality
- **Documentation**: Improve guides, examples, and API docs
- **Examples**: Real-world usage examples
- **Client Features**: New features for the JSON-RPC client
- **Performance**: Optimizations and improvements
- **Developer Experience**: Tooling and workflow improvements

#### Areas Requiring Coordination

- **Type Generation**: Changes to the generator require careful review
- **API Changes**: Must align with NEAR Protocol's JSON-RPC API
- **Breaking Changes**: Need discussion and migration planning

### Pull Request Process

1. **Description**: Clearly explain what your PR does and why
2. **Testing**: Ensure all tests pass and add new tests if needed
3. **Documentation**: Update relevant documentation
4. **Changelog**: Follow conventional commits for automatic changelog
5. **Review**: Address feedback promptly and thoughtfully

### Code Review Guidelines

When reviewing PRs, consider:

- **Functionality**: Does it work as intended?
- **Type Safety**: Are types correct and complete?
- **Performance**: Any performance implications?
- **Breaking Changes**: Impact on existing users?
- **Documentation**: Is documentation up to date?

## Release Process

This project uses automated releases via [Release Please](https://github.com/googleapis/release-please):

### How Releases Work

1. **Conventional Commits**: Commits trigger release PRs
2. **Release PR**: Auto-generated with changelog and version bump
3. **Merge**: Merging the release PR publishes to NPM
4. **Automation**: Fully automated via GitHub Actions

### Release Types

- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `feat!:` or `BREAKING CHANGE:` → Major version bump

### Publishing

Only maintainers can publish packages. The process is fully automated:

1. Release Please creates a PR with version bumps
2. Maintainer reviews and merges the PR
3. GitHub Actions automatically publishes to NPM

## Getting Help

### Resources

- **[Examples](./examples)** - Usage examples
- **[Generator Docs](./GENERATOR.md)** - Detailed generator documentation
- **[NEAR Docs](https://docs.near.org/api/rpc/introduction)** - Official JSON-RPC API reference

### Getting Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Discord**: Join the NEAR Developer Discord for real-time help

### Reporting Issues

When reporting issues, please include:

1. **Environment**: Node.js version, OS, package versions
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Code Sample**: Minimal reproducible example

## Recognition

Contributors are recognized in:

- **Changelog**: Automatic attribution via conventional commits
- **GitHub**: Contributor graphs and commit history
- **NPM**: Package.json contributors field (for significant contributions)

Thank you for contributing to make NEAR Protocol more accessible to TypeScript developers!
