import { TextItemWithPrevNext, TransactionItem } from '@/utils/parsing/types';

import { parse } from 'date-fns';
import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

import { BaseBankParser } from '../BaseParser';

export class OCBCParser extends BaseBankParser {
  readonly bankName = 'OCBC';
  readonly version = '1.0.0';

  identifyTransactionItems(
    textItemsRaw: TextItem[],
    page: PDFPageProxy
  ): TransactionItem[] {
    const itemsRaw = this.groupByProximity(textItemsRaw);
    // console.log('itemsRaw:', itemsRaw);

    const transactions: TransactionItem[] = [];

    const items: TextItemWithPrevNext[] = itemsRaw.map((item, index) => {
      const itemWithPrevNext: TextItemWithPrevNext = {
        ...item,
        prev: itemsRaw[index - 1],
        next: itemsRaw[index + 1],
      };
      return itemWithPrevNext;
    });
    console.log('items:', items);

    // Find all day items - OCBC specific coordinates
    const dayItems = items
      .filter((item) => this.isBetween(item.left, 57, 59)) // Adjust coordinates for OCBC
      .filter((item) => item.str.length === 5 && item.str.match(/^\d\d|\d\d$/));
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
      console.log(
        `OCBC candidateWords between ${currentY} and ${nextY}:`,
        candidateWords
      );

      // Find amount item - OCBC specific coordinates (adjust these)
      const amountItem = candidateWords.find(
        (item) => this.isBetween(item.right, 544.73176068, 547.494946) // Adjust coordinates for OCBC
      );
      console.log('OCBC amountItem:', amountItem);

      // Find description words left over.
      const descriptionWords = candidateWords.filter(
        (item) => item !== dayItem && item !== amountItem
      );

      if (amountItem) {
        const date = parse(dayItem.str, 'dd/MM', new Date());

        const transaction = this.createTransactionItem(
          date,
          amountItem,
          descriptionWords,
          currentY,
          nextY
        );
        transactions.push(transaction);
      } else {
        console.log(`${amountItem ? '' : 'amountItem'} not found:`, dayItem);
      }
    }

    return transactions;
  }
}
