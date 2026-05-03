# Contributing to VoteWise

Thank you for your interest in contributing to VoteWise! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure your API keys.
4. Start the dev server: `npm run dev`

## Development Workflow

### Quality Gates

Before submitting a pull request, ensure all checks pass:

```bash
npm run validate   # type-check + lint:strict + test
npm run build      # production build
```

### Code Style

- **TypeScript**: Strict mode enabled — no `any` types without justification.
- **ESLint**: Zero warnings policy (`--max-warnings 0`).
- **Prettier**: Formatting is enforced via `.prettierrc`.
- **JSDoc**: All public functions must have `@param` and `@returns` annotations.
- **Modules**: Every `src/lib/*.ts` file must have a `@module` JSDoc header.

### Testing

- All new utility functions must include tests.
- Tests live in `src/__tests__/` mirroring the source structure.
- Run `npm test -- --coverage` to check coverage impact.

### Security

- All API routes must use `successResponse` / `errorResponse` from `api-utils.ts`.
- All user inputs must be validated using functions from `validators.ts`.
- New API routes must include a rate limiter from `rate-limiter.ts`.
- Never use `dangerouslySetInnerHTML` — use safe React rendering instead.

### Accessibility

- All interactive elements must have proper ARIA attributes.
- Decorative icons must have `aria-hidden="true"`.
- Dynamic content regions must use `aria-live`.
- Keyboard navigation must be supported for all interactive components.

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add glossary search filtering`
- `fix: correct quiz scoring for streak bonus`
- `docs: update README test count`
- `test: add validators edge cases`

## Non-Partisan Policy

VoteWise is strictly non-partisan. All contributions must:
- Avoid favoring any political party, candidate, or ideology.
- Cite official sources (ECI, Constitution of India).
- Focus on education and civic engagement.
