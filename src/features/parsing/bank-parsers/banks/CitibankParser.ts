import {
  TextItemWithPositioning,
  TextItemWithPrevNext,
  TransactionItem,
  WordItem,
} from '@/features/parsing/types';
import { parseDayMonth, threeCharMonthNames } from '@/utils/dates';

import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

import { BaseBankParser } from '../BaseParser';

export class CitibankParser extends BaseBankParser {
  readonly bankName = 'Citibank';
  readonly version = '1.0.0';

  identifyTransactionItems(
    textItemsRaw: TextItemWithPositioning[],
    page: PDFPageProxy
  ): TransactionItem[] {
    const itemsRaw = this.groupByDelimiters(textItemsRaw);
    console.log('[CitibankParser] itemsRaw:', itemsRaw);

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
      console.log('candidateWords:', candidateWords);

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
