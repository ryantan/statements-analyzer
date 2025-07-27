import { Transaction } from '@/features/transactions/types';
import { parseDayMonth, threeCharMonthNames } from '@/utils/dates';
import { WordItem } from '@/utils/parsing/consolidate-date';

import { format } from 'date-fns/format';
import groupBy from 'lodash/groupBy';
import { v4 as uuidv4 } from 'uuid';

export type TransactionItem = Transaction & {
  descriptionWords: WordItem[];
  top: number;
  bottom: number;
};

type TextItemWithPrevNext = WordItem & {
  prev?: WordItem;
  next?: WordItem;
};

const isNear = (a: number, b: number, tolerance: number = 1) =>
  Math.abs(a - b) <= tolerance;

const isBetween = (
  x: number,
  min: number,
  max: number,
  tolerance: number = 1
) => isNear(x, min, tolerance) || isNear(x, max, tolerance);

export const identifyTransactionItems = (
  itemsRaw: WordItem[]
): TransactionItem[] => {
  const transactions: TransactionItem[] = [];

  const items: TextItemWithPrevNext[] = itemsRaw.map((item, index) => {
    const itemWithPrevNext: TextItemWithPrevNext = {
      ...item,
      prev: itemsRaw[index - 1],
      next: itemsRaw[index + 1],
    };
    return itemWithPrevNext;
  });

  // Find all day items (x near 49)
  const dayItems = items
    .filter((item) => isBetween(item.left, 46, 49))
    .filter((item) => item.str.length === 2 && parseInt(item.str) > 0)
    .filter((item) =>
      threeCharMonthNames.includes(item.next?.str.toUpperCase() ?? '')
    );
  console.log('dayItems:', dayItems);
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
    // console.log(`candidateWords for ${dayItem.str}:`, candidateWords);

    // Find month item (x near 60, same y as day)
    const monthItem = candidateWords.find((item) =>
      isBetween(item.left, 56, 60)
    );

    // Find amount item (x near 550, same y as day)
    const amountItem = candidateWords.find((item) =>
      isBetween(item.right, 562.5, 566.2)
    );

    // Find description words left over.
    const descriptionWords = candidateWords.filter(
      (item) => item !== dayItem && item !== monthItem && item !== amountItem
    );

    const groupedByY = groupBy(descriptionWords, 'top');
    // console.log('groupedByY:', groupedByY);
    const description = Object.values(groupedByY).map((items) =>
      items.map((textItem) => textItem.str).join(' ')
    );

    if (monthItem && amountItem) {
      const amountFormatted = amountItem.str;
      let amount = 0;
      if (amountFormatted.startsWith('(')) {
        // const withoutBrackets = amountFormatted.substring(1, amountFormatted.length - 1);
        const withoutBrackets = amountFormatted.replaceAll(/([(),])/g, '');
        // console.log('withoutBrackets', withoutBrackets);
        amount = parseFloat(withoutBrackets);
        amount *= -1;
      } else {
        amount = parseFloat(amountFormatted);
      }

      const date = parseDayMonth(dayItem.str, monthItem.str);

      transactions.push({
        key: uuidv4(),
        day: dayItem.str,
        month: monthItem.str,
        date,
        dateFormatted: format(date, 'd MMM'),
        descriptionWords,
        description,
        amountFormatted: amountItem.str,
        amount,
        top: currentY,
        bottom: nextY,
      });
    } else {
      console.log(
        `${monthItem ? '' : 'monthItem'}${amountItem ? '' : 'amountItem'} not found:`,
        dayItem
      );
    }
  }

  return transactions;
};
