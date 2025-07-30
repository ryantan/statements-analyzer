import { TextItemWithPositioning } from '@/features/parsing/types';

import { sortBy } from 'lodash';
import groupBy from 'lodash/groupBy';

/**
 * Groups TextItems by their bottom position and sort from top to bottom.
 *
 * Each line is also sorted from left to right.
 *
 * @param items
 */
export const groupBySortedBottom = (
  items: TextItemWithPositioning[]
): Map<number, TextItemWithPositioning[]> => {
  // We use bottom, as spaces have 0 height so they would have different top as characters, even when on the same line.
  const groupedByLines = groupBy(items, 'bottom');
  console.log('[groupBySortedBottom] groupedByLines:', groupedByLines);

  const uniqueLines = Object.keys(groupedByLines).map((line) =>
    parseFloat(line)
  );
  const uniqueLinesSorted = sortBy(uniqueLines);

  const output = new Map<number, TextItemWithPositioning[]>();

  for (const bottom of uniqueLinesSorted) {
    console.log(`[groupByDelimiters] processing line ${bottom}`);
    const itemsInLine = groupedByLines[bottom];
    const items = sortBy(itemsInLine, 'left');
    output.set(bottom, items);
  }
  return output;
};
