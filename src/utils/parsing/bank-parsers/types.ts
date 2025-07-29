import { TransactionItem } from '../identify-transaction-items';
import { WordItem } from '../consolidate-date';

export interface BankParser {
  /**
   * Identifies transaction items from a list of word items
   * @param itemsRaw - Raw word items from PDF
   * @returns Array of transaction items
   */
  identifyTransactionItems(itemsRaw: WordItem[]): TransactionItem[];
  
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