import { TransactionItem } from '@/utils/parsing/types';

import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

export interface BankParser {
  /**
   * Identifies transaction items from a list of word items
   * @param itemsRaw - Raw word items from PDF
   * @param page
   * @returns Array of transaction items
   */
  identifyTransactionItems(
    itemsRaw: TextItem[],
    page: PDFPageProxy
  ): TransactionItem[];

  /**
   * Name of the bank this parser handles
   */
  readonly bankName: string;

  /**
   * Version of the parser (useful for handling format changes)
   */
  readonly version: string;
}

export type BankName = 'Citibank' | 'OCBC' | 'Unknown';

export interface BankParserFactory {
  /**
   * Creates a parser for the specified bank
   * @param bankName - Name of the bank
   * @returns Bank parser instance
   */
  createParser(bankName: BankName): BankParser;

  /**
   * Gets list of supported banks
   */
  getSupportedBanks(): BankName[];
}
