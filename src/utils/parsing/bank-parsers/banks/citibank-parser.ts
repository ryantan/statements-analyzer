import { threeCharMonthNames } from '@/utils/dates';

import { WordItem } from '../../consolidate-date';
import { TransactionItem } from '../../identify-transaction-items';
import { BaseBankParser } from '../base-parser';

type TextItemWithPrevNext = WordItem & {
  prev?: WordItem;
  next?: WordItem;
};

export class CitibankParser extends BaseBankParser {
  readonly bankName = 'Citibank';
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

    // Find all day items (x near 49) - Citibank specific coordinates
    const dayItems = items
      .filter((item) => this.isBetween(item.left, 46, 49))
      .filter((item) => item.str.length === 2 && parseInt(item.str) > 0)
      .filter((item) =>
        threeCharMonthNames.includes(item.next?.str.toUpperCase() ?? '')
      );

    console.log('Citibank dayItems:', dayItems);

    for (let i = 0; i < dayItems.length; i++) {
      const dayItem = dayItems[i];
      const nextDayItem = dayItems[i + 1];

      const currentY = dayItem.top;
      // a 2-liner is 28 and a 3-liner is 37.4, so i guess max transaction item height should be around 48
      const nextY = Math.min(nextDayItem?.top ?? Infinity, dayItem.top + 48);

      // Find words where y between current day and next day
      // Note: y values goes from 0 at bottom to up
      const candidateWords = items.filter(
        (item) => item.top >= currentY && item.bottom < nextY
      );

      // Find month item (x near 60, same y as day) - Citibank specific coordinates
      const monthItem = candidateWords.find((item) =>
        this.isBetween(item.left, 56, 60)
      );

      // Find amount item (x near 550, same y as day) - Citibank specific coordinates
      const amountItem = candidateWords.find((item) =>
        this.isBetween(item.right, 562.5, 566.2)
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
