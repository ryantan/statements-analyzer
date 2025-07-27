# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **statements-analyzer** - a Next.js application that parses uploaded PDF bank statements to extract and display transaction data. The core functionality involves sophisticated spatial text analysis using PDF.js to identify transaction components by their coordinate positions within PDF documents.

## Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Production build
pnpm build

# Code formatting (run before commits)
pnpm format

# Lint checking
pnpm lint

# Format validation
pnpm format:check
```

## Architecture Overview

### PDF Processing Pipeline
The application follows a multi-stage PDF processing approach:

1. **Upload** (`src/features/upload/upload.tsx`) - File validation and PDF.js initialization
2. **Text Extraction** - PDF.js extracts all text items with precise coordinates from all pages
3. **Filtering** (`src/utils/parsing/filter-rotated.ts`) - Removes rotated text elements
4. **Grouping** (`src/utils/parsing/consolidate-date.ts`) - Converts TextItems to WordItems by spatial delimiters
5. **Transaction Identification** (`src/utils/parsing/identify-transaction-items.ts`) - Uses coordinate-based pattern matching
6. **Display** - Renders in Ant Design table with pagination and formatting

### Key Data Types

- **TextItem** - Raw PDF.js text element with transform matrix
- **WordItem** - Grouped text with calculated coordinates (left, right, top, bottom)
- **TransactionItem** - Final transaction with date, description, and amount

### Spatial Analysis Logic

The transaction parsing relies on precise coordinate positioning:
- **Day/Month Detection** - Identifies date components by x-coordinate ranges
- **Amount Recognition** - Right-aligned amounts with parentheses for negatives  
- **Description Assembly** - Groups remaining text by y-coordinate proximity
- **Multi-line Support** - Handles transactions spanning multiple text lines

### Feature-Based Structure

```
src/
├── app/           # Next.js App Router (minimal routing)
├── features/      # Feature modules (upload functionality)
└── utils/         # Core business logic (PDF parsing algorithms)
```

## Technology Stack

- **Framework**: Next.js 15.4.4 with App Router and Turbopack
- **UI**: Ant Design 5.26.6 with Tailwind CSS 4
- **PDF Processing**: pdfjs-dist 5.3.93 with canvas support
- **Type System**: TypeScript strict mode with path aliases (`@/*`)
- **Package Manager**: pnpm

## Code Style & Configuration

- **Prettier**: Single quotes, semicolons, 80-char width, import sorting
- **ESLint**: Next.js + TypeScript rules
- **Import Order**: React/Next.js prioritized, then third-party, then local imports

## Development Notes

- All PDF processing happens client-side (no server API routes)
- Coordinate calculations assume specific bank statement layouts
- Date parsing assumes current year for day/month combinations
- No test suite or CI/CD pipeline currently configured
- Dynamic imports used for client-side-only PDF processing components