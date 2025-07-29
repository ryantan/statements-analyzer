import { TransactionItem } from '../identify-transaction-items';
import { WordItem } from '../consolidate-date';
import { BankParser } from './types';
import { parseDayMonth, threeCharMonthNames } from '@/utils/dates';
import { format } from 'date-fns/format';
import groupBy from 'lodash/groupBy';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseBankParser implements BankParser {
  abstract readonly bankName: string;
  abstract readonly version: string;

  /**
   * Abstract method that each bank must implement to identify transaction items
   */
  abstract identifyTransactionItems(itemsRaw: WordItem[]): TransactionItem[];

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
    dayItem: WordItem,
    monthItem: WordItem,
    amountItem: WordItem,
    descriptionWords: WordItem[],
    currentY: number,
    nextY: number
  ): TransactionItem {
    const amountFormatted = amountItem.str;
    const amount = this.parseAmount(amountFormatted);

    const date = parseDayMonth(dayItem.str, monthItem.str);
    // TODO: Somehow derive year reliably from the statement.
    const year = monthItem.str === 'DEC' ? 2024 : 2025;
    date.setFullYear(year);

    const groupedByY = groupBy(descriptionWords, 'top');
    const description = Object.values(groupedByY).map((items) =>
      items.map((textItem) => textItem.str).join(' ')
    );

    return {
      key: uuidv4(),
      day: dayItem.str,
      month: monthItem.str,
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