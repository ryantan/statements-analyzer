import { Transaction } from '@/features/transactions/types';
import { groupByDelimiters } from '@/utils/parsing/consolidate-date';
import { isNotRotated } from '@/utils/parsing/filter-rotated';
import {
  TransactionItem,
  identifyTransactionItems,
} from '@/utils/parsing/identify-transaction-items';
import { transformToViewport } from '@/utils/pdf';

import pick from 'lodash/pick';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

const removeIntermediateProperties = (
  transaction: TransactionItem
): Transaction => {
  const requiredProps = pick(transaction, [
    'key',
    'day',
    'month',
    'date',
    'dateFormatted',
    'description',
    'amountFormatted',
    'amount',
  ]) as Transaction;

  return {
    ...requiredProps,
    // Any extra processing here.
  } as Transaction;
};

export const extractTransactionsFromPdf = async (
  arrayBuffer: ArrayBuffer
): Promise<Transaction[]> => {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const numOfPages = pdf.numPages;
  console.log('numOfPages:', numOfPages);

  const allTransactions: TransactionItem[] = [];

  // Extract transactions from all pages
  for (let pageNum = 1; pageNum <= numOfPages; pageNum++) {
    console.log('pageNum:', pageNum);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent({
      includeMarkedContent: false,
    });
    // console.log('textContent:', textContent);

    const textItems = textContent.items as TextItem[];

    const transformedItems = transformToViewport(page, textItems);

    const nonRotated = transformedItems.filter(isNotRotated);
    const groupedByDelimiters = groupByDelimiters(nonRotated);
    // console.log('groupedByDelimiters:', groupedByDelimiters);

    const transactions = identifyTransactionItems(groupedByDelimiters);
    console.log('transactions:', transactions);

    allTransactions.push(...transactions);
  }
  console.log('allTransactions:', allTransactions);

  return allTransactions.map(removeIntermediateProperties);
};
