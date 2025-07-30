import { CitibankParser } from './banks/CitibankParser';
import { OCBCParser } from './banks/OCBCParser';
import { UnknownBankParser } from './banks/UnknownBankParser';
import { BankName, BankParser, BankParserFactory } from './types';

export class BankParserFactoryImpl implements BankParserFactory {
  private parsers: Map<BankName, BankParser> = new Map();

  constructor() {
    // Initialize all parsers
    this.parsers.set('Citibank', new CitibankParser());
    this.parsers.set('OCBC', new OCBCParser());
    this.parsers.set('Unknown', new UnknownBankParser());
  }

  createParser(bankName: BankName): BankParser {
    const parser = this.parsers.get(bankName);
    if (!parser) {
      console.warn(
        `No parser found for bank: ${bankName}, using Unknown parser`
      );
      return this.parsers.get('Unknown')!;
    }
    return parser;
  }

  getSupportedBanks(): BankName[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Register a new bank parser
   * @param bankName - Name of the bank
   * @param parser - Parser instance
   */
  registerParser(bankName: BankName, parser: BankParser): void {
    this.parsers.set(bankName, parser);
  }

  /**
   * Get parser info for debugging
   */
  getParserInfo(): Array<{ bankName: BankName; version: string }> {
    return Array.from(this.parsers.entries()).map(([bankName, parser]) => ({
      bankName,
      version: parser.version,
    }));
  }
}

// Export a singleton instance
export const bankParserFactory = new BankParserFactoryImpl();
