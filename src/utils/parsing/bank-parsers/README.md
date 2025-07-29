# Bank Parser System

This directory contains the implementation of a **Strategy Pattern** combined with a **Factory Pattern** for handling different bank PDF formats.

## Architecture

### Design Patterns Used

1. **Strategy Pattern**: Each bank has its own transaction identification strategy
2. **Factory Pattern**: Easy to add new banks without modifying existing code
3. **Template Method Pattern**: Common functionality in base class, specific logic in subclasses

### Key Components

- `types.ts` - Defines interfaces and types
- `base-parser.ts` - Abstract base class with common functionality
- `citibank-parser.ts` - Citibank-specific implementation
- `ocbc-parser.ts` - OCBC-specific implementation
- `unknown-parser.ts` - Fallback parser for unknown banks
- `bank-parser-factory.ts` - Factory for creating appropriate parsers
- `template-new-bank-parser.ts` - Template for adding new banks

## How It Works

1. **Bank Selection**: User selects a bank from the dropdown in the upload form
2. **Parser Creation**: Factory creates the appropriate parser based on bank name
3. **Transaction Extraction**: Parser extracts transactions using bank-specific logic
4. **Fallback**: Unknown banks use a generic parser

## Adding a New Bank

### Step 1: Create Parser Class

Copy `template-new-bank-parser.ts` and rename it to your bank (e.g., `dbs-parser.ts`):

```typescript
export class DBSParser extends BaseBankParser {
  readonly bankName = 'DBS';
  readonly version = '1.0.0';

  identifyTransactionItems(itemsRaw: WordItem[]): TransactionItem[] {
    // Implement DBS-specific logic here
  }
}
```

### Step 2: Analyze PDF Format

You need to analyze your bank's PDF to find the correct coordinates:

1. **Day Items**: Find x-coordinates where day numbers appear
2. **Month Items**: Find x-coordinates where month names appear  
3. **Amount Items**: Find x-coordinates where amounts appear

Use browser dev tools or PDF analysis tools to determine these coordinates.

### Step 3: Update Coordinates

Update the filter conditions in your parser:

```typescript
// Day items
const dayItems = items
  .filter((item) => this.isBetween(item.left, 40, 50)) // Adjust for your bank

// Month items  
const monthItem = candidateWords.find((item) =>
  this.isBetween(item.left, 50, 65) // Adjust for your bank
);

// Amount items
const amountItem = candidateWords.find((item) =>
  this.isBetween(item.right, 550, 580) // Adjust for your bank
);
```

### Step 4: Register Parser

Add your parser to the factory in `bank-parser-factory.ts`:

```typescript
// In constructor
this.parsers.set('DBS', new DBSParser());
```

### Step 5: Update Types

Update the `BankName` type in `types.ts`:

```typescript
export type BankName = 'Citibank' | 'OCBC' | 'DBS' | 'Unknown';
```

## Benefits

1. **Extensibility**: Easy to add new banks without modifying existing code
2. **Maintainability**: Each bank's logic is isolated
3. **Testability**: Each parser can be tested independently
4. **Fallback**: Unknown banks still work with generic parser
5. **Versioning**: Each parser has a version for tracking changes

## Usage Example

```typescript
import { bankParserFactory } from '@/utils/parsing/bank-parsers';

// Get parser for specific bank
const parser = bankParserFactory.createParser('Citibank');

// Extract transactions
const transactions = parser.identifyTransactionItems(wordItems);
```

## Debugging

Each parser logs its activity to help with debugging:

```typescript
console.log('Citibank dayItems:', dayItems);
console.log(`Using parser for bank: ${parser.bankName} (version: ${parser.version})`);
```

## Future Enhancements

1. **Auto-detection**: Automatically detect bank from PDF content
2. **Parser Versioning**: Handle format changes within the same bank
3. **Validation**: Add validation for extracted transactions
4. **Performance**: Optimize parsing for large PDFs
5. **Error Handling**: Better error handling for malformed PDFs 