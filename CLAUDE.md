# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 expense splitter application (WeTravel prototype) that allows groups to track and settle shared expenses. The app is built with TypeScript, React 19, and Tailwind CSS v4.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js App Router with client-side state persistence via URL parameters

### Key Design Patterns

1. **State Persistence**: The app stores the entire state (people and expenses) in the URL as a base64-encoded JSON string. This enables sharing the current state via URL without any backend.

2. **Client-Side Only**: The main page (`app/page.tsx`) uses the `'use client'` directive, making it a fully client-side component. There's no server-side data fetching or API routes.

3. **Real-time Settlement Calculation**: The `calculateSettlements()` function implements an algorithm to minimize the number of transactions needed to settle all debts.

### Core Data Structures

```typescript
interface Person {
  id: string
  name: string
}

interface Expense {
  id: string
  name: string
  amount: number
  paidBy: string      // Person ID
  splitAmong: string[] // Array of Person IDs
}

interface Settlement {
  from: string  // Person ID who owes
  to: string    // Person ID who is owed
  amount: number
}
```

### Key Implementation Details

- **URL State Sync**: State changes trigger URL updates via `router.replace()`, and URL parameters are parsed on mount
- **Settlement Algorithm**: Uses a greedy algorithm to match debtors with creditors, minimizing transaction count
- **Korean UI**: The interface is in Korean (정산 계산기 = Settlement Calculator)
- **Responsive Design**: Uses Tailwind's gradient backgrounds and glass-morphism effects
- **Path Aliases**: TypeScript configured with `@/*` pointing to the root directory

## File Structure

```
/
├── app/
│   ├── globals.css    # Global styles and Tailwind directives
│   ├── layout.tsx     # Root layout with metadata
│   └── page.tsx       # Main expense splitter component
├── components/        # Empty, ready for component extraction
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── tailwind.config.js # Tailwind CSS configuration
└── next.config.js     # Next.js configuration
```

## Development Guidelines

1. **Component Extraction**: The main `page.tsx` is large (375 lines). Consider extracting components for:
   - Person management section
   - Expense table
   - Settlement results
   - Share URL section

2. **Type Safety**: Maintain strict TypeScript types for all data structures and function parameters

3. **State Management**: Keep state updates immutable and handle edge cases (e.g., removing a person who has expenses)

4. **Styling**: Follow the existing gradient and glass-morphism design patterns using Tailwind utilities