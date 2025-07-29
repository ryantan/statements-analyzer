import { Transaction } from '@/features/transactions/types';

import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/unionBy';

export const findPotentialDuplicates = (transactions: Transaction[]) => {
  const uniqueFunction = (item: Transaction) =>
    `${item.dateFormatted}|${item.amountFormatted}|${item.description.join(' ')}|${item.bank || ''}|${item.bankAccount || ''}|${item.fileName || ''}`;

  const duplicateCheck = uniqBy(transactions, uniqueFunction);
  console.log('Items in allTransactions:', transactions.length);
  console.log('Items in duplicateCheck:', duplicateCheck.length);

  const potentialDuplicates = transactions.length - duplicateCheck.length;
  if (potentialDuplicates > 0) {
    console.log(`${potentialDuplicates} potential duplicates found.`);

    const duplicates = groupBy(transactions, uniqueFunction);
    for (const duplicateGroup of Object.values(duplicates)) {
      if (duplicateGroup.length === 1) {
        continue;
      }
      console.log('Duplicate group:', duplicateGroup);
    }
  }
};
