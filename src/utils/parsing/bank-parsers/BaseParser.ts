import { groupBySortedBottom } from '@/utils/parsing/bank-parsers/helpers/groupBySortedBottom';
import {
  TextItemWithPositioning,
  TransactionItem,
  WordItem,
} from '@/utils/parsing/types';

import { format } from 'date-fns/format';
import { PDFPageProxy } from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';

import { BankParser } from './types';

export abstract class BaseBankParser implements BankParser {
  abstract readonly bankName: string;
  abstract readonly version: string;

  /**
   * Abstract method that each bank must implement to identify transaction items
   */
  abstract identifyTransactionItems(
    itemsRaw: TextItemWithPositioning[],
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

  protected groupBySortedBottom(
    items: TextItemWithPositioning[]
  ): Map<number, TextItemWithPositioning[]> {
    return groupBySortedBottom(items);
  }

  /**
   * Group by EOL property.
   *
   * Use this for pdfs which splits each character as 1 TextItem.
   *
   * @param rawItems
   * @protected
   */
  protected groupByDelimiters(rawItems: TextItemWithPositioning[]): WordItem[] {
    const allGroups: WordItem[] = [];

    // Groups per line.
    let groups: WordItem[] = [];
    // Keeps track of current open group.
    let currentGroup: TextItemWithPositioning[] = [];

    const closeGroup = () => {
      const groupString = currentGroup.map((item) => item.str).join('');
      const wordItem: WordItem = {
        ...currentGroup[0],
        str: groupString,
        items: currentGroup,
        left: currentGroup[0].left,
        right: currentGroup[currentGroup.length - 1].right,
        top: currentGroup[0].top,
        bottom: currentGroup[0].bottom,
        hasEOL: true,
      };

      groups.push(wordItem);
      currentGroup = [];
    };

    const rawItemsWithoutBlanks = rawItems.filter((item) => {
      return item.str !== '' && item.width !== 0;
    });

    const lines = groupBySortedBottom(rawItemsWithoutBlanks);

    for (const [bottom, items] of lines.entries()) {
      console.log(`[groupByDelimiters] processing line ${bottom}`);
      // console.log(`[groupByDelimiters] sorted left to right:`, items);

      // Process a line.
      for (const item of items) {
        if (item.str === ' ' || item.hasEOL) {
          if (currentGroup.length > 0) {
            closeGroup();
          }
        } else {
          currentGroup.push(item);
        }
      }

      if (currentGroup.length > 0) {
        closeGroup();
      }

      console.log(`[groupByDelimiters] groups on ${bottom}:`, groups);
      allGroups.push(...groups);
      groups = [];
    }

    return allGroups;
  }

  /**
   * Group TextItems by proximity.
   *
   * Use this for pdfs that store each word in a TextItem.
   *
   * @param rawItems
   * @protected
   */
  protected groupByProximity(rawItems: TextItemWithPositioning[]): WordItem[] {
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

    const lines = this.groupBySortedBottom(rawItemsWithoutBlanks);

    for (const [bottom, items] of lines.entries()) {
      console.log(`[groupByProximity] processing line ${bottom}`);
      // console.log('[groupByProximity] sorted left to right:', items);

      // Process a line.
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

    const description = [...groupBySortedBottom(descriptionWords).values()].map(
      (items) => items.map((textItem) => textItem.str).join(' ')
    );

    return {
      key: uuidv4(),
      day: format(date, 'd'),
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
