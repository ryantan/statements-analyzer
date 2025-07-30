import { Transaction } from '@/features/transactions/types';

import { TextItem } from 'pdfjs-dist/types/src/display/api';

export type TextItemWithPositioning = TextItem & {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type TextItemWithPrevNext = WordItem & {
  prev?: WordItem;
  next?: WordItem;
};

export type WordItem = TextItemWithPositioning & {
  items: TextItem[];
};

export type TransactionItem = Transaction & {
  descriptionWords: WordItem[];
  top: number;
  bottom: number;
};
