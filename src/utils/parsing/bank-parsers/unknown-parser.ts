import { TransactionItem } from '../identify-transaction-items';
import { WordItem } from '../consolidate-date';
import { BaseBankParser } from './base-parser';
import { threeCharMonthNames } from '@/utils/dates';

type TextItemWithPrevNext = WordItem & {
  prev?: WordItem;
  next?: WordItem;
};

export class UnknownBankParser extends BaseBankParser {
  readonly bankName = 'Unknown';
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

    // Use original logic as fallback for unknown banks
    const dayItems = items
      .filter((item) => this.isBetween(item.left, 46, 49))
      .filter((item) => item.str.length === 2 && parseInt(item.str) > 0)
      .filter((item) =>
        threeCharMonthNames.includes(item.next?.str.toUpperCase() ?? '')
      );
    
    console.log('Unknown bank dayItems:', dayItems);
    
    for (let i = 0; i < dayItems.length; i++) {
      const dayItem = dayItems[i];
      const nextDayItem = dayItems[i + 1];

      const currentY = dayItem.top;
      const nextY = Math.min(nextDayItem?.top ?? Infinity, dayItem.top + 48);

      const candidateWords = items.filter(
        (item) => item.top >= currentY && item.bottom < nextY
      );

      const monthItem = candidateWords.find((item) =>
        this.isBetween(item.left, 56, 60)
      );

      const amountItem = candidateWords.find((item) =>
        this.isBetween(item.right, 562.5, 566.2)
      );

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