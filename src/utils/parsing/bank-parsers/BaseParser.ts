import {
  TextItemWithPositioning,
  TransactionItem,
  WordItem,
} from '@/utils/parsing/types';

import { format } from 'date-fns/format';
import { sortBy } from 'lodash';
import groupBy from 'lodash/groupBy';
import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { v4 as uuidv4 } from 'uuid';

import { BankParser } from './types';

export abstract class BaseBankParser implements BankParser {
  abstract readonly bankName: string;
  abstract readonly version: string;

  /**
   * Abstract method that each bank must implement to identify transaction items
   */
  abstract identifyTransactionItems(
    itemsRaw: WordItem[],
    page: PDFPageProxy
  ): TransactionItem[];

  /**
   * Common utility method to check if two numbers are near each other
   */
  protected isNear(a: number, b: number, tolerance: number = 1): boolean {
    return Math.abs(a - b) <= tolerance;
  }

  /**
   * Common utility method to check if a number is between two values
   */
  protected isBetween(
    x: number,
    min: number,
    max: number,
    tolerance: number = 1
  ): boolean {
    return this.isNear(x, min, tolerance) || this.isNear(x, max, tolerance);
  }

  /**
   * Group TextItems by proximity.
   *
   * @param rawItems
   * @protected
   */
  protected groupByProximity(rawItems: TextItem[]): WordItem[] {
    const allGroups: WordItem[] = [];

    // Groups per line.
    let groups: WordItem[] = [];
    // Keeps track of current open group.
    let currentGroup: TextItemWithPositioning[] = [];
    // Keeps track of last item in the current group.
    let lastItemInGroup: TextItemWithPositioning | null = null;
    // Keeps track of right of last item in the current group.
    let lastItemRight = 0;

    const addToGroup = (item: TextItemWithPositioning) => {
      currentGroup.push(item);
      lastItemInGroup = item;
      lastItemRight = item.right;
    };

    const closeGroup = () => {
      if (!lastItemInGroup) {
        console.error('[groupByProximity.closeGroup] No lastItemInGroup!');
        return;
      }

      const groupItems = currentGroup
        // Remove trailing empty items.
        .filter((item, index) => {
          if (index === currentGroup.length - 1) {
            if (item.str === ' ' || item.str === '') {
              return false;
            }
          }
          return true;
        });

      if (groupItems.length === 0) {
        console.error('[groupByProximity.closeGroup] groupItems is empty!');
        return;
      }

      const groupString = groupItems
        .map((item, index) => {
          if (item.str === ' ') {
            // Recognize long spaces as tabs
            // TODO: Check if there are long spaces where str === '' (which we filtered out earlier).
            //  If there are, don't filter them out.
            if (item.width > 12) {
              return '\t';
            }
            return ' ';
          }
          return item.str;
        })
        .join('');

      const wordItem: WordItem = {
        ...currentGroup[0],
        str: groupString,
        items: groupItems,
        left: currentGroup[0].left,
        right: groupItems[groupItems.length - 1].right,
        top: currentGroup[0].top,
        bottom: currentGroup[0].bottom,
        hasEOL: true,
      };

      groups.push(wordItem);
      currentGroup = [];
      lastItemInGroup = null;
    };

    const rawItemsWithoutBlanks = rawItems.filter((item) => {
      return item.str !== '' && item.width !== 0;
    });
    // .filter((item) => {
    //   return !(item.str === ' ' && item.width > 12);
    // });
    const itemsWithPositioning =
      rawItemsWithoutBlanks.map<TextItemWithPositioning>((item) => ({
        ...item,
        left: item.transform[4],
        right: item.transform[4] + item.width,
        top: item.transform[5] - item.height,
        bottom: item.transform[5],
      }));

    // We use bottom, as spaces have 0 height so they would have different top as characters, even when on the same line.
    const sortedByBottom = sortBy(itemsWithPositioning, 'bottom');
    const groupedByLines = groupBy(sortedByBottom, 'bottom');
    console.log('[groupByProximity] groupedByLines:', groupedByLines);

    // Process a line.
    for (const [bottom, itemsInLine] of Object.entries(groupedByLines)) {
      const items = sortBy(itemsInLine, 'left');
      console.log('[groupByProximity] sorted left to right:', items);

      for (const item of items) {
        if (lastItemInGroup) {
          const isNearHorizontal = this.isNear(item.left, lastItemRight, 0.5);
          if (!isNearHorizontal) {
            closeGroup();
          }
        }
        addToGroup(item);
      }

      if (currentGroup.length > 0) {
        closeGroup();
      }

      console.log(`[groupByProximity] groups on ${bottom}:`, groups);
      allGroups.push(...groups);
      groups = [];
    }

    return allGroups;
  }

  /**
   * Common method to parse amount from string
   */
  protected parseAmount(amountFormatted: string): number {
    let amount = 0;
    const withoutCommaBrackets = amountFormatted.replaceAll(/([(),])/g, '');
    if (amountFormatted.startsWith('(')) {
      amount = parseFloat(withoutCommaBrackets);
      amount *= -1;
    } else {
      amount = parseFloat(withoutCommaBrackets);
    }
    return amount;
  }

  /**
   * Common method to create a transaction item
   */
  protected createTransactionItem(
    date: Date,
    amountItem: WordItem,
    descriptionWords: WordItem[],
    currentY: number,
    nextY: number
  ): TransactionItem {
    const amountFormatted = amountItem.str;
    const amount = this.parseAmount(amountFormatted);

    // TODO: Somehow derive year reliably from the statement.
    const year = date.getMonth() === 11 ? 2024 : 2025;
    date.setFullYear(year);

    const groupedByY = groupBy(descriptionWords, 'bottom');
    const description = Object.values(groupedByY).map((items) =>
      items.map((textItem) => textItem.str).join(' ')
    );

    return {
      key: uuidv4(),
      day: date.getDay().toString(),
      month: format(date, 'MMM').toUpperCase(),
      year,
      date,
      dateFormatted: format(date, 'd MMM'),
      descriptionWords,
      description,
      amountFormatted: amountItem.str,
      amount,
      top: currentY,
      bottom: nextY,
    };
  }
}
