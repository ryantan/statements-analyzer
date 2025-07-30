import { parseDayMonth, threeCharMonthNames } from '@/utils/dates';
import {
  TextItemWithPrevNext,
  TransactionItem,
  WordItem,
} from '@/utils/parsing/types';

import { BaseBankParser } from '../BaseParser';

export class NewBankParser extends BaseBankParser {
  readonly bankName = 'NewBank'; // Change this to your bank name
  readonly version = '1.0.0';

  identifyTransactionItems(itemsRaw: WordItem[]): TransactionItem[] {
    const transactions: TransactionItem[] = [];

    const items: TextItemWithPrevNext[] = itemsRaw.map((item, index) => {
      const itemWithPrevNext: TextItemWithPrevNext = {
        ...item,
        prev: itemsRaw[index - 1],
        next: itemsRaw[index + 1],
      };
      return itemWithPrevNext;
    });

    // STEP 1: Find day items - adjust coordinates based on your bank's PDF format
    // You'll need to analyze the PDF to find the correct x-coordinates for day numbers
    const dayItems = items
      .filter((item) => this.isBetween(item.left, 40, 50)) // Adjust these coordinates
      .filter((item) => item.str.length === 2 && parseInt(item.str) > 0)
      .filter((item) =>
        threeCharMonthNames.includes(item.next?.str.toUpperCase() ?? '')
      );

    console.log('NewBank dayItems:', dayItems);

    for (let i = 0; i < dayItems.length; i++) {
      const dayItem = dayItems[i];
      const nextDayItem = dayItems[i + 1];

      const currentY = dayItem.top;
      // Adjust height calculation for your bank's format
      const nextY = Math.min(nextDayItem?.top ?? Infinity, dayItem.top + 50);

      // Find words where y between current day and next day
      const candidateWords = items.filter(
        (item) => item.top >= currentY && item.bottom < nextY
      );

      // STEP 2: Find month item - adjust coordinates based on your bank's format
      const monthItem = candidateWords.find(
        (item) => this.isBetween(item.left, 50, 65) // Adjust these coordinates
      );

      // STEP 3: Find amount item - adjust coordinates based on your bank's format
      const amountItem = candidateWords.find(
        (item) => this.isBetween(item.right, 550, 580) // Adjust these coordinates
      );

      // Find description words left over
      const descriptionWords = candidateWords.filter(
        (item) => item !== dayItem && item !== monthItem && item !== amountItem
      );

      if (monthItem && amountItem) {
        const date = parseDayMonth(dayItem.str, monthItem.str);
        const transaction = this.createTransactionItem(
          date,
          amountItem,
          descriptionWords,
          currentY,
          nextY
        );
        transactions.push(transaction);
      } else {
        console.log(
          `${monthItem ? '' : 'monthItem'}${amountItem ? '' : 'amountItem'} not found:`,
          dayItem
        );
      }
    }

    return transactions;
  }
}

/*
HOW TO ADD A NEW BANK PARSER:

1. Copy this template and rename it to your bank (e.g., 'dbs-parser.ts')
2. Update the bankName property to your bank's name
3. Analyze your bank's PDF format to find the correct coordinates:
   - Day items: Look for the x-coordinates where day numbers appear
   - Month items: Look for the x-coordinates where month names appear
   - Amount items: Look for the x-coordinates where amounts appear
4. Update the coordinates in the filter conditions
5. Add your new parser to the factory in 'bank-parser-factory.ts'
6. Update the BankName type in 'types.ts' to include your new bank

Example for adding to factory:
```typescript
// In bank-parser-factory.ts constructor:
this.parsers.set('DBS', new DBSParser());
```

Example for updating types:
```typescript
// In types.ts:
export type BankName = 'Citibank' | 'OCBC' | 'DBS' | 'Unknown';
```
*/
