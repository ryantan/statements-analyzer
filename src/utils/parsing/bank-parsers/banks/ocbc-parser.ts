import { threeCharMonthNames } from '@/utils/dates';

import { WordItem } from '../../consolidate-date';
import { TransactionItem } from '../../identify-transaction-items';
import { BaseBankParser } from '../base-parser';

type TextItemWithPrevNext = WordItem & {
  prev?: WordItem;
  next?: WordItem;
};

export class OCBCParser extends BaseBankParser {
  readonly bankName = 'OCBC';
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

    // Find all day items - OCBC specific coordinates (adjust these based on actual OCBC format)
    const dayItems = items
      .filter((item) => this.isBetween(item.left, 40, 50)) // Adjust coordinates for OCBC
      .filter((item) => item.str.length === 2 && parseInt(item.str) > 0)
      .filter((item) =>
        threeCharMonthNames.includes(item.next?.str.toUpperCase() ?? '')
      );

    console.log('OCBC dayItems:', dayItems);

    for (let i = 0; i < dayItems.length; i++) {
      const dayItem = dayItems[i];
      const nextDayItem = dayItems[i + 1];

      const currentY = dayItem.top;
      // Adjust height calculation for OCBC format
      const nextY = Math.min(nextDayItem?.top ?? Infinity, dayItem.top + 50);

      // Find words where y between current day and next day
      const candidateWords = items.filter(
        (item) => item.top >= currentY && item.bottom < nextY
      );

      // Find month item - OCBC specific coordinates (adjust these)
      const monthItem = candidateWords.find(
        (item) => this.isBetween(item.left, 50, 65) // Adjust coordinates for OCBC
      );

      // Find amount item - OCBC specific coordinates (adjust these)
      const amountItem = candidateWords.find(
        (item) => this.isBetween(item.right, 550, 580) // Adjust coordinates for OCBC
      );

      // Find description words left over.
      const descriptionWords = candidateWords.filter(
        (item) => item !== dayItem && item !== monthItem && item !== amountItem
      );

      if (monthItem && amountItem) {
        const transaction = this.createTransactionItem(
          dayItem,
          monthItem,
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
