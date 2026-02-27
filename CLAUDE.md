# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a uni-app Vue 3 WeChat Mini Program project - a tool aggregation platform (全能集) built with TDD practices. The project currently includes a scorekeeper (计分器) feature.

## Development Commands

```bash
# Development
npm run dev:mp-weixin    # Develop for WeChat Mini Program
npm run dev:h5           # Develop for H5 web

# Build
npm run build:mp-weixin  # Build for WeChat Mini Program
npm run build:h5         # Build for H5

# Testing (TDD workflow)
npm run test             # Run all tests
npm run test:unit        # Run unit tests (*.unit.test.ts)
npm run test:integration # Run integration tests (*.int.test.ts)
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
```

## Architecture

The codebase follows a layered architecture with strict dependency direction:

```
features → domain
features → services
services → adapters (wraps uni/wx APIs)
```

**Key rule**: `domain` layer must not depend on `features`, `services`, or platform APIs.

### Directory Structure

- `src/apps/` - Application shell (entry point, page registration, global error handling)
- `src/features/` - Feature modules (scorekeeper, etc.) - orchestrates domain + services
- `src/domain/` - Pure business logic and rules (no platform dependencies)
- `src/services/` - Storage, sync, and external dependencies
- `src/ui/` - Base UI components
- `src/pages/` - Page components (registered in pages.json)

### Key Patterns

1. **Domain layer** (`src/domain/`) contains pure functions with no platform API calls. All business rules are testable in isolation.

2. **Services layer** (`src/services/`) wraps platform APIs (uni/wx) and handles persistence. The scorekeeper-storage.ts is a good example.

3. **Features layer** (`src/features/`) manages state using reactive stores that combine domain logic with services. See `src/features/scorekeeper/store.ts`.

4. **Test file naming convention**:
   - `*.unit.test.ts` - Unit tests for domain/pure functions
   - `*.int.test.ts` - Integration tests for services/stores
   - Tests are located alongside the code they test

## Coding Standards

- TypeScript strict mode is enabled
- Use explicit types/interfaces; avoid `any` (ESLint will error)
- Use `type` imports for types: `import type { Foo } from './types'`
- Components: PascalCase (e.g., `ScoreboardPanel.vue`)
- Composables: `useXxx` naming convention
- Directories: kebab-case
- **All code comments must be written in Chinese (中文)**
- Chinese comments for business logic explaining "why" and business context
- Domain layer must not import platform types (wx/uni) - use services as adapter

## Test-Driven Development Workflow

1. Write requirements document in `docs/requirements/`
2. Write tests first (they will fail)
3. Implement minimum code to pass tests
4. Refactor while keeping tests green

**Testing constraints**:
- Unit/integration tests must not depend on real cloud services
- Mock platform APIs centrally in test setup
- E2E tests can use local WeChat developer tools

## Platform API Access

Never call `uni` or `wx` APIs directly in domain layer. Use services layer as an adapter. For example, storage access goes through `src/services/storage/scorekeeper-storage.ts` which wraps `uni.getStorageSync`.